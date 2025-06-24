<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class VocabularyScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vocabulary_id' => fake()->numberBetween(1,1000),
            'user_id' => fake()->numberBetween(1,1000),
            'stability' => fake()->randomFloat(2,0,10),
            'difficulty' => fake()->randomFloat(2,0,10),
            'reps' => fake()->randomFloat(2,1,20),
            'elapsed_days' => fake()->randomFloat(2,0,30),
            'learning_steps' => fake()->numberBetween(1, 10),
            'state' => fake()->numberBetween(0,5),
            'last_review' => fake()->optional()->dateTimeBetween('-1 month', 'now'),
            'due' => fake()->optional()->dateTimeBetween('now', '+1 month'),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
