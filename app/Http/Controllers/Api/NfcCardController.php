<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NfcCard;
use App\Models\Server;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NfcCardController extends Controller
{
    /**
     * GET all NFC cards
     */
    public function index(Request $request)
    {
        $currentUser = $request->user();
        $query = NfcCard::with('server.user')->latest();

        if ($currentUser->role && $currentUser->role->name === Role::MANAGER) {
            $query->where('restaurant_id', $currentUser->restaurant_id);
        }

        $cards = $query->get();

        return response()->json([
            'data' => $cards
        ]);
    }

    /**
     * CREATE + ASSIGN NFC CARD
     */
    public function store(Request $request)
    {
        $currentUser = $request->user();

        $validationRules = [
            'uid' => 'required|string|unique:nfc_cards,uid',
            'public_token' => 'required|string|unique:nfc_cards,public_token',
            'qr_code_url' => 'nullable|url',
            'server_id' => 'nullable|exists:servers,id',
        ];

        if ($currentUser->role && $currentUser->role->name === Role::ADMIN) {
            $validationRules['restaurant_id'] = 'required|exists:restaurants,id';
        }

        $request->validate($validationRules);

        if ($currentUser->role && $currentUser->role->name === Role::MANAGER) {
            $restaurantId = $currentUser->restaurant_id;
            if ($restaurantId === null) {
                return response()->json(['message' => 'You must set up your restaurant first.'], 400);
            }
        } else {
            $restaurantId = $request->restaurant_id;
        }

        if ($request->server_id) {
            $server = Server::where('restaurant_id', $restaurantId)
                ->whereHas('user', fn ($query) => $query->where('is_active', true))
                ->findOrFail($request->server_id);
        }

        $card = NfcCard::create([
            'uid' => $request->uid,
            'public_token' => $request->public_token,
            'qr_code_url' => $request->qr_code_url,
            'restaurant_id' => $restaurantId,
            'is_active' => true,
            'assigned_at' => $request->server_id ? now() : null,
            'server_id' => $request->server_id,
        ]);

        return response()->json([
            'message' => 'NFC card created successfully',
            'data' => $card->load('server.user')
        ], 201);
    }

    /**
     * ASSIGN / REASSIGN CARD TO SERVER
     */
    public function assign(Request $request, $id)
    {
        $currentUser = $request->user();

        $request->validate([
            'server_id' => 'required|exists:servers,id',
        ]);

        $cardQuery = NfcCard::query();
        if ($currentUser->role?->name === Role::MANAGER) {
            $cardQuery->where('restaurant_id', $currentUser->restaurant_id);
        }
        $card = $cardQuery->find($id);

        if (!$card) {
            return response()->json([
                'message' => 'NFC card not found'
            ], 404);
        }

        if ($currentUser->role && $currentUser->role->name === Role::MANAGER) {
            if ($card->restaurant_id !== $currentUser->restaurant_id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $restaurantId = $currentUser->role?->name === Role::MANAGER
            ? $currentUser->restaurant_id
            : $card->restaurant_id;

        $server = Server::where('restaurant_id', $restaurantId)
            ->whereHas('user', fn ($query) => $query->where('is_active', true))
            ->findOrFail($request->server_id);

        DB::transaction(function () use ($card, $server, $restaurantId) {
            $lockedCard = NfcCard::where('restaurant_id', $restaurantId)
                ->where('is_active', true)
                ->whereKey($card->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedCard->server_id !== null) {
                abort(422, 'Only unassigned cards can be linked to an employee.');
            }

            NfcCard::where('restaurant_id', $restaurantId)
                ->where('server_id', $server->id)
                ->update(['server_id' => null, 'assigned_at' => null]);

            $lockedCard->update([
                'server_id' => $server->id,
                'assigned_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Card assigned successfully',
            'data' => $card->fresh()->load('server.user')
        ]);
    }

    /**
     * ACTIVATE / DEACTIVATE CARD
     */
    public function toggle(Request $request, $id)
    {
        $currentUser = $request->user();
        $cardQuery = NfcCard::query();
        if ($currentUser->role?->name === Role::MANAGER) {
            $cardQuery->where('restaurant_id', $currentUser->restaurant_id);
        }
        $card = $cardQuery->find($id);

        if (!$card) {
            return response()->json([
                'message' => 'NFC card not found'
            ], 404);
        }

        if ($currentUser->role && $currentUser->role->name === Role::MANAGER) {
            if ($card->restaurant_id !== $currentUser->restaurant_id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $card->update([
            'is_active' => !$card->is_active,
        ]);

        return response()->json([
            'message' => 'Card status updated',
            'data' => $card
        ]);
    }

    /**
     * DELETE CARD
     */
    public function destroy(Request $request, $id)
    {
        $currentUser = $request->user();
        $cardQuery = NfcCard::query();
        if ($currentUser->role?->name === Role::MANAGER) {
            $cardQuery->where('restaurant_id', $currentUser->restaurant_id);
        }
        $card = $cardQuery->find($id);

        if (!$card) {
            return response()->json([
                'message' => 'NFC card not found'
            ], 404);
        }

        if ($currentUser->role && $currentUser->role->name === Role::MANAGER) {
            if ($card->restaurant_id !== $currentUser->restaurant_id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $card->delete();

        return response()->json([
            'message' => 'NFC card deleted successfully'
        ]);
    }
}
