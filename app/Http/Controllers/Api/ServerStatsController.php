<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\Review;

class ServerStatsController extends Controller
{
    public function getStats(Request $request)
    {
        $user = $request->user();

        // Authentication Catch: Ensure role is SERVER
        if (!$user->role || $user->role->name !== Role::SERVER) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $server = $user->server;

        if (!$server) {
            return response()->json(['message' => 'Server profile not found'], 404);
        }

        // Metrics Aggregation
        $averageRating = Review::where('server_id', $server->id)->avg('rating');
        $totalReviews = Review::where('server_id', $server->id)->count();

        // Feedback Feed Query
        $feed = Review::where('server_id', $server->id)
            ->whereNotNull('comment')
            ->where('comment', '!=', '')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->select('id', 'rating', 'comment', 'created_at')
            ->get();

        // JSON Delivery Format
        return response()->json([
            'status' => 'success',
            'metrics' => [
                'average_rating' => $averageRating ? round($averageRating, 1) : 0,
                'total_reviews' => $totalReviews
            ],
            'feed' => $feed
        ]);
    }
}
