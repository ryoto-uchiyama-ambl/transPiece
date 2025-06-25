<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Progress>
 */
class ProgressFactory extends Factory
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
            'book_id' => 1,
            'current_page' => fake()->numberBetween(1, 100),
            'is_favorite' => fake()->boolean(),
            'created_at' => fake()->dateTimeBetween('-2 year', 'now'),
            'updated_at' => now(),
        ];
    }
}
