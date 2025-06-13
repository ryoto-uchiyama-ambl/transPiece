<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Vocabulary;
use Illuminate\Support\Facades\Log;
use App\Models\VocabularySchedule;
use Carbon\Carbon;


class VocabularyController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $vocabulary = Vocabulary::with('schedule')
            ->where('user_id', $user->id)->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'word' => $item->word,
                    'translation' => $item->translation,
                    'part_of_speech' => $item->part_of_speech,
                    'language' => $item->language === 'en' ? 'English' : $item->language,
                    'is_understanding' => optional($item->schedule)->state,
                    'due' => optional($item->schedule)->due,
                ];
            });

        return response()->json($vocabulary);
    }

    public function saveWord(Request $request)
    {

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

    public function store(Request $request)
    {
        $request->validate([
            'front' => 'required|string',
            'back' => 'required|string',
            'user_id' => 'required|exists:users,id',
            'fsrs_card' => 'required|array',
        ]);

        $vocab = Vocabulary::create([
            'word' => $request->front,
            'translation' => $request->back,
            'user_id' => $request->user_id,
            'book_id' => 1, // 仮に適当な book_id を入れる（要設計）
            'page_id' => 1, // 同上
            'language' => 'en',
        ]);

        $card = $request->fsrs_card;

        VocabularySchedule::create([
            'vocabulary_id' => $vocab->id,
            'user_id' => $request->user_id,
            'stability' => $card['stability'],
            'difficulty' => $card['difficulty'],
            'reps' => $card['reps'],
            'elapsed_days' => $card['elapsed_days'],
            'due' => Carbon::parse($card['due'])->toDateTimeString(),
            'last_review' => now(),
        ]);

        return response()->json(['message' => 'Vocabulary added.']);
    }

    public function reviewCards(Request $request)
    {
        $user = Auth::user();
        $now = now();

        $cards = VocabularySchedule::with('vocabulary')
            ->where('user_id', $user->id)
            ->whereNotNull('due')
            ->where('due', '<=', $now)
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'fsrsCard' => [
                        'stability' => $schedule->stability,
                        'difficulty' => $schedule->difficulty,
                        'reps' => $schedule->reps,
                        'elapsed_days' => $schedule->elapsed_days,
                        'last_review' => $schedule->last_review,
                        'due' => $schedule->due,
                        'state' => $schedule->state,
                        'scheduled_days' => $schedule->scheduled_days,
                        'learning_steps' => $schedule->learning_steps,
                    ],
                    'front' => $schedule->vocabulary->word,
                    'back' => $schedule->vocabulary->translation,
                ];
            });
        return response()->json($cards);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'fsrsCard' => 'required|array',
            'log' => 'required|array',
        ]);

        $schedule = VocabularySchedule::findOrFail($id);

        $fsrsCard = $request->input('fsrsCard');

        // fsrsCardの各フィールドを更新
        $schedule->stability = $fsrsCard['stability'] ?? $schedule->stability;
        $schedule->difficulty = $fsrsCard['difficulty'] ?? $schedule->difficulty;
        $schedule->reps = $fsrsCard['reps'] ?? $schedule->reps;
        $schedule->elapsed_days = $fsrsCard['elapsed_days'] ?? $schedule->elapsed_days;
        $schedule->state = $fsrsCard['state'] ?? $schedule->state;
        $schedule->scheduled_days = $fsrsCard['scheduled_days'] ?? $schedule->scheduled_days;
        $schedule->learning_steps = $fsrsCard['learning_steps'] ?? $schedule->learning_steps;

        if (!empty($fsrsCard['due'])) {
            $schedule->due = Carbon::parse($fsrsCard['due'])->toDateTimeString();
        }

        if (!empty($fsrsCard['last_review'])) {
            $schedule->last_review = Carbon::parse($fsrsCard['last_review'])->toDateTimeString();
        }

        $schedule->save();

        // ログの保存処理があればここで行う
        // 例: $schedule->logs()->create($request->input('log'));

        return response()->json([
            'message' => 'Review updated successfully',
            'schedule' => $schedule,
        ]);
    }

    public function getVocabularyStudies()
    {
        $user = Auth::user();

        $vocabulary = Vocabulary::with('schedule')
            ->where('user_id', $user->id)
            ->whereHas('schedule', function ($query) {
                $query->where('due', '<=', now())
                    ->whereNotNull('due');
            })
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'word' => $item->word,
                    'translation' => $item->translation,
                    'part_of_speech' => $item->part_of_speech,
                    'language' => $item->language === 'en' ? 'English' : $item->language,
                    'is_understanding' => optional($item->schedule)->state,
                    'due' => optional($item->schedule)->due,
                ];
            });

        return response()->json($vocabulary);
    }
}
