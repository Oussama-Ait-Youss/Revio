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

    $review = Review::create([
        'server_id' => $server->id,
        'rating' => $request->rating,
        'comment' => $request->comment,
    ]);

    $server->increment('total_reviews');

    // DECISION LOGIC
    $isPositive = $request->rating >= 4;

    return response()->json([
        'message' => 'Review submitted successfully',
        'redirect_to_google' => $isPositive ? true : false,
        'google_url' => $isPositive ? $server->google_review_url : null,
    ], 201);
}
}