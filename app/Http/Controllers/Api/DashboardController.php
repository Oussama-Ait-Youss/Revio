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
        $serverRole = Role::where('name', Role::SERVER)->first();

        // 1. Total servers
        $totalServers = User::where('role_id', $serverRole->id)->count();

        // 2. Total reviews
        $totalReviews = Review::count();

        // 3. Total NFC Cards & Active NFC Cards
        $totalNfcCards = NfcCard::count();
        $assignedNfcCards = NfcCard::whereNotNull('server_id')->count();

        // 4. Reviews per server for the graph
        $servers = User::where('role_id', $serverRole->id)
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
}
