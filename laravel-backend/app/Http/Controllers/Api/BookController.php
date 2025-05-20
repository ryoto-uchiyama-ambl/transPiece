<?php

// app/Http/Controllers/Api/BookController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Http\Requests\StoreBookRequest;
use Illuminate\Support\Facades\Auth;


class BookController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            $books = $user->progresses()->with('book')->get()->where('user_id', 1)->pluck('book')->unique('id')->values();
            return response()->json($books);
        }

        // Progress 経由で保存した本一覧を取得
        $books = $user->progresses()->with('book')->get()->pluck('book')->unique('id')->values();

        return response()->json($books);
    }
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

