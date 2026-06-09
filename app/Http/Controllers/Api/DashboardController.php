<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NfcCard;
use App\Models\Review;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $serverRole = Role::where('name', Role::SERVER)->firstOrFail();

        if ($user->role && $user->role->name === Role::ADMIN) {
            $totalRestaurants = \App\Models\Restaurant::count();
            $totalNfcCards = NfcCard::count();
            $totalReviews = Review::count();

            return response()->json([
                'total_restaurants' => $totalRestaurants,
                'total_nfc_cards' => $totalNfcCards,
                'total_reviews' => $totalReviews,
            ]);
        }

        if ($user->role && $user->role->name === Role::MANAGER) {
            $restaurantId = $user->restaurant_id;

            if ($restaurantId === null) {
                return response()->json([
                    'total_servers' => 0,
                    'total_reviews' => 0,
                    'total_nfc_cards' => 0,
                    'assigned_nfc_cards' => 0,
                    'reviews_per_server' => [],
                ]);
            }

            // 1. Total servers under this restaurant
            $totalServers = User::where('role_id', $serverRole->id)
                ->where('restaurant_id', $restaurantId)
                ->count();

            // 2. Total reviews under this restaurant
            $totalReviews = Review::where('restaurant_id', $restaurantId)->count();

            // 3. Total NFC Cards & Active NFC Cards under this restaurant
            $totalNfcCards = NfcCard::where('restaurant_id', $restaurantId)->count();
            $assignedNfcCards = NfcCard::where('restaurant_id', $restaurantId)->whereNotNull('server_id')->count();

            // 4. Reviews per server for the graph
            $servers = User::where('role_id', $serverRole->id)
                ->where('restaurant_id', $restaurantId)
                ->with('server.reviews')
                ->get();

            $reviewsPerServer = $servers->map(function ($user) {
                $count = 0;
                if ($user->server && $user->server->reviews) {
                    $count = $user->server->reviews->count();
                }
                return [
                    'name' => $user->full_name,
                    'reviews' => $count,
                ];
            })->sortByDesc('reviews')->values();

            return response()->json([
                'total_servers' => $totalServers,
                'total_reviews' => $totalReviews,
                'total_nfc_cards' => $totalNfcCards,
                'assigned_nfc_cards' => $assignedNfcCards,
                'reviews_per_server' => $reviewsPerServer,
            ]);
        }

        return response()->json(['message' => 'Unauthorized.'], 403);
    }
}
