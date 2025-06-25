<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Book;
use App\Models\Page;
use App\Models\Translation;
use App\Models\Progress;

class PageControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function unauthenticated_user_cannot_access_show_pages()
    {
        $response = $this->getJson('/api/pages/1');
        $response->assertStatus(401)->assertJson(['error' => '認証されていません']);
    }

    /** @test */
    public function it_returns_403_if_user_does_not_have_access_to_book_pages()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        // Book::userHasAccessメソッドをモック
        $this->mock(Book::class, function ($mock) use ($user, $book) {
            $mock->shouldReceive('userHasAccess')
                ->with($user->id, $book->id)
                ->andReturn(false);
        });

        $response = $this->actingAs($user)->getJson("/api/pages/{$book->id}");
        $response->assertStatus(403)
            ->assertJson(['message' => 'この書籍はあなたのライブラリに存在しません']);
    }

    /** @test */
    public function it_returns_404_if_book_id_is_missing_in_show()
    {
        $user = User::factory()->create();

        // empty book id in URL will be treated as empty string or invalid route
        $response = $this->actingAs($user)->getJson('/api/pages/');
        $response->assertStatus(404); // route not found or method not found
    }

    /** @test */
    public function it_returns_404_if_book_does_not_exist()
    {
        $user = User::factory()->create();
        $nonExistentBookId = 999999;

        $response = $this->actingAs($user)->getJson("/api/pages/{$nonExistentBookId}");
        $response->assertStatus(404)
            ->assertJson(['error' => '書籍が存在しません']);
    }

    /** @test */
    public function it_returns_pages_with_translations_for_authorized_user()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        // Book::userHasAccessメソッドをモック
        $this->mock(Book::class, function ($mock) use ($user, $book) {
            $mock->shouldReceive('userHasAccess')
                ->with($user->id, $book->id)
                ->andReturn(true);
        });

        $page = Page::factory()->create([
            'book_id' => $book->id,
            'page_number' => 1,
            'content' => 'Page content here'
        ]);

        $translation = Translation::factory()->create([
            'page_id' => $page->id,
            'user_id' => $user->id,
            'translated_text' => 'Translated text',
            'score' => 95,
            'AI_feedback' => 'Good job',
            'AI_text' => 'AI suggested text'
        ]);

        $response = $this->actingAs($user)->getJson("/api/pages/{$book->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'pages' => [
                    [
                        'page_number',
                        'content',
                        'translations' => [
                            [
                                'translatedText',
                                'score',
                                'AIfeedback',
                                'AItext'
                            ]
                        ]
                    ]
                ]
            ])
            ->assertJsonFragment([
                'page_number' => 1,
                'content' => 'Page content here',
                'translatedText' => 'Translated text',
                'score' => 95,
                'AIfeedback' => 'Good job',
                'AItext' => 'AI suggested text'
            ]);
    }

    /** @test */
    public function it_can_store_translation()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $page = Page::factory()->create([
            'book_id' => $book->id,
            'page_number' => 10,
        ]);

        $payload = [
            'book_id' => $book->id,
            'page_number' => 10,
            'translated_text' => 'New translation text',
            'score' => 80,
            'AIfeedback' => 'Nice try',
            'AItext' => 'AI recommended text',
        ];

        $response = $this->actingAs($user)->postJson('/api/translation', $payload);

        $response->assertStatus(200)
            ->assertJson(['message' => '保存しました']);

        $this->assertDatabaseHas('translations', [
            'page_id' => $page->id,
            'user_id' => $user->id,
            'translated_text' => 'New translation text',
            'score' => 80,
            'AI_feedback' => 'Nice try',
            'AI_text' => 'AI recommended text',
        ]);
    }

    /** @test */
    public function store_translation_requires_validation()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/translation', []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['book_id', 'page_number', 'translated_text']);
    }

    /** @test */
    public function it_returns_401_when_storing_translation_without_authentication()
    {
        $payload = [
            'book_id' => 1,
            'page_number' => 10,
            'translated_text' => 'New translation text',
        ];

        $response = $this->postJson('/api/translation', $payload);
        $response->assertStatus(401)->assertJson(['error' => '認証されていません']);
    }

    /** @test */
    public function it_returns_404_when_storing_translation_for_nonexistent_page()
    {
        $user = User::factory()->create();

        $payload = [
            'book_id' => 999999,
            'page_number' => 999999,
            'translated_text' => 'New translation text',
        ];

        $response = $this->actingAs($user)->postJson('/api/translation', $payload);
        $response->assertStatus(404)->assertJson(['error' => 'ページが見つかりません']);
    }

    /** @test */
    public function it_returns_401_when_getting_current_page_without_authentication()
    {
        $response = $this->getJson('/api/currentPage?book_id=1');
        $response->assertStatus(401)->assertJson(['error' => 'User not authenticated']);
    }

    /** @test */
    public function it_returns_current_page_for_authenticated_user()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        Progress::factory()->create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'current_page' => 42,
        ]);

        $response = $this->actingAs($user)->getJson("/api/currentPage?book_id={$book->id}");

        $response->assertStatus(200)
            ->assertJson([
                'current_page' => 42,
                'message' => '現在のページを取得しました',
            ]);
    }

    /** @test */
    public function it_returns_null_current_page_when_no_progress_found()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $response = $this->actingAs($user)->getJson("/api/currentPage?book_id={$book->id}");

        $response->assertStatus(200)
            ->assertJson([
                'current_page' => null,
                'message' => '現在のページを取得しました',
            ]);
    }

    /** @test */
    public function it_returns_400_when_getting_current_page_without_book_id()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/currentPage');
        $response->assertStatus(400)->assertJson(['error' => 'book_id is required']);
    }
}