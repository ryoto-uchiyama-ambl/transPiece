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
        Schema::create('vocabulary_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vocabulary_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->float('stability')->default(0);
            $table->float('difficulty')->default(0);
            $table->float('reps')->default(9);
            $table->float('elapsed_days')->default(0);
            $table->float('scheduled_days')->default(0);
            $table->float('learning_steps')->default(0);
            $table->integer('state')->default(0);
            $table->timestamp('last_review')->nullable();
            $table->timestamp('due')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vocabulary_schedules');
    }
};
