<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Book;
use App\Models\Progress;
use Carbon\Carbon;


class BookControllerTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic feature test example.
     */

     /** @test */
    public function it_returns_books_and_stats_for_authenticated_user()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create(['page_count' => 300]);
        $progress = Progress::factory()->create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'is_favorite' => true,
            'current_page' => 50,
            'created_at' => Carbon::now()->subDays(2),
            'updated_at' => Carbon::now(),
        ]);

        $response = $this->actingAs($user)->getJson('/api/books');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'books' => [
                    '*' => [
                        'id',
                        'title',
                        'author',
                        'lang',
                        'downloads',
                        'gutenberg_url',
                        'is_favorite',
                        'current_page',
                        'total_page'
                    ]
                ],
                'stats' => [
                    'total',
                    'favorites',
                    'recentlyAdded',
                ]
            ])
            ->assertJsonFragment([
                'total' => 1,
                'favorites' => 1,
            ]);
    }

    /** @test */
    public function it_handles_when_no_progress_exists()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->getJson('/api/books');

        $response->assertStatus(200)
            ->assertJson([
                'books' => [],
                'stats' => [
                    'total' => 0,
                    'favorites' => 0,
                    'recentlyAdded' => '不明'
                ]
                ]);
    }

    /** @test */
    public function it_returns_error_when_user_is_not_authenticated()
    {
        $response = $this->getJson('/api/books');
        $response->assertStatus(401);
    }
}
