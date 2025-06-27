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
        Schema::create('watch_lists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['movie', 'tv_series', 'anime']);
            $table->enum('status', ['plan_to_watch', 'watching', 'completed', 'dropped'])->default('plan_to_watch');
            $table->integer('rating')->nullable(); // 1-10 rating
            $table->string('genre')->nullable();
            $table->string('platform')->nullable(); // Netflix, Hulu, etc.
            $table->string('image_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('watch_lists');
    }
};
