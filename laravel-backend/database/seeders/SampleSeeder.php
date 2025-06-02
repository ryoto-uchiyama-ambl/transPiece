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

class SampleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Book::factory()
        ->count(10)->create()
        ->each(function ($book) {
            for ($i = 1; $i <= $book->page_count; $i++) {
                Page::factory()->create([
                    'book_id' => $book->id,
                    'page_number' => $i,
                ]);
            };

            $currentPage = rand(0, $book->page_count);
            Progress::factory()->create([
                'user_id' => 2,
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

        Vocabulary::factory()
        ->count(100)->create();
    }
}
