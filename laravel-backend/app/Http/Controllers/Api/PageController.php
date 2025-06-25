<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Page;
use Illuminate\Support\Facades\Log;
use App\Models\Progress;
use App\Models\Book;

class PageController extends Controller
{
    public function show($book, Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => '認証されていません'], 401);
        }

        try {
            $bookId = (int) $book;
            
            // 書籍存在チェック - bookIdが0や空の場合
            if (!$bookId) {
                return response()->json(['error' => '書籍が存在しません'], 404);
            }

            // 書籍がDBに存在するかチェック
            $bookModel = Book::find($bookId);
            if (!$bookModel) {
                return response()->json(['error' => '書籍が存在しません'], 404);
            }

            // 書籍がユーザーのライブラリにあるかを確認
            if (!Book::userHasAccess($user->id, $bookId)) {
                return response()->json(['message' => 'この書籍はあなたのライブラリに存在しません'], 403);
            }

            $pages = Page::with(['translations' => function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                }])
                ->where('book_id', $bookId)
                ->get()
                ->map(function ($page) {
                    return [
                        'page_number' => $page->page_number,
                        'content' => $page->content,
                        'translations' => $page->translations->map(function ($translation) {
                            return [
                                'translatedText' => $translation->translated_text,
                                'score' => $translation->score ?? 0,
                                'AIfeedback' => $translation->AI_feedback ?? '',
                                'AItext' => $translation->AI_text ?? '',
                            ];
                        }),
                    ];
                });
                
            return response()->json([
                'pages' => $pages
            ]);
        } catch (\Exception $e) {
            Log::error('PageController show error: ' . $e->getMessage());
            return response()->json(['message' => '内部エラーが発生しました'], 500);
        }
    }

    public function storeTranslation(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => '認証されていません'], 401);
            }

            $request->validate([
                'book_id' => 'required|integer',
                'page_number' => 'required|integer',
                'translated_text' => 'required|string',
                'score' => 'nullable|integer',
                'AIfeedback' => 'nullable|string',
                'AItext' => 'nullable|string',
            ]);

            $page = Page::where('book_id', $request->book_id)
                ->where('page_number', $request->page_number)
                ->first();
                
            if (!$page) {
                return response()->json(['error' => 'ページが見つかりません'], 404);
            }

            $translation = $page->translations()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'translated_text' => $request->translated_text,
                    'score' => $request->score,
                    'AI_feedback' => $request->AIfeedback,
                    'AI_text' => $request->AItext,
                ]
            );

            return response()->json(['message' => '保存しました']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'バリデーションエラー',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('PageController storeTranslation error: ' . $e->getMessage());
            return response()->json(['message' => '内部エラーが発生しました'], 500);
        }
    }

    public function getCurrentPage(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            $bookId = $request->query('book_id');
            if (!$bookId) {
                return response()->json(['error' => 'book_id is required'], 400);
            }

            $currentPage = Progress::where('user_id', $user->id)
                ->where('book_id', $bookId)
                ->value('current_page');

            return response()->json([
                'current_page' => $currentPage,
                'message' => '現在のページを取得しました'
            ]);
        } catch (\Exception $e) {
            Log::error('PageController getCurrentPage error: ' . $e->getMessage());
            return response()->json(['message' => '内部エラーが発生しました'], 500);
        }
    }
}