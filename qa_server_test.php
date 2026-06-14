<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Role;
use App\Models\Restaurant;
use App\Models\Server;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ServerController;
use Illuminate\Support\Str;

echo "========================================\n";
echo "🚀 STARTING SERVER ISOLATION QA TEST\n";
echo "========================================\n\n";

$managerRole = Role::where('name', 'MANAGER')->first();

// Phase 1: Setup Managers and Venues
echo "--- PHASE 1: SETUP & SESSION VERIFICATION ---\n";
$restA = Restaurant::create([
    'name' => 'QA Venue Alpha ' . Str::random(4),
    'address' => '123 Alpha St',
    'phone' => '11111111',
    'city' => 'Alpha City'
]);
$managerA = User::create([
    'full_name' => 'Manager Alpha',
    'email' => 'alpha_' . Str::random(6) . '@qa.com',
    'password' => bcrypt('password'),
    'role_id' => $managerRole->id,
    'restaurant_id' => $restA->id
]);

$restB = Restaurant::create([
    'name' => 'QA Venue Beta ' . Str::random(4),
    'address' => '456 Beta St',
    'phone' => '22222222',
    'city' => 'Beta City'
]);
$managerB = User::create([
    'full_name' => 'Manager Beta',
    'email' => 'beta_' . Str::random(6) . '@qa.com',
    'password' => bcrypt('password'),
    'role_id' => $managerRole->id,
    'restaurant_id' => $restB->id
]);

echo "Created Venue Alpha (ID: {$restA->id}) with Manager Alpha.\n";
echo "Created Venue Beta (ID: {$restB->id}) with Manager Beta.\n";
echo "✅ Phase 1 PASSED.\n\n";

// Phase 2: Interception & Injection Test (Adding a Server)
echo "--- PHASE 2: ADDING A SERVER (VENUE ALPHA) ---\n";
$controller = new ServerController();
$serverEmail = 'server_' . Str::random(6) . '@qa.com';

// Notice we do NOT pass restaurant_id in the payload!
// We simulate the frontend stripping it. The backend should auto-inject it based on the user session.
$reqData = [
    'full_name' => 'QA Server Alpha',
    'email' => $serverEmail,
    'password' => 'password',
    'phone' => '123456789'
];
$req = Request::create('/api/servers', 'POST', $reqData);
$req->setUserResolver(function() use ($managerA) { return $managerA; });

$res = $controller->store($req);
if ($res->getStatusCode() !== 201) {
    echo "❌ Phase 2 FAILED: Could not create server. Response: " . $res->getContent() . "\n";
    exit(1);
}

echo "Action: Manager Alpha (Restaurant ID: {$restA->id}) created a server profile without specifying a restaurant_id.\n";
echo "✅ Phase 2 PASSED.\n\n";

// Phase 3: Database & Cross-Tenant Security Isolation Check
echo "--- PHASE 3: DATABASE & ACID TEST ---\n";
$createdServerUser = User::where('email', $serverEmail)->first();

echo "Action: Database Audit Check.\n";
echo "Result: Created Server has restaurant_id: {$createdServerUser->restaurant_id}.\n";
if ($createdServerUser->restaurant_id === $restA->id) {
    echo "Verification: The restaurant_id was automatically locked to {$restA->id} exactly as expected!\n";
} else {
    echo "❌ Phase 3 FAILED: The restaurant_id was not correctly assigned.\n";
    exit(1);
}

echo "\nAction: The Acid Test - Manager Beta attempts to query servers.\n";
$reqGet = Request::create('/api/servers', 'GET');
$reqGet->setUserResolver(function() use ($managerB) { return $managerB; });
$resGet = $controller->index($reqGet);

$responseData = json_decode($resGet->getContent(), true);
$serversVisibleToBeta = $responseData['data'];

$found = false;
foreach ($serversVisibleToBeta as $sv) {
    if ($sv['id'] === $createdServerUser->id) {
        $found = true;
    }
}

echo "Result: Manager Beta can see " . count($serversVisibleToBeta) . " servers.\n";
if ($found) {
    echo "❌ Phase 3 FAILED: DATA LEAK! Manager Beta can see Manager Alpha's server!\n";
    exit(1);
} else {
    echo "Verification: The newly created server (ID: {$createdServerUser->id}) is completely invisible to Manager Beta.\n";
    echo "✅ Phase 3 PASSED.\n\n";
}

echo "========================================\n";
echo "🎉 SERVER ISOLATION QA TEST COMPLETED SUCCESSFULLY\n";
echo "========================================\n";
