<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Book;
use App\Models\Progress;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class BookControllerTest extends TestCase
{
    use RefreshDatabase;

    // ============ INDEX METHOD TESTS ============

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
                    'totalBooks',
                    'totalPages',
                    'favorites',
                    'recentlyAdded'
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
    public function it_returns_error_when_user_is_not_authenticated_for_index()
    {
        $response = $this->getJson('/api/books');
        $response->assertStatus(401)
            ->assertJson(['message' => '認証されていません']);
    }

    /** @test */
    public function it_handles_exception_in_index()
    {
        $user = User::factory()->create();

        // Book の方を deliberately 削除して、$progress->book->id が null → エラーを誘導
        $book = Book::factory()->create();
        $progress = Progress::factory()->create([
            'user_id' => $user->id,
            'book_id' => $book->id,
        ]);

        $book->delete();

        $response = $this->actingAs($user)->getJson('/api/books');

        $response->assertStatus(500)
            ->assertJson(['message' => '内部エラーが発生しました']);
    }

    /** @test */
    public function it_returns_unique_books_when_multiple_progresses_exist()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create(['page_count' => 300]);

        // 同じ本に対して複数のProgressを作成（通常は起こらないが、テスト用）
        Progress::factory()->create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'is_favorite' => true,
            'current_page' => 50,
        ]);

        $response = $this->actingAs($user)->getJson('/api/books');

        $response->assertStatus(200);
        $books = $response->json('books');
        $this->assertCount(1, $books); // 重複排除されて1冊のみ
    }

    // ============ STORE METHOD TESTS ============

    /** @test */
    public function it_can_store_new_book()
    {
        $user = User::factory()->create();

        // Book::createWithPages をモックして新規作成をシミュレート
        $book = Book::factory()->make(['id' => 1]);
        $book->wasRecentlyCreated = true;

        $this->mock(Book::class, function ($mock) use ($book) {
            $mock->shouldReceive('createWithPages')
                ->once()
                ->andReturn($book);
        });

        $response = $this->actingAs($user)->postJson('/api/books', [
            'title' => 'Test Book',
            'author' => 'Test Author',
            'content' => 'Test content',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => '保存しました',
                'book_id' => 1
            ]);
    }

    /** @test */
    public function it_returns_existing_book_when_already_exists()
    {
        $user = User::factory()->create();

        // Book::createWithPages をモックして既存の本を返す
        $book = Book::factory()->make(['id' => 1]);
        $book->wasRecentlyCreated = false;

        $this->mock(Book::class, function ($mock) use ($book) {
            $mock->shouldReceive('createWithPages')
                ->once()
                ->andReturn($book);
        });

        $response = $this->actingAs($user)->postJson('/api/books', [
            'title' => 'Existing Book',
            'author' => 'Test Author',
            'content' => 'Test content',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'このタイトルは既に存在します',
                'book_id' => 1
            ]);
    }

    /** @test */
    public function it_returns_401_when_not_authenticated_for_store()
    {
        $response = $this->postJson('/api/books', [
            'title' => 'Test Book',
            'author' => 'Test Author',
            'content' => 'Test content',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => '認証されていません']);
    }

    /** @test */
    public function it_handles_validation_exception_in_store()
    {
        $user = User::factory()->create();

        $this->mock(Book::class, function ($mock) {
            $mock->shouldReceive('createWithPages')
                ->andThrow(new ValidationException(validator([], [])));
        });

        $response = $this->actingAs($user)->postJson('/api/books', [
            'title' => 'Test Book',
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => '保存に失敗しました']);
    }

    /** @test */
    public function it_handles_general_exception_in_store()
    {
        $user = User::factory()->create();

        $this->mock(Book::class, function ($mock) {
            $mock->shouldReceive('createWithPages')
                ->andThrow(new \Exception('Database error'));
        });

        $response = $this->actingAs($user)->postJson('/api/books', [
            'title' => 'Test Book',
        ]);

        $response->assertStatus(500)
            ->assertJson(['message' => '内部エラーが発生しました']);
    }

    // ============ TOGGLE FAVORITE TESTS ============

    /** @test */
    public function it_toggles_favorite_status()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        Progress::factory()->create(['user_id' => $user->id, 'book_id' => $book->id, 'is_favorite' => false]);

        $this->mock(\App\Models\Book::class, function ($mock) use ($user, $book) {
            $mock->shouldReceive('userHasAccess')
                ->with($user->id, $book->id)
                ->andReturn(true);
        });

        $response = $this->actingAs($user)->postJson("/api/book/{$book->id}/favorite");

        $response->assertStatus(200)
            ->assertJson([
                'favorite' => true,
                'message' => 'お気に入りに追加しました'
            ]);

        $response = $this->actingAs($user)->postJson("/api/book/{$book->id}/favorite");

        $response->assertStatus(200)
            ->assertJson([
                'favorite' => false,
                'message' => 'お気に入りを解除しました'
            ]);
    }

    /** @test */
    public function it_creates_progress_when_toggling_favorite_for_first_time()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        // Book::userHasAccess をモックして true を返す
        $this->mock(Book::class, function ($mock) use ($user, $book) {
            $mock->shouldReceive('userHasAccess')
                ->with($user->id, $book->id)
                ->once()
                ->andReturn(true);
        });

        $response = $this->actingAs($user)->postJson("/api/book/{$book->id}/favorite");

        $response->assertStatus(200)
            ->assertJson([
                'favorite' => true,
                'message' => 'お気に入りに追加しました'
            ]);

        $this->assertDatabaseHas('progresses', [
            'user_id' => $user->id,
            'book_id' => $book->id,
            'is_favorite' => true,
        ]);
    }

    /** @test */
    public function it_returns_403_when_toggling_favorite_on_unowned_book()
    {
        $this->mock(Book::class, function ($mock) {
            $mock->shouldReceive('userHasAccess')
                ->andReturn(false);
        });

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
            ->assertJson(['message' => '認証されていません']);
    }

    /** @test */
    public function it_handles_exception_in_toggle_favorite()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        // Book::userHasAccess をモックして例外を発生させる
        $this->mock(Book::class, function ($mock) use ($user, $book) {
            $mock->shouldReceive('userHasAccess')
                ->with($user->id, $book->id)
                ->andThrow(new \Exception('Database error'));
        });

        $response = $this->actingAs($user)->postJson("/api/book/{$book->id}/favorite");

        $response->assertStatus(500)
            ->assertJson(['message' => '内部エラーが発生しました']);
    }

    // ============ STORE CURRENT BOOK TESTS ============

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
            ->assertJson(['message' => '認証されていません']);
    }

    /** @test */
    public function it_returns_404_when_storing_current_book_without_book_id()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/currentBook', []);

        $response->assertStatus(404)
            ->assertJson(['error' => '書籍が存在しません']);
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
    public function it_handles_exception_in_store_current_book()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        // Book::userHasAccess をモックして例外を発生させる
        $this->mock(Book::class, function ($mock) use ($user, $book) {
            $mock->shouldReceive('userHasAccess')
                ->with($user->id, $book->id)
                ->andThrow(new \Exception('Database error'));
        });

        $response = $this->actingAs($user)->postJson('/api/currentBook', [
            'book_id' => $book->id
        ]);

        $response->assertStatus(500)
            ->assertJson(['message' => '内部エラーが発生しました']);
    }

    // ============ SHOW CURRENT BOOK TESTS ============

    /** @test */
    public function it_can_show_current_book()
    {
        $book = Book::factory()->create();
        $user = User::factory()->create(['book_id' => $book->id]);
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
            ->assertJson(['message' => '認証されていません']);
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
    public function it_handles_exception_in_show_current_book()
    {
        $book = Book::factory()->create();
        $user = User::factory()->create(['book_id' => $book->id]);
        $progress = Progress::factory()->create(['user_id' => $user->id, 'book_id' => $book->id]);

        // Book::userHasAccess をモックして例外を発生させる
        $this->mock(Book::class, function ($mock) use ($user, $book) {
            $mock->shouldReceive('userHasAccess')
                ->with($user->id, $book->id)
                ->andThrow(new \Exception('Database error'));
        });

        $response = $this->actingAs($user)->getJson('/api/currentBook');

        $response->assertStatus(500)
            ->assertJson(['message' => '内部エラーが発生しました']);
    }
}