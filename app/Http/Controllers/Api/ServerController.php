<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Server;
use Illuminate\Http\Request;

class ServerController extends Controller
{
    // display servers
    public function index(){
        $serverRole = \App\Models\Role::where('name', \App\Models\Role::SERVER)->first();
        
        $servers = \App\Models\User::where('role_id', $serverRole->id)
            ->with(['server' => function ($query) {
                $query->withCount('reviews')->with('nfcCard');
            }])
            ->get();

        $nfcCards = \App\Models\NfcCard::all();

        return response()->json([
            'data' => $servers,
            'nfc_cards' => $nfcCards
        ]);
    }

    // create a server
    public function store(Request $request){
        $data = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
            'nfc_card_id' => [
                'nullable',
                'exists:nfc_cards,id',
                function ($attribute, $value, $fail) {
                    $card = \App\Models\NfcCard::find($value);
                    if ($card && $card->server_id !== null) {
                        $fail('This NFC card is already assigned to another server.');
                    }
                },
            ]
        ]);

        $serverRole = \App\Models\Role::where('name', \App\Models\Role::SERVER)->first();

        $user = \App\Models\User::create([
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
            'role_id' => $serverRole->id,
            'is_active' => true,
        ]);

        $server = Server::create([
            'user_id' => $user->id,
            'phone' => $data['phone'] ?? null,
            'total_reviews' => 0,
        ]);

        if (!empty($data['nfc_card_id'])) {
            $card = \App\Models\NfcCard::find($data['nfc_card_id']);
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
        $user = \App\Models\User::findOrFail($id);

        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string',
            'nfc_card_id' => [
                'nullable',
                'exists:nfc_cards,id',
                function ($attribute, $value, $fail) use ($user) {
                    $card = \App\Models\NfcCard::find($value);
                    $serverId = $user->server ? $user->server->id : null;
                    if ($card && $card->server_id !== null && $card->server_id !== $serverId) {
                        $fail('This NFC card is already assigned to another server.');
                    }
                },
            ]
        ]);

        $user->update([
            'full_name' => $request->full_name,
            'email' => $request->email,
        ]);

        if ($request->filled('password')) {
            $user->update([
                'password' => \Illuminate\Support\Facades\Hash::make($request->password)
            ]);
        }

        $server = Server::firstOrCreate(['user_id' => $user->id]);
        $server->update([
            'phone' => $request->phone,
        ]);

        if ($request->has('nfc_card_id')) {
            // Unassign old card if any
            if ($server->nfcCard && $server->nfcCard->id != $request->nfc_card_id) {
                $server->nfcCard->update(['server_id' => null, 'assigned_at' => null]);
            }
            // Assign new card
            if ($request->nfc_card_id) {
                $card = \App\Models\NfcCard::find($request->nfc_card_id);
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
    public function destroy($id)
    {
        $user = \App\Models\User::findOrFail($id);

        if ($user->server && $user->server->nfcCard) {
            $user->server->nfcCard->update(['server_id' => null, 'assigned_at' => null]);
        }

        $user->delete();

        return response()->json([
            'message' => 'Server deleted successfully'
        ]);
    }

    // GET single server
    public function show($id)
    {
        return response()->json(
            \App\Models\User::with(['server' => function ($query) {
                $query->withCount('reviews')->with('nfcCard');
            }])->findOrFail($id)
        );
    }
    // get my reviews
    public function myReviews(Request $request)
    {
        $user = $request->user();
    
        $server = Server::where('user_id', $user->id)
            ->with('user')
            ->withCount('reviews')
            ->first();
    
        if (!$server) {
            return response()->json([
                'message' => 'No server profile found'
            ], 404);
        }
    
        $reviews = $server->reviews()->latest()->get();
    
        return response()->json([
            'server' => $server,
            'reviews' => $reviews
        ]);
    }
}
