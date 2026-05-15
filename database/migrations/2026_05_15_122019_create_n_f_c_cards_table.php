<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('nfc_cards', function (Blueprint $table) {
    $table->id();

    $table->string('uid')->unique();

    $table->string('public_token')->unique();

    $table->string('qr_code_url')->nullable();

    $table->boolean('is_active')->default(true);

    $table->timestamp('assigned_at')->nullable();

    $table->foreignId('server_id')
          ->unique()
          ->constrained()
          ->cascadeOnDelete();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('n_f_c_cards');
    }
};
