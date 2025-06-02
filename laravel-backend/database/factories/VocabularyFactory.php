<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vocabulary>
 */
class VocabularyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fakerEn = \Faker\Factory::create('en_US');
        $fakerJa = \Faker\Factory::create('ja_JP');

        $partsOfSpeech = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection'];

        return [
            'user_id' => 2,
            'book_id' => 1,
            'page_id' => 1,
            'word' => $fakerEn->word(),
            'translation' => $fakerJa->ward(),
            'definition' => $fakerJa->sentence(),
            'example' => $fakerJa->sentence(),
            'part_of_speech' => fake()->randomElement($partsOfSpeech),
            'language' => 'en',
            'is_understanding' => fake()->boolean(20),
        ];
    }
}
