<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\NfcRequest;
use Illuminate\Support\Facades\Validator;

class NfcRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Ensure user is MANAGER and has a restaurant
        if (!$user->role || $user->role->name !== \App\Models\Role::MANAGER || !$user->restaurant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $requests = NfcRequest::where('restaurant_id', $user->restaurant_id)
            ->orderBy('created_at', 'desc')
            ->get();

        $metrics = [
            'total_active' => \App\Models\NfcCard::where('restaurant_id', $user->restaurant_id)->whereNotNull('server_id')->count(),
            'available_inventory' => \App\Models\NfcCard::where('restaurant_id', $user->restaurant_id)->whereNull('server_id')->count(),
            'pending_requests' => NfcRequest::where('restaurant_id', $user->restaurant_id)->where('status', 'PENDING')->count(),
        ];

        return response()->json([
            'requests' => $requests,
            'metrics' => $metrics
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Ensure user is MANAGER
        if (!$user->role || $user->role->name !== \App\Models\Role::MANAGER) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1|max:50',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $nfcRequest = NfcRequest::create([
            'restaurant_id' => $user->restaurant_id,
            'quantity' => $request->quantity,
            'notes' => $request->notes,
            'status' => 'PENDING',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nfc card request submitted successfully!',
            'data' => $nfcRequest
        ], 201);
    }
}
