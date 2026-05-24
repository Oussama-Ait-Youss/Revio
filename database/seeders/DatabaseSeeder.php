<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed 3 roles
        $adminRole = \App\Models\Role::create(['name' => \App\Models\Role::ADMIN]);
        $managerRole = \App\Models\Role::create(['name' => \App\Models\Role::MANAGER]);
        $serverRole = \App\Models\Role::create(['name' => \App\Models\Role::SERVER]);

        // 2. Create 1 admin user
        \App\Models\User::create([
            'full_name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);

        // 3. Create 1 manager user
        \App\Models\User::create([
            'full_name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $managerRole->id,
            'is_active' => true,
        ]);

        // 4. Create 10 server users
        for ($i = 1; $i <= 10; $i++) {
            $user = \App\Models\User::create([
                'full_name' => "Server User {$i}",
                'email' => "server{$i}@example.com",
                'password' => bcrypt('password123'),
                'role_id' => $serverRole->id,
                'is_active' => true,
            ]);

            // For each server user, create a related server profile
            $server = \App\Models\Server::create([
                'user_id' => $user->id,
                'phone' => "123456789{$i}",
                'total_reviews' => 0,
                'google_review_url' => "https://g.page/r/server{$i}",
            ]);

            // Create NFC card for the server
            \App\Models\NfcCard::create([
                'uid' => "UID-" . uniqid() . "-{$i}",
                'public_token' => "tok_" . uniqid(),
                'qr_code_url' => "https://example.com/qr/{$i}",
                'is_active' => true,
                'server_id' => $server->id,
                'assigned_at' => now(),
            ]);

            // Create 10 reviews linked to that server
            for ($j = 1; $j <= 10; $j++) {
                \App\Models\Review::create([
                    'server_id' => $server->id,
                    'rating' => rand(4, 5),
                    'comment' => "Great service by server {$i}, review {$j}!",
                ]);
            }
        }
    }
}