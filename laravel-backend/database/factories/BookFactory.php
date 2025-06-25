<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fakerEn = \Faker\Factory::create('en_US');

        return [
            'title' => fake()->sentence(),
            'gutenberg_url' => $this->faker->optional()->url(),
            //英語の著者追加
            'author' => $fakerEn->name(),
            'downloads' => fake()->numberBetween(0, 100000),
            'lang' => fake()->randomElement(['en', 'ja', 'fr', 'de', 'es']),
            'page_count' => fake()->numberBetween(10, 100),
            'created_at' => fake()->dateTimeBetween('-2 year', 'now'),
            'updated_at' => now(),
        ];
    }
}
