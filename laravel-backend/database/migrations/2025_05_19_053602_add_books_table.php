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
            $table->string('author')->nullable();     // 著者（カンマ区切りなど）
            $table->unsignedInteger('downloads')->default(0)->nullable(); // ダウンロード数
            $table->string('lang', 10)->nullable();     // 言語コード（例: en）
            $table->Integer('page_count')->default(0)->nullable(); // ページ数
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn(['author', 'downloads', 'lang', 'page_count']);
        });
    }
};
