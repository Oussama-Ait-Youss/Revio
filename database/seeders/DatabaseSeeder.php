<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
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
        | 1. Seed Roles Table First (Required by users foreign key constraint)
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

        $superAdminRole = Role::firstOrCreate(['name' => Role::ADMIN]);
        $managerRole = Role::firstOrCreate(['name' => Role::MANAGER]);
        $serverRole = Role::firstOrCreate(['name' => Role::SERVER]);

        /*
        |--------------------------------------------------------------------------
        | 2. Create the ADMIN User (Platform Owner)
        |--------------------------------------------------------------------------
        | restaurant_id must be null
        */
        User::create([
            'full_name' => 'Platform Owner',
            'email' => 'owner@revio.me',
            'password' => bcrypt('password123'),
            'role_id' => $superAdminRole->id,
            'restaurant_id' => null,
            'is_active' => true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | 3. Create the Unconfigured Manager User
        |--------------------------------------------------------------------------
        | restaurant_id must be null to test onboarding wizard flow
        */
        User::create([
            'full_name' => 'Unconfigured Manager',
            'email' => 'unconfigured@manager.com',
            'password' => bcrypt('password123'),
            'role_id' => $managerRole->id,
            'restaurant_id' => $restaurant1->id,
            'is_active' => true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | 4. Create Active Restaurant and Assigned MANAGER Account
        |--------------------------------------------------------------------------
        */
        $restaurant = Restaurant::create([
            'name' => 'Le Marrakchi',
            'address' => 'Jemaa el-Fnaa, Marrakech',
            'phone' => '0524400000',
            'status' => 'ACTIVE'
        ]);

        User::create([
            'full_name' => 'Restaurant Manager',
            'email' => 'manager@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $managerRole->id,
            'restaurant_id' => $restaurant2->id,
            'is_active' => true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | 5. Create 5 SERVERS under Le Marrakchi
        |--------------------------------------------------------------------------
        | Unique user_id and restaurant_id values, active nfc_cards,
        | and simple customer reviews (id, rating, comment, server_id, restaurant_id, timestamps)
        */
        for ($i = 1; $i <= 5; $i++) {
            // Create Server User Account
            $user = User::create([
                'full_name' => "Server User {$i}",
                'email' => "server{$i}@example.com",
                'password' => bcrypt('password123'),
                'role_id' => $serverRole->id,
                'restaurant_id' => $currentRestaurant->id,
                'is_active' => true,
            ]);

            // Create Server Profile
            $server = Server::create([
                'user_id' => $user->id,
                'restaurant_id' => $restaurant->id,
                'phone' => "061234567{$i}",
                'total_reviews' => 3,
            ]);

            // Create Active NFC Card
            NfcCard::create([
                'uid' => "UID-" . strtoupper(Str::random(6)) . "-{$i}",
                'public_token' => Str::random(32),
                'is_active' => true,
                'restaurant_id' => $restaurant->id,
                'server_id' => $server->id,
                'assigned_at' => now(),
            ]);

            // Create 3 reviews per server
            for ($j = 1; $j <= 3; $j++) {
                Review::create([
                    'restaurant_id' => $currentRestaurant->id,
                    'server_id' => $server->id,
                    'rating' => rand(4, 5),
                    'comment' => "Great service by server {$i} at {$currentRestaurant->name}!",
                ]);
            }
        }
    }
}