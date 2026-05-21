<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Server;
use Illuminate\Http\Request;

class ServerController extends Controller
{
    // display servers
    public function index(){
        return response()->json(
            Server::with('user')->get()
        );
    }

    // create a server
    public function store(Request $request){
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'phone' => 'nullable|string',
        ]);

        $server = Server::create([
            'user_id' => $data['user_id'],
            'phone' => $data['phone'] ?? null,
            'total_reviews' => 0,
        ]);

        return response()->json($server->load('user'), 201);
    }
    // UPDATE server
    public function update(Request $request, $id)
    {
        $server = Server::findOrFail($id);

        $server->update($request->only([
            'phone',
            'total_reviews'
        ]));

        return response()->json($server->load('user'));
    }

    // DELETE server
    public function destroy($id)
    {
        $server = Server::findOrFail($id);
        $server->delete();

        return response()->json([
            'message' => 'Server deleted successfully'
        ]);
    }

    // GET single server
    public function show($id)
    {
        return response()->json(
            Server::with('user')->findOrFail($id)
        );
    }
}
