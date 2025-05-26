<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Translation>
 */
class TranslationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => 2,
            'page_id' => 1,
            'translated_text' => fake()->text(100),
            'score' => fake()->randomFloat(0, 0, 100),
            'AI_feedback' => fake()->sentence(3),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
