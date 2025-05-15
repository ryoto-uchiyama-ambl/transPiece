<?php

// app/Http/Controllers/Api/BookController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Book;
use App\Models\Page;

class BookController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'gutenberg_url' => 'nullable|string',
            'pages' => 'required|array',
        ]);

        $existingBook = Book::where('title', $request->title)->first();
        if ($existingBook) {
            return response()->json([
                'message' => 'このタイトルは既に存在します',
                'book_id' => $existingBook->id
            ]);
        }

        $book = Book::create([
            'title' => $request->title,
            'gutenberg_url' => $request->gutenberg_url,
        ]);

        foreach ($request->pages as $i => $content) {
            Page::create([
                'book_id' => $book->id,
                'page_number' => $i + 1,
                'content' => $content,
            ]);
        }

        return response()->json(['message' => '保存しました', 'book_id' => $book->id]);
    }
}

