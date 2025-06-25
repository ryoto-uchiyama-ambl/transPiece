<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Progress;
use App\Models\Translation;
use Carbon\Carbon;

class StatsController extends Controller
{
    public function summary()
    {
        $user = Auth::user();

        // 総翻訳ページ数取得
        $totalTranslations = Progress::where('user_id', $user->id)->sum('current_page');
        // 点数の平均取得
        $progresses = Progress::with('book.pages.translations')->where('user_id', $user->id)->get();
        foreach ($progresses as $progress) {
            $book = $progress->book;
            if (!$book)
                continue;
            foreach ($book->pages as $page) {
                foreach ($page->translations as $translation) {
                    if ($translation->user_id === $user->id && $translation->score !== null) {
                        $scores[] = $translation->score;
                    }
                }
            }
        }
        $averageScore = count($scores) > 0 ? array_sum($scores) / count($scores) : 0;
        // 読了書籍
        $completedBooks = Progress::with('book')->where('user_id', $user->id)->get()
        ->filter(function ($progress) {
            return $progress->book && $progress->current_page === $progress->book->page_count;
        })->count();
        // 連続日数
        $translatedDates = Translation::where('user_id', $user->id)->selectRaw('DATE(created_at) as date')
        ->distinct()->orderByDesc('date')->pluck('date')->map(fn($d) => Carbon::parse($d)->toDateString());
        $today = Carbon::today();
        $streak = 0;
        foreach($translatedDates as $date) {
            if($date === $today->toDateString()) {
                $today->subday();
            }elseif($date === $today->copy()->subDay()->toDateString()) {
                $streak++;
                $today->subDay();
            }else {
                break;
            }
        }
        $streakDays = $streak;

        $trends = [
            'translations' => [
                'value' => 12,
                'positive' => true,
            ],
            'score' => [
                'value' => 3.5,
                'positive' => true,
            ],
            'books' => [
                'value' => 4,
                'positive' => false,
            ],
            'streak' => [
                'value' => 40,
                'positive' => true,
            ]
        ];

        return response()->json([
            'totalTranslations' => $totalTranslations,
            'averageScore' => number_format($averageScore, 2),
            'completedBooks' => $completedBooks,
            'streakDays' => $streakDays,
            'trends' => $trends
        ]);
    }

    public function progress(Request $request)
    {
        $user = Auth::user();

        $timeframe = $request->query('timeframe', 'week');
        if (!in_array($timeframe, ['week', 'month', 'year'])) {
            return response()->json([
                'message' => 'timeframeは week, month, year のいずれかで指定してください。'
            ], 422);
        }

        // ダミー
        $data = match ($timeframe) {
            'week' => [
                ['period' => '2025-06-19', 'translations' => 4, 'score' => 76.5],
                ['period' => '2025-06-20', 'translations' => 5, 'score' => 80.1],
                ['period' => '2025-06-21', 'translations' => 7, 'score' => 78.0],
                ['period' => '2025-06-22', 'translations' => 2, 'score' => 72.0],
                ['period' => '2025-06-23', 'translations' => 6, 'score' => 85.3],
                ['period' => '2025-06-24', 'translations' => 8, 'score' => 88.2],
                ['period' => '2025-06-25', 'translations' => 9, 'score' => 90.0],
            ],
            'month' => [
                ['period' => '2025-06-01', 'translations' => 8, 'score' => 85.2],
                ['period' => '2025-06-08', 'translations' => 5, 'score' => 78.6],
                ['period' => '2025-06-15', 'translations' => 10, 'score' => 91.3],
                ['period' => '2025-06-22', 'translations' => 7, 'score' => 82.4],
            ],
            'year' => [
                ['period' => '2024-07', 'translations' => 20, 'score' => 80.0],
                ['period' => '2024-08', 'translations' => 23, 'score' => 84.2],
                ['period' => '2024-09', 'translations' => 19, 'score' => 79.5],
                ['period' => '2024-10', 'translations' => 26, 'score' => 87.1],
                ['period' => '2024-11', 'translations' => 15, 'score' => 75.0],
                ['period' => '2024-12', 'translations' => 30, 'score' => 89.3],
                ['period' => '2025-01', 'translations' => 22, 'score' => 83.8],
                ['period' => '2025-02', 'translations' => 17, 'score' => 77.0],
                ['period' => '2025-03', 'translations' => 28, 'score' => 90.5],
                ['period' => '2025-04', 'translations' => 24, 'score' => 85.7],
                ['period' => '2025-05', 'translations' => 19, 'score' => 79.1],
                ['period' => '2025-06', 'translations' => 25, 'score' => 88.0],
            ],
        };

        return response()->json([
            'data' => $data,
            'timeframe' => $timeframe,
        ]);
    }

    public function scoreDistribution()
    {
        $user = Auth::user();

        // ダミー
        return response()->json([
            'distribution' => [
                ['range' => '90-100', 'label' => '優秀', 'count' => 20],
                ['range' => '80-89', 'label' => '良い', 'count' => 35],
                ['range' => '70-79', 'label' => '普通', 'count' => 15],
                ['range' => '60-69', 'label' => '注意', 'count' => 8],
                ['range' => '0-59', 'label' => '要改善', 'count' => 5],
            ]
        ]);
    }

    public function languages()
    {
        return response()->json([
            'languages' => [
                ['language' => 'English', 'bookCount' => 45],
                ['language' => 'French', 'bookCount' => 20],
                ['language' => 'Spanish', 'bookCount' => 15],
            ],
            'message' => '取得に成功しました'
        ]);
    }

    public function recentActivity(Request $request)
    {
        $limit = (int) $request->query('limit', 10);

        // ダミーデータ（必要に応じてもっと追加可）
        $allActivities = [
            [
                'date' => '2025-06-25',
                'bookTitle' => 'Frankenstein',
                'paragraphsTranslated' => 2,
                'score' => 90,
                'bookId' => 'book_001',
            ],
            [
                'date' => '2025-06-24',
                'bookTitle' => 'Les Misérables',
                'paragraphsTranslated' => 3,
                'score' => 85,
                'bookId' => 'book_002',
            ],
            [
                'date' => '2025-06-23',
                'bookTitle' => 'Don Quixote',
                'paragraphsTranslated' => 4,
                'score' => 82,
                'bookId' => 'book_003',
            ],
            [
                'date' => '2025-06-22',
                'bookTitle' => 'Pride and Prejudice',
                'paragraphsTranslated' => 3,
                'score' => 87,
                'bookId' => 'book_123',
            ],
            [
                'date' => '2025-06-21',
                'bookTitle' => 'The Divine Comedy',
                'paragraphsTranslated' => 1,
                'score' => 95,
                'bookId' => 'book_004',
            ],
            // さらに追加可
        ];

        $activities = array_slice($allActivities, 0, $limit);

        return response()->json([
            'activities' => $activities,
            'message' => '取得に成功しました'
        ]);
    }
}
