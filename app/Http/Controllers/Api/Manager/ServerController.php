<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Models\Server;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ServerController extends Controller
{
    public function index()
    {
        $servers = Server::with('user')->withCount('reviews')->get();

        return response()->json([
            'data' => $servers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make(Str::random(12)),
            'role' => 'SERVER'
        ]);

        $server = Server::create([
            'user_id' => $user->id,
            'phone' => $request->phone,
        ]);

        // Load the user relation for the response
        $server->load('user');

        return response()->json([
            'message' => 'Server created successfully',
            'server' => $server
        ], 201);
    }
}
