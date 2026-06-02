<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\Server;
use App\Models\NfcCard;
use App\Models\Review;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. Create Restaurants
        |--------------------------------------------------------------------------
        | We create two separate restaurants to properly test data isolation.
        */
        $restaurant1 = Restaurant::create([
            'name' => 'Le Marrakchi',
            'address' => 'Jemaa el-Fnaa, Marrakech',
            'phone' => '0524400000',
            'status' => 'ACTIVE'
        ]);

        $restaurant2 = Restaurant::create([
            'name' => 'La Trattoria',
            'address' => 'Gueliz, Marrakech',
            'phone' => '0524432641',
            'status' => 'ACTIVE'
        ]);

        /*
        |--------------------------------------------------------------------------
        | 2. Create the App Owner (SUPER_ADMIN)
        |--------------------------------------------------------------------------
        | App Owners do not belong to any restaurant, so restaurant_id is null.
        */
        User::create([
            'full_name' => 'Revio Owner',
            'email' => 'owner@revio.me',
            'password' => bcrypt('password123'),
            'role' => 'SUPER_ADMIN',
            'restaurant_id' => null,
            'is_active' => true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | 3. Create Restaurant Managers
        |--------------------------------------------------------------------------
        | Each manager must be bound explicitly to their respective restaurant.
        */
        User::create([
            'full_name' => 'Manager Marrakchi',
            'email' => 'manager1@example.com',
            'password' => bcrypt('password123'),
            'role' => 'MANAGER',
            'restaurant_id' => $restaurant1->id,
            'is_active' => true,
        ]);

        User::create([
            'full_name' => 'Manager Trattoria',
            'email' => 'manager2@example.com',
            'password' => bcrypt('password123'),
            'role' => 'MANAGER',
            'restaurant_id' => $restaurant2->id,
            'is_active' => true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | 4. Create Servers, NFC Cards, and Reviews
        |--------------------------------------------------------------------------
        | We will generate 10 servers split across both restaurants.
        */
        for ($i = 1; $i <= 10; $i++) {
            // Alternate between Restaurant 1 and Restaurant 2
            $currentRestaurant = ($i % 2 === 0) ? $restaurant1 : $restaurant2;

            // Create Server User account
            $user = User::create([
                'full_name' => "Server User {$i}",
                'email' => "server{$i}@example.com",
                'password' => bcrypt('password123'),
                'role' => 'SERVER',
                'restaurant_id' => $currentRestaurant->id,
                'is_active' => true,
            ]);

            // Create Server Business Profile
            $server = Server::create([
                'user_id' => $user->id,
                'restaurant_id' => $currentRestaurant->id,
                'phone' => "061234567{$i}",
            ]);

            // Create NFC card matching the updated schema constraint rules
            NfcCard::create([
                'uid' => "UID-" . strtoupper(Str::random(6)) . "-{$i}",
                'public_token' => Str::random(32),
                'is_active' => true,
                'restaurant_id' => $currentRestaurant->id,
                'server_id' => $server->id,
                'assigned_at' => now(),
            ]);

            // Create 5 reviews linked to that specific server and restaurant environment
            for ($j = 1; $j <= 5; $j++) {
                Review::create([
                    'restaurant_id' => $currentRestaurant->id,
                    'server_id' => $server->id,
                    'rating' => rand(4, 5),
                    'comment' => "Great service by server {$i} at {$currentRestaurant->name}!",
                    'customer_name' => "Client " . Str::random(4),
                    'status' => 'PUBLISHED'
                ]);
            }
        }
    }
}