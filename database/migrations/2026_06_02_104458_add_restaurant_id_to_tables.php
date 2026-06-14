<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Update Users Table (already has restaurant_id in create_users_table migration)

        // 2. Update Servers Table
        Schema::table('servers', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->after('user_id')->constrained('restaurants')->onDelete('cascade');
        });

        // 3. Update NFC Cards Table
        Schema::table('nfc_cards', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->after('id')->constrained('restaurants')->onDelete('cascade');
        });

        // 4. Update Reviews Table
        Schema::table('reviews', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->after('id')->constrained('restaurants')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) { $table->dropForeign(['restaurant_id']); $table->dropColumn('restaurant_id'); });
        Schema::table('nfc_cards', function (Blueprint $table) { $table->dropForeign(['restaurant_id']); $table->dropColumn('restaurant_id'); });
        Schema::table('servers', function (Blueprint $table) { $table->dropForeign(['restaurant_id']); $table->dropColumn('restaurant_id'); });

    }
};