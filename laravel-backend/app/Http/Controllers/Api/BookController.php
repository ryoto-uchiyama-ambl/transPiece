<?php

// app/Http/Controllers/Api/BookController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Progress;
use App\Http\Requests\StoreBookRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Log;


class BookController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Progress 経由で保存した本一覧を取得
        $progresses = Progress::with('book')
            ->where('user_id', $user->id)
            ->get();

        $books = $progresses->map(function ($progress) {
            return [
                'id' => $progress->book->id,
                'title' => $progress->book->title,
                'author' => $progress->book->author,
                'lang' => $progress->book->lang,
                'downloads' => $progress->book->downloads,
                'gutenberg_url' => $progress->book->gutenberg_url,
                'is_favorite' => $progress->is_favorite,
                'current_page' => $progress->current_page,
                'total_page' => $progress->book->page_count,
            ];
        })->unique('id')->values();
        // 取得した本の情報を元に統計情報を作成
        $totalBooks = $books->count();
        $favoriteBooks = $progresses->filter(fn($progress) => $progress->is_favorite)->count();
        $latestProgress = $progresses->sortByDesc('updated_at')->first();
        $recentlyAdded = $latestProgress ? $latestProgress->created_at->diffForHumans() : '不明';

        return response()->json([
            'books' => $books,
            'stats' => [
                'total' => $totalBooks,
                'favorites' => $favoriteBooks,
                'recentlyAdded' => $recentlyAdded,
            ]
        ]);
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

    public function toggleFavorite(Request $request, Book $book)
    {
        $user = Auth::user();

        if (!$user) {
            $user->id = 1;
        }

        $progress = Progress::firstOrCreate(
            ['user_id' => $user->id, 'book_id' => $book->id],
            ['is_favorite' => false]
        );

        $progress->is_favorite = !$progress->is_favorite;
        $progress->save();

        return response()->json([
            'favorite' => $progress->is_favorite,
            'message' => $progress->is_favorite ? 'お気に入りに追加しました' : 'お気に入りを解除しました',
        ]);
    }

    public function saveCurrentBook(Request $request)
    {
        $user = Auth::user();

        $bookId = $request->input('book_id');

        // User モデルを使用して現在の本を保存
        User::where('id', $user->id)->update(['book_id' => $bookId]);

        return response()->json(['message' => '現在の本を保存しました']);
    }

    public function getCurrentBook(Request $request) {
        $user = Auth::user();

        $current_book = User::where('id', $user->id)->value('book_id');

        Log::info($current_book);

        return response()->json(
            ['current_book' => $current_book, 'message' => $current_book ? '現在の本を取得しました' : '現在の本を取得できませんでした']
        );
    }
}

