<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class RestaurantController extends Controller
{
    /**
     * Setup a restaurant for an onboarding manager
     */
    public function setup(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'phone' => 'required|string|max:50',
        ]);

        $user = $request->user();

        // Check if user is MANAGER
        if (!$user->role || $user->role->name !== Role::MANAGER) {
            return response()->json(['message' => 'Unauthorized. Only managers can setup restaurants.'], 403);
        }

        // Check if restaurant is already configured
        if ($user->restaurant_id !== null) {
            return response()->json(['message' => 'Restaurant is already setup.'], 400);
        }

        // Create the restaurant
        $restaurant = Restaurant::create([
            'name' => $request->name,
            'address' => $request->address,
            'phone' => $request->phone,
            'status' => 'ACTIVE',
        ]);

        // Link manager to restaurant
        $user->update([
            'restaurant_id' => $restaurant->id,
        ]);

        return response()->json([
            'message' => 'Restaurant setup completed successfully.',
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role?->name,
                'restaurant_id' => $user->restaurant_id,
                'is_active' => $user->is_active,
            ],
            'restaurant' => $restaurant
        ]);
    }

    /**
     * List all restaurants for ADMIN
     */
    public function index(Request $request)
    {
        // Get all restaurants with manager, servers count, and reviews count
        $restaurants = Restaurant::with(['manager', 'servers', 'reviews'])->latest()->get();

        $data = $restaurants->map(function ($restaurant) {
            return [
                'id' => $restaurant->id,
                'name' => $restaurant->name,
                'address' => $restaurant->address,
                'phone' => $restaurant->phone,
                'status' => $restaurant->status,
                'manager' => $restaurant->manager ? [
                    'id' => $restaurant->manager->id,
                    'full_name' => $restaurant->manager->full_name,
                    'email' => $restaurant->manager->email,
                ] : null,
                'servers_count' => $restaurant->servers->count(),
                'reviews_count' => $restaurant->reviews->count(),
                'created_at' => $restaurant->created_at ? $restaurant->created_at->toIso8601String() : null,
            ];
        });

        return response()->json([
            'data' => $data
        ]);
    }

    /**
     * Create/Add a manager to a restaurant for ADMIN
     */
    public function addManager(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        // Check if restaurant already has a manager
        $restaurant = Restaurant::findOrFail($request->restaurant_id);
        if ($restaurant->manager()->exists()) {
            return response()->json(['message' => 'This restaurant already has an assigned manager.'], 400);
        }

        $managerRole = Role::where('name', Role::MANAGER)->firstOrFail();

        $user = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $managerRole->id,
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Manager assigned successfully.',
            'data' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => Role::MANAGER,
                'restaurant_id' => $user->restaurant_id,
            ]
        ], 201);
    }

    /**
     * Create a restaurant for ADMIN
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'phone' => 'required|string|max:50',
        ]);

        $restaurant = Restaurant::create([
            'name' => $request->name,
            'address' => $request->address,
            'phone' => $request->phone,
            'status' => 'ACTIVE',
        ]);

        return response()->json($restaurant, 201);
    }
}
