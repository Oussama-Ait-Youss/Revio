<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NfcCard;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NfcCardController extends Controller
{
    /**
     * GET all NFC cards
     */
    public function index()
    {
        $cards = NfcCard::with('server')->latest()->get();

        return response()->json([
            'data' => $cards
        ]);
    }

    /**
     * CREATE + ASSIGN NFC CARD
     */
    public function store(Request $request)
    {
        $request->validate([
            'server_id' => 'nullable|exists:servers,id',
        ]);

        $card = NfcCard::create([
            'uid' => 'NFC_' . strtoupper(Str::random(10)),
            'public_token' => Str::random(32),
            'qr_code_url' => null, // you can generate later
            'is_active' => true,
            'assigned_at' => $request->server_id ? now() : null,
            'server_id' => $request->server_id,
        ]);

        return response()->json([
            'message' => 'NFC card created successfully',
            'data' => $card->load('server')
        ], 201);
    }

    /**
     * ASSIGN / REASSIGN CARD TO SERVER
     */
    public function assign(Request $request, $id)
    {
        $request->validate([
            'server_id' => 'required|exists:servers,id',
        ]);

        $card = NfcCard::find($id);

        if (!$card) {
            return response()->json([
                'message' => 'NFC card not found'
            ], 404);
        }

        $card->update([
            'server_id' => $request->server_id,
            'assigned_at' => now(),
        ]);

        return response()->json([
            'message' => 'Card assigned successfully',
            'data' => $card->load('server')
        ]);
    }

    /**
     * ACTIVATE / DEACTIVATE CARD
     */
    public function toggle($id)
    {
        $card = NfcCard::find($id);

        if (!$card) {
            return response()->json([
                'message' => 'NFC card not found'
            ], 404);
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
    public function destroy($id)
    {
        $card = NfcCard::find($id);

        if (!$card) {
            return response()->json([
                'message' => 'NFC card not found'
            ], 404);
        }

        $card->delete();

        return response()->json([
            'message' => 'NFC card deleted successfully'
        ]);
    }
}