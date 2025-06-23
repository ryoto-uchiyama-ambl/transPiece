<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Book;
use App\Models\Progress;
use Carbon\Carbon;

class BookControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_store_current_book()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        Progress::factory()->create(['user_id' => $user->id, 'book_id' => $book->id]);

        $response = $this->actingAs($user)->postJson('/api/currentBook', [
            'book_id' => $book->id
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => '現在の本を保存しました']);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'book_id' => $book->id,
        ]);
    }

    /** @test */
    public function it_returns_401_when_storing_current_book_without_authentication()
    {
        $response = $this->postJson('/api/currentBook', ['book_id' => 1]);
        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    /** @test */
    public function it_returns_403_when_storing_current_book_with_unrelated_book()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/currentBook', [
            'book_id' => $book->id
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'この書籍はあなたのライブラリに存在しません']);
    }

    /** @test */
    public function it_can_show_current_book()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        $user->update(['book_id' => $book->id]);
        Progress::factory()->create(['user_id' => $user->id, 'book_id' => $book->id]);

        $response = $this->actingAs($user)->getJson('/api/currentBook');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'current_book' => $book->id,
                'message' => '現在の本を取得しました'
            ]);
    }

    /** @test */
    public function it_returns_404_if_no_current_book()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->getJson('/api/currentBook');

        $response->assertStatus(404)
            ->assertJson(['message' => '現在読書中の書籍はありません ']);
    }

    /** @test */
    public function it_returns_401_when_showing_current_book_without_authentication()
    {
        $response = $this->getJson('/api/currentBook');
        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    /** @test */
    public function it_returns_403_when_showing_current_book_not_in_library()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        $user->update(['book_id' => $book->id]);

        $response = $this->actingAs($user)->getJson('/api/currentBook');

        $response->assertStatus(403)
            ->assertJson(['message' => 'この書籍はあなたのライブラリに存在しません']);
    }

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
                        'id', 'title', 'author', 'lang', 'downloads', 'gutenberg_url', 'is_favorite', 'current_page', 'total_page'
                    ]
                ],
                'stats' => [
                    'totalBooks', 'totalPages', 'favorites', 'recentlyAdded'
                ]
            ])
            ->assertJsonFragment([
                'totalBooks' => 1,
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
                    'totalBooks' => 0,
                    'totalPages' => 0,
                    'favorites' => 0,
                    'recentlyAdded' => '不明'
                ]
            ]);
    }

    /** @test */
    public function it_returns_error_when_user_is_not_authenticated()
    {
        $response = $this->getJson('/api/books');
        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    /** @test */
    public function it_toggles_favorite_status()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        Progress::factory()->create(['user_id' => $user->id, 'book_id' => $book->id, 'is_favorite' => false]);

        $response = $this->actingAs($user)->postJson("/api/book/{$book->id}/favorite");

        $response->assertStatus(200)
            ->assertJson(['favorite' => true]);

        $response = $this->actingAs($user)->postJson("/api/book/{$book->id}/favorite");

        $response->assertStatus(200)
            ->assertJson(['favorite' => false]);
    }

    /** @test */
    public function it_returns_403_when_toggling_favorite_on_unowned_book()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $response = $this->actingAs($user)->postJson("/api/book/{$book->id}/favorite");

        $response->assertStatus(403)
            ->assertJson(['message' => 'この書籍はあなたのライブラリに存在しません']);
    }

    /** @test */
    public function it_returns_401_when_not_authenticated_for_toggle_favorite()
    {
        $book = Book::factory()->create();

        $response = $this->postJson("/api/book/{$book->id}/favorite");
        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }
}
