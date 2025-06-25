<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Progress;
use App\Models\Translation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function summary()
    {
        $user = Auth::user();

        // 指標を取得
        $getTotalTranslations = fn($start, $end) => Progress::where('user_id', $user->id)
            ->when($start && $end, fn($q) => $q->whereBetween('created_at', [$start, $end]))
            ->sum('current_page');
        $getAverageScore = function ($start = null, $end = null) use ($user) {
            $query = Translation::where('user_id', $user->id)
                ->whereNotNull('score');
            if ($start && $end) {
                $query->whereBetween('created_at', [$start, $end]);
            }
            return $query->avg('score') ?? 0;
        };
        $getCompletedBooks = function ($start = null, $end = null) use ($user) {
            $query = Progress::with('book')->where('user_id', $user->id);
            if ($start && $end) {
                $query->whereBetween('created_at', [$start, $end]);
            }
            return $query->get()
                ->filter(fn($p) => $p->book && $p->current_page === $p->book->page_count)
                ->count();
        };
        $getStreak = function ($start = null, $end = null) use ($user) {
            $query = Translation::where('user_id', $user->id);
            if ($start && $end) {
                $query->whereBetween('created_at', [$start, $end]);
            }
            $dates = $query->selectRaw('DATE(created_at) as date')
                ->distinct()
                ->orderByDesc('date')
                ->pluck('date')
                ->map(fn($d) => Carbon::parse($d)->toDateString());

            $currentDay = Carbon::today('Asia/Tokyo');
            $streak = 0;
            foreach ($dates as $date) {
                if ($date === $currentDay->toDateString()) {
                    $streak++;
                    $currentDay->subDay();
                } else {
                    break;
                }
            }
            return $streak;
        };


        // 総翻訳ページ数
        $totalTranslations = Progress::where('user_id', $user->id)->sum('current_page');

        // 点数の平均
        $averageScore = $getAverageScore(null, null);

        // 読了書籍
        $completedBooks = $getCompletedBooks(null, null);

        // 連続日数
        $streakDays = $getStreak(null, null);

        // トレンド
        $now = Carbon::now('Asia/Tokyo');
        $thisPeriodStart = $now->copy()->startOfMonth()->subMonth()->startOfDay();
        $thisPeriodEnd = $now->copy()->endOfDay();
        $prevPeriodStart = $thisPeriodStart->copy()->subMonth()->startOfDay();
        $prevPeriodEnd = $thisPeriodStart->copy()->subSecond();
        // 今期と前期の値
        $thisTotalTranslations = $getTotalTranslations($thisPeriodStart, $thisPeriodEnd);
        $prevTotalTranslations = $getTotalTranslations($prevPeriodStart, $prevPeriodEnd);

        $thisAverageScore = $getAverageScore($thisPeriodStart, $thisPeriodEnd);
        $prevAverageScore = $getAverageScore($prevPeriodStart, $prevPeriodEnd);

        $thisCompletedBooks = $getCompletedBooks($thisPeriodStart, $thisPeriodEnd);
        $prevCompletedBooks = $getCompletedBooks($prevPeriodStart, $prevPeriodEnd);

        // 変化量と増減判定
        $calcTrend = fn($thisValue, $prevValue) => [
            'value' => round($thisValue - $prevValue, 2),
            'positive' => ($thisValue - $prevValue) >= 0
        ];

        $trends = [
            'translations' => $calcTrend($thisTotalTranslations, $prevTotalTranslations),
            'score' => $calcTrend($thisAverageScore, $prevAverageScore),
            'books' => $calcTrend($thisCompletedBooks, $prevCompletedBooks),
        ];

        return response()->json([
            'totalTranslations' => $totalTranslations,
            'averageScore' => number_format($averageScore, 2),
            'completedBooks' => $completedBooks,
            'streakDays' => $streakDays,
            'trends' => $trends,
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

        // 日付フォーマット
        $format = match ($timeframe) {
            'week' => null,
            'month' => '%Y-%m',
            'year' => '%Y',
        };

        $query = DB::table('translations')
            ->where('user_id', $user->id)
            ->whereNotNull('score');

        if ($timeframe === 'week') {
            $query->selectRaw("
                DATE_FORMAT(DATE_SUB(created_at, INTERVAL (WEEKDAY(created_at)) DAY), '%Y-%m-%d') as period,
                COUNT(*) as translations,
                ROUND(AVG(score), 2) as score
            ")
                ->groupBy('period')
                ->orderByDesc('period');
        } else {
            $query->selectRaw("
                DATE_FORMAT(created_at, '{$format}') as period,
                COUNT(*) as translations,
                ROUND(AVG(score), 2) as score
            ")
                ->groupBy('period')
                ->orderByDesc('period');
        }

        // 30件制限
        $translations = $query
            ->limit(30)
            ->get()
            ->sortBy('period')
            ->values();

        return response()->json([
            'data' => $translations,
            'timeframe' => $timeframe,
        ]);

    }

    public function scoreDistribution()
    {
        $user = Auth::user();

        // スコア範囲ごとにカウント
        $distribution = DB::table('translations')
            ->selectRaw("
        CASE
            WHEN score BETWEEN 90 AND 100 THEN '90-100'
            WHEN score BETWEEN 80 AND 89 THEN '80-89'
            WHEN score BETWEEN 70 AND 79 THEN '70-79'
            WHEN score BETWEEN 60 AND 69 THEN '60-69'
            ELSE '0-59'
        END AS `range`,
        COUNT(*) AS `count`
    ")
            ->where('user_id', $user->id)
            ->whereNotNull('score')
            ->groupBy('range')
            ->orderByRaw("FIELD(`range`, '90-100', '80-89', '70-79', '60-69', '0-59')")
            ->get()
            ->map(function ($item) {
                $labels = [
                    '90-100' => '優秀',
                    '80-89' => '良い',
                    '70-79' => '普通',
                    '60-69' => '注意',
                    '0-59' => '要改善',
                ];
                return [
                    'range' => $item->range,
                    'label' => $labels[$item->range] ?? $item->range,
                    'count' => $item->count,
                ];
            });

        return response()->json([
            'distribution' => $distribution,
        ]);
    }

    public function languages()
    {
        $user = Auth::user();

        // user_idでprogressのbook_idを取得し、本の言語ごとに集計
        $languages = DB::table('progress')
            ->join('books', 'progress.book_id', '=', 'books.id')
            ->select('books.lang as language', DB::raw('COUNT(DISTINCT books.id) as bookCount'))
            ->where('progress.user_id', $user->id)
            ->groupBy('books.lang')
            ->get();

        return response()->json([
            'languages' => $languages,
            'message' => '取得に成功しました'
        ]);
    }

    public function recentActivity(Request $request)
    {
        $user = Auth::user();
        $limit = (int) $request->query('limit', 10);

        $activities = \DB::table('translations as t')
            ->join('pages as p', 't.page_id', '=', 'p.id')
            ->join('books as b', 'p.book_id', '=', 'b.id')
            ->select([
                \DB::raw('DATE(t.created_at) as date'),
                'b.title as bookTitle',
                \DB::raw('MAX(p.page_number) as paragraphsTranslated'),
                \DB::raw('ROUND(AVG(t.score), 2) as score'),
            ])
            ->where('t.user_id', $user->id)
            ->groupBy('date', 'b.id', 'b.title')
            ->orderByDesc('date')
            ->limit($limit)
            ->get();

        return response()->json([
            'activities' => $activities,
        ]);
    }
}
