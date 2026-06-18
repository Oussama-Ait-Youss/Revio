<?php

namespace Tests\Feature;

use App\Models\NfcCard;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\Role;
use App\Models\Server;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ManagerTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_creates_restaurant_and_linked_manager_atomically(): void
    {
        $adminRole = Role::create(['name' => Role::ADMIN]);
        Role::create(['name' => Role::MANAGER]);
        $admin = User::create([
            'full_name' => 'Platform Admin',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/restaurants', [
            'name' => 'New Restaurant',
            'address' => 'New Address',
            'phone' => '555123456',
            'manager_full_name' => 'New Manager',
            'manager_email' => 'new.manager@example.com',
            'manager_password' => 'password123',
        ])->assertCreated();

        $restaurantId = $response->json('data.id');
        $this->assertDatabaseHas('restaurants', ['id' => $restaurantId, 'name' => 'New Restaurant']);
        $this->assertDatabaseHas('users', [
            'email' => 'new.manager@example.com',
            'restaurant_id' => $restaurantId,
        ]);
    }

    public function test_manager_only_receives_staff_and_reviews_from_their_restaurant(): void
    {
        [$manager, $ownServer] = $this->makeRestaurantTeam('Own');
        [, $otherServer] = $this->makeRestaurantTeam('Other');

        Review::create([
            'restaurant_id' => $ownServer->restaurant_id,
            'server_id' => $ownServer->id,
            'rating' => 5,
            'comment' => 'Own review',
        ]);
        Review::create([
            'restaurant_id' => $otherServer->restaurant_id,
            'server_id' => $otherServer->id,
            'rating' => 1,
            'comment' => 'Other review',
        ]);

        Sanctum::actingAs($manager);

        $this->getJson('/api/servers')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.restaurant_id', $manager->restaurant_id);

        $this->getJson('/api/reviews')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.comment', 'Own review');

        $this->getJson('/api/reviews?server_id='.$otherServer->id)
            ->assertNotFound();
    }

    public function test_manager_cannot_assign_another_restaurants_card_or_server(): void
    {
        [$manager, $ownServer] = $this->makeRestaurantTeam('Own');
        [, $otherServer] = $this->makeRestaurantTeam('Other');

        $ownCard = NfcCard::create([
            'uid' => 'OWN-CARD',
            'public_token' => 'own-token',
            'restaurant_id' => $manager->restaurant_id,
            'is_active' => true,
        ]);
        $otherCard = NfcCard::create([
            'uid' => 'OTHER-CARD',
            'public_token' => 'other-token',
            'restaurant_id' => $otherServer->restaurant_id,
            'is_active' => true,
        ]);

        Sanctum::actingAs($manager);

        $this->postJson("/api/nfc-cards/{$otherCard->id}/assign", ['server_id' => $ownServer->id])
            ->assertNotFound();

        $this->postJson("/api/nfc-cards/{$ownCard->id}/assign", ['server_id' => $otherServer->id])
            ->assertNotFound();

        $this->assertNull($ownCard->fresh()->server_id);
        $this->assertNull($otherCard->fresh()->server_id);
    }

    private function makeRestaurantTeam(string $prefix): array
    {
        $managerRole = Role::firstOrCreate(['name' => Role::MANAGER]);
        $serverRole = Role::firstOrCreate(['name' => Role::SERVER]);
        $restaurant = Restaurant::create([
            'name' => "{$prefix} Restaurant",
            'address' => "{$prefix} Address",
            'phone' => '1234567890',
        ]);
        $manager = User::create([
            'full_name' => "{$prefix} Manager",
            'email' => strtolower($prefix).'manager@example.com',
            'password' => 'password123',
            'role_id' => $managerRole->id,
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
        ]);
        $serverUser = User::create([
            'full_name' => "{$prefix} Server",
            'email' => strtolower($prefix).'server@example.com',
            'password' => 'password123',
            'role_id' => $serverRole->id,
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
        ]);
        $server = Server::create([
            'user_id' => $serverUser->id,
            'restaurant_id' => $restaurant->id,
            'phone' => '1234567890',
            'total_reviews' => 0,
        ]);

        return [$manager, $server];
    }
}
