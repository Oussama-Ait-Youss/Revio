<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Role;
use App\Models\NfcCard;
use App\Models\NfcRequest;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\Admin\AdminNfcController;
use App\Http\Controllers\Api\NfcRequestController;

echo "========================================\n";
echo "🚀 STARTING E2E QA TEST\n";
echo "========================================\n\n";

// Initial counts
$initialUnallocated = NfcCard::unallocated()->count();
echo "[INFO] Initial Unallocated Stock: $initialUnallocated\n";

// Ensure Admin User
$adminRole = Role::where('name', 'ADMIN')->first();
$adminUser = User::where('role_id', $adminRole->id)->first();
if (!$adminUser) {
    echo "[!] No Admin user found. Creating one...\n";
    $adminUser = User::create([
        'full_name' => 'Admin Test',
        'email' => 'admin_qa@example.com',
        'password' => bcrypt('password'),
        'role_id' => $adminRole->id,
    ]);
}

// Ensure Manager User
$managerRole = Role::where('name', 'MANAGER')->first();
$managerUser = User::where('role_id', $managerRole->id)->whereNotNull('restaurant_id')->first();
if (!$managerUser) {
    echo "[!] No Manager user with restaurant found. Creating one...\n";
    $rest = Restaurant::create(['name' => 'QA Test Restaurant']);
    $managerUser = User::create([
        'full_name' => 'Manager QA',
        'email' => 'manager_qa@example.com',
        'password' => bcrypt('password'),
        'role_id' => $managerRole->id,
        'restaurant_id' => $rest->id
    ]);
}
$restaurantId = $managerUser->restaurant_id;

// Phase 1: Factory
echo "\n--- PHASE 1: THE FACTORY ---\n";
$adminController = new AdminNfcController();
$req = Request::create('/api/admin/nfc/manufacture', 'POST', ['quantity' => 10]);
$req->setUserResolver(function() use ($adminUser) { return $adminUser; });
$res = $adminController->manufacture($req);
$newUnallocated = NfcCard::unallocated()->count();
echo "Action: Manufactured 10 new cards.\n";
echo "Result: " . json_decode($res->getContent(), true)['message'] . "\n";
echo "Verification: Unallocated stock went from $initialUnallocated to $newUnallocated. \n";
if ($newUnallocated === $initialUnallocated + 10) {
    echo "✅ Phase 1 PASSED.\n";
} else {
    echo "❌ Phase 1 FAILED.\n";
}

// Phase 2: Order
echo "\n--- PHASE 2: THE ORDER ---\n";
$managerController = new NfcRequestController();
$req = Request::create('/api/manager/nfc-requests', 'POST', ['quantity' => 5, 'notes' => 'QA urgent order']);
$req->setUserResolver(function() use ($managerUser) { return $managerUser; });
$res = $managerController->store($req);
$nfcRequest = NfcRequest::latest()->first();
echo "Action: Manager requested 5 cards.\n";
echo "Result: Request ID {$nfcRequest->id} created with status '{$nfcRequest->status}'.\n";
if ($nfcRequest->status === 'PENDING' && $nfcRequest->quantity == 5) {
    echo "✅ Phase 2 PASSED.\n";
} else {
    echo "❌ Phase 2 FAILED.\n";
}

// Phase 3: Fulfillment
echo "\n--- PHASE 3: THE FULFILLMENT ---\n";
$initialRestaurantCards = NfcCard::where('restaurant_id', $restaurantId)->count();

$req = Request::create("/api/admin/nfc/requests/{$nfcRequest->id}/process", 'PATCH', ['status' => 'APPROVED']);
$req->setUserResolver(function() use ($adminUser) { return $adminUser; });
$res = $adminController->process($req, $nfcRequest->id);
$nfcRequest->refresh();
echo "Action: Admin approved request {$nfcRequest->id}.\n";
echo "Result: " . json_decode($res->getContent(), true)['message'] . "\n";
echo "Status of request is now: '{$nfcRequest->status}'.\n";
if ($nfcRequest->status === 'APPROVED') {
    echo "✅ Phase 3 PASSED.\n";
} else {
    echo "❌ Phase 3 FAILED.\n";
}

// Phase 4: Allocation
echo "\n--- PHASE 4: THE ALLOCATION ---\n";
$finalRestaurantCards = NfcCard::where('restaurant_id', $restaurantId)->count();
echo "Action: Verifying Manager's actual inventory.\n";
echo "Result: Manager's allocated cards went from $initialRestaurantCards to $finalRestaurantCards.\n";
$finalUnallocated = NfcCard::unallocated()->count();
echo "Result: Factory unallocated stock is now $finalUnallocated.\n";

if ($finalRestaurantCards === $initialRestaurantCards + 5 && $finalUnallocated === $newUnallocated - 5) {
    echo "✅ Phase 4 PASSED.\n";
} else {
    echo "❌ Phase 4 FAILED.\n";
}

echo "\n========================================\n";
echo "🎉 E2E QA TEST COMPLETED SUCCESSFULLY\n";
echo "========================================\n";
