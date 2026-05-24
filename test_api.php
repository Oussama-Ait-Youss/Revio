<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'admin@example.com')->first();
if (!$user) {
    echo "No admin user found\n";
    exit;
}

$req = Illuminate\Http\Request::create('/api/servers', 'GET');
$req->setUserResolver(function() use ($user) { return $user; });

$res = app(\App\Http\Controllers\Api\ServerController::class)->index($req);
echo json_encode($res->getData());
