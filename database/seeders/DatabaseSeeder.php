<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin account to enter the dashboard
        User::create([
            'full_name' => 'Admin User',
            'email' => 'admin@revio.com',
            'password' => Hash::make('Admin123'),
            'role' => 'ADMIN',
            'is_active' => true,
        ]);
        // 

        // Server account
        User::create([
            'full_name' => 'Server User',
            'email' => 'server@revio.com',
            'password' => Hash::make('Server123'),
            'role' => 'SERVER',
            'is_active' => true,
        ]);
    }
}