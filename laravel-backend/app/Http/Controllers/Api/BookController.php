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
        if (!$user) {
            return response()->json(['message' => '認証されていません'], 401);
        }


        try {
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
            $totalPages = $books->sum('current_page');
            $favoriteBooks = $progresses->filter(fn($progress) => $progress->is_favorite)->count();
            $latestProgress = $progresses->sortByDesc('updated_at')->first();
            $recentlyAdded = $latestProgress ? $latestProgress->created_at->diffForHumans() : '不明';

            return response()->json([
                'books' => $books,
                'stats' => [
                    'totalBooks' => $totalBooks,
                    'totalPages' => $totalPages,
                    'favorites' => $favoriteBooks,
                    'recentlyAdded' => $recentlyAdded,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => '内部エラーが発生しました'], 500);
        }
    }
    public function store(StoreBookRequest $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => '認証されていません'], 401);
        }

        try {
            $book = Book::createWithPages($request->validated());

            if ($book->wasRecentlyCreated) {
                return response()->json(['message' => '保存しました', 'book_id' => $book->id], 201);
            } else {
                return response()->json(['message' => 'このタイトルは既に存在します', 'book_id' => $book->id], 200);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => '保存に失敗しました', 422]);
        } catch (\Exception $e) {
            return response()->json(['message' => '内部エラーが発生しました'], 500);
        }
    }

    public function toggleFavorite(Request $request, Book $book)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => '認証されていません'], 401);
        }

        try {
            $bookId = $book->id;
            // 書籍存在チェック
            if (!$bookId) {
                return response()->json(['error' => '書籍が存在しません'], 404);
            }

            //　書籍がユーザーのライブラリにあるかを確認
            if (!Book::userHasAccess($user->id, $bookId)) {
                return response()->json(['message' => 'この書籍はあなたのライブラリに存在しません'], 403);
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
        } catch (\Exception $e) {
            return response()->json(['message' => '内部エラーが発生しました'], 500);
        }
    }

    public function storeCurrentBook(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => '認証されていません'], 401);
        }

        try {
            $bookId = $request->input('book_id');
            if (!$bookId) {
                return response()->json(['error' => '書籍が存在しません'], 404);
            }

            //　書籍がユーザーのライブラリにあるかを確認
            if (!Book::userHasAccess($user->id, $bookId)) {
                return response()->json(['message' => 'この書籍はあなたのライブラリに存在しません'], 403);
            }

            // User モデルを使用して現在の本を保存
            User::where('id', $user->id)->update(['book_id' => $bookId]);

            return response()->json(['message' => '現在の本を保存しました']);
        } catch (\Exception $e) {
            return response()->json(['message' => '内部エラーが発生しました'], 500);
        }
    }

    public function showCurrentBook(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => '認証されていません'], 401);
        }

        try {
            $current_book = User::where('id', $user->id)->value('book_id');
            if (!$current_book) {
                return response()->json(['message' => '現在読書中の書籍はありません '], 404);
            }

            //　書籍がユーザーのライブラリにあるかを確認
            if (!Book::userHasAccess($user->id, $current_book)) {
                return response()->json(['message' => 'この書籍はあなたのライブラリに存在しません'], 403);
            }

            return response()->json(
                ['current_book' => $current_book, 'message' => $current_book ? '現在の本を取得しました' : '現在の本を取得できませんでした']
            );
        } catch (\Exception $e) {
            return response()->json(['message' => '内部エラーが発生しました'], 500);
        }
    }
}

