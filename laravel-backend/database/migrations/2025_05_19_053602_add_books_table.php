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
        Schema::table('books', function (Blueprint $table) {
            Schema::table('books', function (Blueprint $table) {
                $table->string('author')->nullable();     // 著者（カンマ区切りなど）
                $table->unsignedInteger('downloads')->default(0); // ダウンロード数
                $table->string('lang', 10)->nullable();     // 言語コード（例: en）
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn(['author', 'downloads', 'lang']);
        });
    }
};
