<?php

use App\Http\Controllers\Api\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\VocabularyController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\MailController;
use App\Http\Controllers\Api\SubscriptionController;
/*

|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

//　ログイン
Route::post('/login', [AuthController::class, 'login']);
// ログアウト
Route::post('/logout', [AuthController::class, 'logout']);
// ユーザー登録
Route::post('/register', [AuthController::class, 'register']);
// 本保存
Route::middleware('auth:sanctum')->post('/books', [BookController::class, 'store']);
// 本一覧
Route::middleware('auth:sanctum')->get('/books', [BookController::class, 'index']);
// お気に入り変更
Route::middleware('auth:sanctum')->post('/books/{book}/favorite', [BookController::class, 'toggleFavorite']);
// 本表示
Route::middleware('auth:sanctum')->get('/book/{book}', [PageController::class, 'show']);

// 単語翻訳
Route::middleware('auth:sanctum')->post('/translateWord', function (Request $request) {
    $word = $request->input('word');

    $response = Http::withHeaders([
        'Authorization' => 'DeepL-Auth-Key ' . env('DEEPL_API_KEY'),
    ])->asForm()->post('https://api-free.deepl.com/v2/translate', [
        'text' => $word,
        'source_lang' => 'EN',
        'target_lang' => 'JA',
    ]);

    return $response->json();
});

// 翻訳保存
Route::middleware('auth:sanctum')->post('/translations', [PageController::class, 'storeTranslation']);
// 現在の本保存
Route::middleware('auth:sanctum')->post('/currentBook', [BookController::class, 'storeCurrentBook']);
// AI採点評価取得
Route::middleware('auth:sanctum')->post('/gradeTranslation', [ChatController::class, 'gradeTranslation']);
// 単語保存
Route::middleware('auth:sanctum')->post('/saveWord', [VocabularyController::class, 'saveWord']);
// 単語一覧
Route::middleware('auth:sanctum')->get('/vocabulary', [VocabularyController::class, 'index']);
// **
Route::middleware('auth:sanctum')->post('/vocabulary', [VocabularyController::class, 'store']);
// **
Route::middleware('auth:sanctum')->get('/review-cards', [VocabularyController::class, 'reviewCards']);
// カード変更
Route::middleware('auth:sanctum')->post('/review/{id}', [VocabularyController::class, 'update']);
// 現在の本取得
Route::middleware('auth:sanctum')->get('/currentBook', [BookController::class, 'showCurrentBook']);
// 現在のページ取得
Route::middleware('auth:sanctum')->get('/getCurrentPage', [PageController::class, 'getCurrentPage']);
// 学習対象取得
Route::middleware('auth:sanctum')->get('/getVocabularyStudies', [VocabularyController::class, 'getVocabularyStudies']);

Route::middleware('auth:sanctum')->post('/pushSubscribe', function (Request $request) {
    $request->validate([
        'endpoint' => 'required|string',
        'publicKey' => 'required|string',
        'authToken' => 'required|string',
    ]);

    $request->user()->pushSUbscriptions()->updateOrCreate(
        ['endpoint' => $request->endpoint],
        ['public_ley' => $request->publicKey, 'authToken' => $request->AuthToken]
    );

    return response()->json(['message' => 'Subscribed']);
});

// 統計サマリ取得
Route::middleware('auth:sanctum')->get('/stats/summary', [StatsController::class, 'summary']);
// 翻訳進捗取得
Route::middleware('auth:sanctum')->get('/stats/progress', [StatsController::class, 'progress']);
// スコア分布取得
Route::middleware('auth:sanctum')->get('/stats/scoreDistribution', [StatsController::class, 'scoreDistribution']);
// 言語別統計取得
Route::middleware('auth:sanctum')->get('/stats/languages', [StatsController::class, 'languages']);
// 最近の翻訳取得
Route::middleware('auth:sanctum')->get('/stats/recentActivity', [StatsController::class, 'recentActivity']);
// メール送信
Route::middleware('auth:sanctum')->post('/email/resend', [MailController::class, 'resendVerificationEmail']);
// ユーザープロファイル情報取得
Route::middleware('auth:sanctum')->get('/user/profile', [ProfileController::class, 'show']);
// ユーザー情報更新
Route::middleware('auth:sanctum')->put('/user/profile', [ProfileController::class, 'update']);
// プッシュ通知設定取得
Route::middleware('auth:sanctum')->get('/user/notificationSettings', [SubscriptionController::class, 'show']);
// プッシュ通知設定更新
Route::middleware('auth:sanctum')->put('/user/notificationSettings', [SubscriptionController::class, 'update']);
// プッシュ通知サブスクリプション登録
Route::middleware('auth:sanctum')->post('/user/pushSubscription', [SubscriptionController::class, 'pushSubscribe']);