<?php

// app/Http/Controllers/Api/BookController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Page;
use Illuminate\Support\Facades\Log;
use App\Models\Progress;

class PageController extends Controller
{
    public function show($book, Request $request)
    {
        // $user = Auth::user();

        // if (!$user) {
        //     $userId = 1;
        // }else {
        //     $userId = $user->id;
        // }

        $bookId = $book;
        if (!$bookId) {
            return response()->json(['error' => 'book_id is required'], 400);
        }

        $pages = Page::with('translations')
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
            }
        );
        return response()->json([
            'pages' => $pages
        ]);
    }

    public function saveTranslation(Request $request)
    {
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
                ->firstOrFail();

    $translation = $page->translations()->firstOrNew(['user_id' => auth()->id()]);
    $translation->translated_text = $request->translated_text;
    $translation->score = $request->score;
    $translation->AI_feedback = $request->AIfeedback;
    $translation->AI_text = $request->AItext;
    $translation->save();

    return response()->json(['message' => '保存しました']);
    }

    public function getCurrentPage(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        $currentPage = Progress::where('user_id', $user->id)
            ->where('book_id', $request->query('book_id'))
            ->value('current_page');

        return response()->json([
            'current_page' => $currentPage,
            'message' => '現在のページを取得しました'
        ]);
    }
}

