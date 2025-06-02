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
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('page_id')->constrained()->onDelete('cascade');
            $table->longText('translated_text')->nullable();
            $table->float('score')->nullable();
            $table->longText('AI_feedback')->nullable();
            $table->longText('AI_text')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'page_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
