<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'gutenberg_url',
    ];

    public function pages()
    {
        return $this->hasMany(Page::class);
    }

    public static function createWithPages(array $data): self
    {
        // タイトルが既存かチェック
        $existing = self::where('title', $data['title'])->first();
        if ($existing) {
            return $existing;
        }

        // book作成
        $book = self::create([
            'title' => $data['title'],
            'gutenberg_url' => $data['gutenberg_url'] ?? null,
        ]);

        // page作成
        foreach ($data['pages'] as $i => $content) {
            $book->pages()->create([
                'page_number' => $i + 1,
                'content' => $content,
            ]);
        }

        return $book;
    }
}
