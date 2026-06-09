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
        | ADMIN: Platform Owner
        | MANAGER: Restaurant Owner
        | SERVER: Employee
        */
        $adminRole   = Role::create(['name' => 'ADMIN']);
        $managerRole = Role::create(['name' => 'MANAGER']);
        $serverRole  = Role::create(['name' => 'SERVER']);

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
            'role_id' => $adminRole->id, 
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
            'restaurant_id' => null,          
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
            'restaurant_id' => $restaurant->id,
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
                'restaurant_id' => $restaurant->id,
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
                    'restaurant_id' => $restaurant->id,
                    'server_id'     => $server->id,
                    'rating'        => rand(4, 5),
                    'comment'       => "Great service by Server {$i} at Le Marrakchi!",
                ]);
            }
        }
    }
}