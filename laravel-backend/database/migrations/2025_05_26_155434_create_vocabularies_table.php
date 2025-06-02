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
        Schema::create('vocabularies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');  // ユーザーID
            $table->foreignId('book_id')->constrained()->onDelete('cascade');  // 書籍ID
            $table->foreignId('page_id')->constrained()->onDelete('cascade');  // ページID
            $table->string('word');                                                    // 単語
            $table->string('translation')->nullable();                                 // 翻訳
            $table->longText('definition')->nullable();                                // 定義
            $table->longText('example')->nullable();                                   // 例文
            $table->string('part_of_speech')->nullable();                              // 品詞
            $table->string('language')->default('en');                          // 言語 (デフォルトは英語)
            $table->boolean('is_understanding')->default(false);                // 理解済みフラグ
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vocabularies');
    }
};
