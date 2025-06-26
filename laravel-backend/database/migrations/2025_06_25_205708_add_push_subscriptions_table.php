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
        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->boolean('review_reminders')->default(false)->nullable();
            $table->boolean('translation_feedback')->default(false)->nullable();
            $table->boolean('weekly_progress')->default(false)->nullable();
            $table->boolean('system_updates')->default(false)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->dropColumn(['review_reminders', 'translation_feedback', 'weekly_progress', 'system_updates']);
        });
    }
};
