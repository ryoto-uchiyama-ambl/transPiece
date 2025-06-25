<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Book;
use App\Models\Page;
use App\Models\Progress;
use App\Models\Translation;
use App\Models\Vocabulary;
use App\Models\User;
use App\Models\VocabularySchedule;

class DummySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->count(20)->create();

        Book::factory()
            ->count(300)->create()
            ->each(function ($book) {
                for ($i = 1; $i <= $book->page_count; $i++) {
                    Page::factory()->create([
                        'book_id' => $book->id,
                        'page_number' => $i,
                    ]);
                };

                $currentPage = rand(0, $book->page_count);
                Progress::factory()->create([
                    'user_id' => rand(1, 20), // ユーザーIDをランダムに設定
                    'book_id' => $book->id,
                    'current_page' => $currentPage,
                    'is_favorite' => rand(0, 1),
                ]);

                if ($currentPage > 0) {
                    $pages = Page::where('book_id', $book->id)
                        ->where('page_number', '<', $currentPage)
                        ->get();

                    foreach ($pages as $page) {
                        Translation::factory()->create([
                            'page_id' => $page->id,
                        ]);
                    }
                }
            });

        $userIds = User::pluck('id')->toArray();
        foreach ($userIds as $userId) {
            // そのユーザーのProgressからbook_id と current_page を取得
            $progresses = Progress::where('user_id', $userId)->get();

            foreach ($progresses as $progress) {
                $bookId = $progress->book_id;
                $maxPageNumber = $progress->current_page;

                if ($maxPageNumber < 1) {
                    // current_pageが0なら単語は作らない or 適宜処理
                    continue;
                }

                // 対象ページを取得（current_page 以下のページID）
                $validPageIds = Page::where('book_id', $bookId)
                    ->where('page_number', '<=', $maxPageNumber)
                    ->pluck('id')
                    ->toArray();

                // ランダムに単語数を決めてVocabularyを作成
                $vocabularyCount = rand(1, 5);

                for ($i = 0; $i < $vocabularyCount; $i++) {
                    $pageId = fake()->randomElement($validPageIds);

                    $vocab = Vocabulary::factory()->create([
                        'user_id' => $userId,
                        'book_id' => $bookId,
                        'page_id' => $pageId,
                    ]);

                    // Vocabulary_scheduleをVocabularyに対して1つ作成
                    VocabularySchedule::factory()->create([
                        'vocabulary_id' => $vocab->id,
                        'user_id' => $userId,
                    ]);
                }
            }
        }
    }
}
