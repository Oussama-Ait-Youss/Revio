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
    public function index(Request $request)
    {
        $query = Review::with(['server.user']);
        $user = $request->user();

        if ($user && $user->role && $user->role->name === \App\Models\Role::MANAGER) {
            $query->where('restaurant_id', $user->restaurant_id);
        }

        if ($request->filled('server_id')) {
            if (
                $user?->role?->name === \App\Models\Role::MANAGER
                && !Server::where('restaurant_id', $user->restaurant_id)
                    ->whereKey($request->server_id)
                    ->exists()
            ) {
                return response()->json(['message' => 'Server not found.'], 404);
            }

            $query->where('server_id', $request->server_id);
        }

        if ($request->filled('rating')) {
            $rating = $request->rating;
            if (str_contains($rating, ',')) {
                $ratings = array_filter(array_map('trim', explode(',', $rating)), 'strlen');
                $query->whereIn('rating', $ratings);
            } else {
                $query->where('rating', $rating);
            }
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $reviews = $query->orderBy('created_at', 'desc')->get();

        return response()->json($reviews);
    }

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
            'restaurant_id' => $server->restaurant_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        $server->increment('total_reviews');

        return response()->json($review->load('server.user'), 201);
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
