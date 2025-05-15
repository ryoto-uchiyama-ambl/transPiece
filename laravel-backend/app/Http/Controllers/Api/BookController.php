<?php

// app/Http/Controllers/Api/BookController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Http\Requests\StoreBookRequest;

class BookController extends Controller
{
    public function store(StoreBookRequest $request)
    {
        $book = Book::createWithPages($request->validated());

        if ($book->wasRecentlyCreated) {
            return response()->json(['message' => '保存しました', 'book_id' => $book->id]);
        } else {
            return response()->json(['message' => 'このタイトルは既に存在します', 'book_id' => $book->id]);
        }
    }
}

