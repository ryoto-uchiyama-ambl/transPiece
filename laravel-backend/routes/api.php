<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\VocabularyController;
use SpomkyLabs\Pki\X509\Certificate\Extension\AccessDescription\AuthorityAccessDescription;

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

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/register', [AuthController::class, 'register']);

Route::post('/addBook', [BookController::class, 'store']);
//Route::middleware('auth:sanctum')->get('/books', [BookController::class, 'index']);
Route::middleware('auth:sanctum')->get('/books', [BookController::class, 'index']);
Route::post('/books/{book}/toggleFavorite', [BookController::class, 'toggleFavorite']);
Route::get('/book/{book}', [PageController::class, 'show']);


Route::post('/translate-word', function (Request $request) {
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

Route::post('/saveTranslation', [PageController::class, 'saveTranslation']);
Route::middleware('auth:sanctum')->post('/currentBook', [BookController::class, 'saveCurrentBook']);
Route::post('/grade-translation', [ChatController::class, 'gradeTranslation']);
Route::post('/saveWord', [VocabularyController::class, 'saveWord']);
Route::middleware('auth:sanctum')->get('/vocabulary', [VocabularyController::class, 'index']);
Route::middleware('auth:sanctum')->post('/vocabulary', [VocabularyController::class, 'store']);
Route::middleware('auth:sanctum')->get('/review-cards', [VocabularyController::class, 'reviewCards']);
Route::middleware('auth:sanctum')->post('/review/{id}', [VocabularyController::class, 'update']);
Route::middleware('auth:sanctum')->get('/getCurrentBook', [BookController::class, 'getCurrentBook']);
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