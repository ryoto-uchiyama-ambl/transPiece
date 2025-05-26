<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Page;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Page>
 */
class PageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = Page::class;

    public function definition(): array
    {
        return [
            'book_id' => null,
            'page_number' => 1,
            'content' => fake()->paragraphs(3, true),
        ];
    }
}
