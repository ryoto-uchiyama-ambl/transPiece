<?php

// app/Http/Controllers/Api/BookController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Page;
use Illuminate\Support\Facades\Log;

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
                        ];
                    }),
                ];
            }
        );
        return response()->json([
            'pages' => $pages
        ]);
    }
}

