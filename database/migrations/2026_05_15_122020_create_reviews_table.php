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
       Schema::create('reviews', function (Blueprint $table) {
    $table->id();

    $table->tinyInteger('service_rating');

    $table->tinyInteger('food_rating');

    $table->tinyInteger('cleanliness_rating');

    $table->tinyInteger('overall_rating');

    $table->text('comment')->nullable();

    $table->boolean('is_anonymous')->default(true);

    $table->enum('status', [
        'PENDING',
        'APPROVED',
        'REJECTED',
        'CRITICAL'
    ])->default('PENDING');

    $table->foreignId('server_id')
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
        Schema::dropIfExists('reviews');
    }
};
