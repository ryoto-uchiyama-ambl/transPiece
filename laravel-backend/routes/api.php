<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\PageController;

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
Route::get('/books', [BookController::class, 'index']);
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