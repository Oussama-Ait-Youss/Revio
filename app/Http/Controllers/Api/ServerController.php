<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Server;
use App\Models\User;
use App\Models\Role;
use App\Models\NfcCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ServerController extends Controller
{
    // display servers
    public function index(Request $request){
        $user = $request->user();
        $serverRole = Role::where('name', Role::SERVER)->first();
        
        $query = User::where('role_id', $serverRole->id)
            ->with('restaurant')
            ->with(['server' => function ($query) {
                $query->withCount('reviews')->withAvg('reviews', 'rating')->with('nfcCard');
            }]);

        $nfcCardsQuery = NfcCard::query();

        if ($user->role && $user->role->name === Role::MANAGER) {
            $restaurantId = $user->restaurant_id;
            $query->where('restaurant_id', $restaurantId);
            $nfcCardsQuery->where('restaurant_id', $restaurantId);
        }

        $servers = $query->get();
        $nfcCards = $nfcCardsQuery->get();

        return response()->json([
            'data' => $servers,
            'nfc_cards' => $nfcCards
        ]);
    }

    // create a server
    public function store(Request $request){
        $currentUser = $request->user();
        
        $validationRules = [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
            'nfc_card_id' => [
                'nullable',
                'exists:nfc_cards,id',
                function ($attribute, $value, $fail) use ($currentUser, $request) {
                    $card = NfcCard::find($value);
                    if ($card && $card->server_id !== null) {
                        $fail('This NFC card is already assigned to another server.');
                    }
                    if ($currentUser->role && $currentUser->role->name === Role::MANAGER) {
                        if ($card && $card->restaurant_id !== $currentUser->restaurant_id) {
                            $fail('This NFC card does not belong to your restaurant.');
                        }
                    }
                    if ($currentUser->role && $currentUser->role->name === Role::ADMIN) {
                        if ($card && (int) $card->restaurant_id !== (int) $request->input('restaurant_id')) {
                            $fail('This NFC card does not belong to the selected restaurant.');
                        }
                    }
                },
            ]
        ];

        if ($currentUser->role && $currentUser->role->name === Role::ADMIN) {
            $validationRules['restaurant_id'] = 'required|exists:restaurants,id';
        }

        $data = $request->validate($validationRules);

        if ($currentUser->role && $currentUser->role->name === Role::MANAGER) {
            $restaurantId = $currentUser->restaurant_id;
            if ($restaurantId === null) {
                return response()->json(['message' => 'You must set up your restaurant first.'], 400);
            }
        } else {
            $restaurantId = $data['restaurant_id'];
        }

        $serverRole = Role::where('name', Role::SERVER)->first();

        $user = User::create([
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role_id' => $serverRole->id,
            'restaurant_id' => $restaurantId,
            'is_active' => true,
        ]);

        $server = Server::create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurantId,
            'phone' => $data['phone'] ?? null,
            'total_reviews' => 0,
        ]);

        if (!empty($data['nfc_card_id'])) {
            $card = NfcCard::find($data['nfc_card_id']);
            $card->update([
                'server_id' => $server->id,
                'assigned_at' => now(),
            ]);
        }

        return response()->json($user->load('server.nfcCard'), 201);
    }
    
    // UPDATE server
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();

        if ($currentUser->role && $currentUser->role->name === Role::MANAGER) {
            if ($user->restaurant_id !== $currentUser->restaurant_id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $validationRules = [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string',
            'nfc_card_id' => [
                'nullable',
                'exists:nfc_cards,id',
                function ($attribute, $value, $fail) use ($user, $currentUser, $request) {
                    $card = NfcCard::find($value);
                    $serverId = $user->server ? $user->server->id : null;
                    if ($card && $card->server_id !== null && $card->server_id !== $serverId) {
                        $fail('This NFC card is already assigned to another server.');
                    }
                    if ($currentUser->role && $currentUser->role->name === Role::MANAGER) {
                        if ($card && $card->restaurant_id !== $currentUser->restaurant_id) {
                            $fail('This NFC card does not belong to your restaurant.');
                        }
                    }
                    if ($currentUser->role && $currentUser->role->name === Role::ADMIN) {
                        if ($card && (int) $card->restaurant_id !== (int) $request->input('restaurant_id')) {
                            $fail('This NFC card does not belong to the selected restaurant.');
                        }
                    }
                },
            ]
        ];

        if ($currentUser->role && $currentUser->role->name === Role::ADMIN) {
            $validationRules['restaurant_id'] = 'required|exists:restaurants,id';
        }

        $request->validate($validationRules);

        $user->update([
            'full_name' => $request->full_name,
            'email' => $request->email,
        ]);

        if ($currentUser->role && $currentUser->role->name === Role::ADMIN && $request->filled('restaurant_id')) {
            $user->update([
                'restaurant_id' => $request->restaurant_id
            ]);
        }

        if ($request->filled('password')) {
            $user->update([
                'password' => Hash::make($request->password)
            ]);
        }

        $server = Server::firstOrCreate(
            ['user_id' => $user->id],
            ['restaurant_id' => $user->restaurant_id ?? $currentUser->restaurant_id]
        );
        
        $server->update([
            'restaurant_id' => $user->restaurant_id ?? $server->restaurant_id,
            'phone' => $request->phone,
        ]);

        if ($request->has('nfc_card_id')) {
            // Unassign old card if any
            if ($server->nfcCard && $server->nfcCard->id != $request->nfc_card_id) {
                $server->nfcCard->update(['server_id' => null, 'assigned_at' => null]);
            }
            // Assign new card
            if ($request->nfc_card_id) {
                $card = NfcCard::find($request->nfc_card_id);
                $card->update([
                    'server_id' => $server->id,
                    'assigned_at' => now(),
                ]);
            } else if ($server->nfcCard) {
                $server->nfcCard->update(['server_id' => null, 'assigned_at' => null]);
            }
        }

        return response()->json($user->load('server.nfcCard'));
    }

    // DELETE server
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();

        if ($currentUser->role && $currentUser->role->name === Role::MANAGER) {
            if ($user->restaurant_id !== $currentUser->restaurant_id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        if ($user->server && $user->server->nfcCard) {
            $user->server->nfcCard->update(['server_id' => null, 'assigned_at' => null]);
        }

        $user->delete();

        return response()->json([
            'message' => 'Server deleted successfully'
        ]);
    }

    // GET single server
    public function show(Request $request, $id)
    {
        $user = User::with(['server' => function ($query) {
            $query->withCount('reviews')->withAvg('reviews', 'rating')->with('nfcCard');
        }])->findOrFail($id);

        $currentUser = $request->user();
        if ($currentUser->role && $currentUser->role->name === Role::MANAGER) {
            if ($user->restaurant_id !== $currentUser->restaurant_id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        return response()->json($user);
    }

    // get my reviews
    public function myReviews(Request $request)
    {
        $user = $request->user();
    
        $server = Server::where('user_id', $user->id)
            ->with(['user', 'nfcCard', 'reviews'])
            ->withCount('reviews')
            ->first();
    
        if (!$server) {
            return response()->json([
                'message' => 'No server profile found'
            ], 404);
        }
    
        $reviews = $server->reviews->sortByDesc('created_at');
    
        return response()->json([
            'server' => $server,
            'reviews' => $reviews
        ]);
    }
}
