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
            'public_token' => 'required|exists:nfc_cards,public_token',
            'service_rating' => 'required|integer|min:1|max:5',
            'food_rating' => 'required|integer|min:1|max:5',
            'cleanliness_rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'is_anonymous' => 'boolean'
        ]);

        // 1. Find the NFC Card and Server
        $card = NfcCard::where('public_token', $request->public_token)
                       ->where('is_active', true)
                       ->firstOrFail();

        // 2. Calculate Overall Rating
        $overall = ($request->service_rating + $request->food_rating + $request->cleanliness_rating) / 3;

        // 3. Determine Status based on your Business Logic
        $status = Review::STATUS_PENDING;
        if ($overall <= 2) {
            $status = Review::STATUS_CRITICAL;
        }

        // 4. Use a Transaction to ensure data integrity
        return DB::transaction(function () use ($request, $card, $overall, $status) {
            
            $review = Review::create([
                'server_id' => $card->server_id,
                'service_rating' => $request->service_rating,
                'food_rating' => $request->food_rating,
                'cleanliness_rating' => $request->cleanliness_rating,
                'overall_rating' => $overall,
                'comment' => $request->comment,
                'is_anonymous' => $request->is_anonymous ?? false,
                'status' => $status,
            ]);

            // 5. Update Server Stats
            Server::where('id', $card->server_id)->increment('total_reviews');

            return response()->json([
                'message' => 'Thank you for your feedback!',
                'status' => $status
            ], 201);
        });
    }
}