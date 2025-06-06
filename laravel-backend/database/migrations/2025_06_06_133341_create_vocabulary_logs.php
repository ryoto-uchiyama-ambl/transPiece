<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vocabulary_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vocabulary_schedule_id')->constrained()->onDelete('cascade');
            $table->tinyInteger('rating'); // 0~3: Again, Hard, Good, Easy
            $table->float('stability');
            $table->float('difficulty');
            $table->float('elapsed_days');
            $table->timestamp('reviewed_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vocabulary_logs');
    }
};
