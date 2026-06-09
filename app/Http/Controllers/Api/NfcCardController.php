<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NfcCard;
use App\Models\Server;
use App\Models\Role;
use Illuminate\Http\Request;
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
            $server = Server::findOrFail($request->server_id);
            if ($currentUser->role && $currentUser->role->name === Role::MANAGER) {
                if ($server->restaurant_id !== $restaurantId) {
                    return response()->json(['message' => 'Server does not belong to your restaurant.'], 403);
                }
            }
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

        $card = NfcCard::find($id);

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

        $server = Server::findOrFail($request->server_id);
        if ($currentUser->role && $currentUser->role->name === Role::MANAGER) {
            if ($server->restaurant_id !== $currentUser->restaurant_id) {
                return response()->json(['message' => 'Server does not belong to your restaurant.'], 403);
            }
        }

        $card->update([
            'server_id' => $request->server_id,
            'assigned_at' => now(),
        ]);

        return response()->json([
            'message' => 'Card assigned successfully',
            'data' => $card->load('server.user')
        ]);
    }

    /**
     * ACTIVATE / DEACTIVATE CARD
     */
    public function toggle(Request $request, $id)
    {
        $currentUser = $request->user();
        $card = NfcCard::find($id);

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
        $card = NfcCard::find($id);

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