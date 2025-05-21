<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;


class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'gutenberg_url',
        'author',
        'lang',
        'downloads',
        'page_count',
    ];

    public function pages()
    {
        return $this->hasMany(Page::class);
    }

    public function progess()
    {
        return $this->hasMany(Progress::class);
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
            'author' => $data['authors'] ?? null,
            'lang' => $data['lang'] ?? null,
            'downloads' => $data['downloads'] ?? 0,
            'page_count' => count($data['pages']) ?? 0,
        ]);

        // page作成
        foreach ($data['pages'] as $i => $content) {
            $book->pages()->create([
                'page_number' => $i + 1,
                'content' => $content,
            ]);
        }

        // progress作成
        $userId = Auth::id();
        if ($userId) {
            Progress::create([
                'user_id' => $userId,
                'book_id' => $book->id,
            ]);
        }else {
            Progress::create([
                'user_id' => 1,
                'book_id' => $book->id,
            ]);
        }

        return $book;
    }
}
