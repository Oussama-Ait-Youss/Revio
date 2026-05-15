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
        Schema::create('testimonials', function (Blueprint $table) {
    $table->id();

    $table->foreignId('review_id')
          ->unique()
          ->constrained()
          ->cascadeOnDelete();

    $table->foreignId('approved_by')
          ->constrained('users')
          ->cascadeOnDelete();

    $table->boolean('is_featured')->default(false);

    $table->timestamp('published_at')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
