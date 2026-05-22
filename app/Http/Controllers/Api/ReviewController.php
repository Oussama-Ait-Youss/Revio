<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NfcCard;
use App\Models\Review;
use App\Models\Server;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function store(Request $request)
{
    $request->validate([
        'server_id' => 'required|exists:servers,id',
        'rating' => 'required|integer|min:1|max:5',
        'comment' => 'nullable|string',
    ]);

    $server = Server::find($request->server_id);

    if (!$server) {
        return response()->json([
            'message' => 'Server not found'
        ], 404);
    }
        public function getServerByToken($token)
    {
        $card = NfcCard::where('public_token', $token)
            ->where('is_active', true)
            ->with('server.user')
            ->first();

        if (!$card) {
            return response()->json([
                'message' => 'Invalid or inactive NFC card.'
            ], 404);
        }

        if (!$card->server) {
            return response()->json([
                'message' => 'No server assigned to this card.'
            ], 404);
        }

        return response()->json([
            'server_id'   => $card->server->id,
            'server_name' => $card->server->user->full_name,
            'token'       => $token,
        ]);
    }
}