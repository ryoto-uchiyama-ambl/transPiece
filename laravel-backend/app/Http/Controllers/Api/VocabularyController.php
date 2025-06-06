<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Vocabulary;
use Illuminate\Support\Facades\Log;


class VocabularyController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $vocabulary = Vocabulary::where('user_id', $user->id)->get()
        ->map(function ($item) {
            return [
                'id' => $item->id,
                'word' => $item->word,
                'translation' => $item->translation,
                'part_of_speech' => $item->part_of_speech,
                'language' => $item->language === 'en' ? 'English' : $item->language,
                'is_understanding' => (bool) $item->is_understanding,
            ];
        });

        return response()->json($vocabulary);
    }

    public function saveWord(Request $request) {

        $user = Auth::user();

        // $request->validate([
        // 'word' => 'required|string',
        // 'translation' => 'required|string',
        // 'book_id' => 'required|integer',
        // 'page_id' => 'required|integer',
        // ]);

        // 同じ単語があれば更新、なければ作成
        $vocabulary = Vocabulary::firstOrNew([
            'user_id' => $user->id,
            'word' => $request->word,
            'translation' => $request->translation,
            'book_id' => $request->book_id,
            'page_id' => $request->page_id,
        ])->save();

        return response()->json([
            'message' => '単語が保存されました',
            'data' => $vocabulary,
        ], 201);
    }
}
