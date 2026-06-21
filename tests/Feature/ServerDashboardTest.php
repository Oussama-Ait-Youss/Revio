<?php

namespace Tests\Feature;

use App\Models\Review;
use App\Models\Restaurant;
use App\Models\Role;
use App\Models\Server;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class ServerDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_server_role_can_retrieve_real_dashboard_statistics(): void
    {
        // 1. Create Server role
        $serverRole = Role::create(['name' => Role::SERVER]);
        $restaurant = Restaurant::create([
            'name' => 'Test Restaurant',
            'address' => '123 Test Street',
            'phone' => '1234567890',
            'status' => 'ACTIVE',
        ]);

        // 2. Create User with Server role
        $user = User::create([
            'full_name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $serverRole->id,
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
        ]);

        // 3. Create Server profile
        $server = Server::create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'phone' => '1234567890',
            'total_reviews' => 0, // initially 0
        ]);

        // 4. Create 3 reviews for the server
        Review::create(['restaurant_id' => $restaurant->id, 'server_id' => $server->id, 'rating' => 5, 'comment' => 'Excellent service!']);
        Review::create(['restaurant_id' => $restaurant->id, 'server_id' => $server->id, 'rating' => 4, 'comment' => 'Very good.']);
        Review::create(['restaurant_id' => $restaurant->id, 'server_id' => $server->id, 'rating' => 2, 'comment' => 'Slow service.']);

        // 5. Authenticate user
        Sanctum::actingAs($user);

        // 6. Make request to /api/my-reviews
        $response = $this->getJson('/api/my-reviews');

        // 7. Verify response structure and data correctness
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'server' => [
                'id',
                'user_id',
                'phone',
                'total_reviews',
                'user' => [
                    'id',
                    'full_name',
                    'email',
                    'is_active',
                ],
            ],
            'reviews',
        ]);

        // Assert server data is correct and user relation is present
        $this->assertEquals('John Doe', $response->json('server.user.full_name'));
        $this->assertEquals(true, $response->json('server.user.is_active'));
        
        // Assert reviews count is real from the database (should be 3)
        $this->assertEquals(3, $response->json('server.total_reviews'));
        $this->assertCount(3, $response->json('reviews'));
    }
}
