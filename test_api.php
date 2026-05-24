<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'admin@example.com')->first();
$req = Illuminate\Http\Request::create('/api/dashboard/stats', 'GET');
$req->setUserResolver(function() use ($user) { return $user; });

$res = app(\App\Http\Controllers\Api\DashboardController::class)->stats($req);
echo json_encode($res->getData());
