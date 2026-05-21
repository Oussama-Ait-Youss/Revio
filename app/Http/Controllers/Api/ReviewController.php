<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Server;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * GET all reviews (admin only)
     */
    public function index()
    {
        $reviews = Review::with('server')
            ->latest()
            ->get();

        return response()->json([
            'data' => $reviews
        ]);
    }

    /**
     * STORE review (public / NFC flow later)
     */
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

        // classification logic (NOT stored in DB)
        $isPositive = $request->rating >= 4;

        $review = Review::create([
            'server_id' => $server->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        // update server stats
        $server->increment('total_reviews');

        return response()->json([
            'message' => 'Review submitted successfully',
            'data' => $review,
            'classification' => $isPositive ? 'positive' : 'internal'
        ], 201);
    }
}