<?php

namespace Tests\Feature;

use App\Models\NfcCard;
use App\Models\Restaurant;
use App\Models\Role;
use App\Models\Server;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminServersManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_load_server_zone_data(): void
    {
        $adminRole = Role::create(['name' => Role::ADMIN]);
        $serverRole = Role::create(['name' => Role::SERVER]);

        $restaurant = Restaurant::create([
            'name' => 'Le Marrakchi',
            'address' => 'Jemaa el-Fnaa, Marrakech',
            'phone' => '0524400000',
            'status' => 'ACTIVE',
        ]);

        $admin = User::create([
            'full_name' => 'Platform Owner',
            'email' => 'owner@revio.me',
            'password' => bcrypt('password123'),
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);

        $serverUser = User::create([
            'full_name' => 'Server User',
            'email' => 'server@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $serverRole->id,
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
        ]);

        $server = Server::create([
            'user_id' => $serverUser->id,
            'restaurant_id' => $restaurant->id,
            'phone' => '0612345678',
            'total_reviews' => 0,
        ]);

        NfcCard::create([
            'uid' => 'UID-TEST-1',
            'restaurant_id' => $restaurant->id,
            'public_token' => 'test-token',
            'is_active' => true,
            'server_id' => $server->id,
            'assigned_at' => now(),
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/servers')
            ->assertOk()
            ->assertJsonPath('data.0.restaurant.name', 'Le Marrakchi')
            ->assertJsonPath('data.0.server.nfc_card.uid', 'UID-TEST-1');

        $this->getJson('/api/admin/restaurants')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Le Marrakchi');
    }
}
