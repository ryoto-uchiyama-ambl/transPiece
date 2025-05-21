<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class BooksTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {


        \DB::table('books')->delete();

        \DB::table('books')->insert(array(
            0 =>
                array(
                    'id' => 1,
                    'title' => 'Great Singers, First Series: Faustina Bordoni To Henrietta Sontag',
                    'gutenberg_url' => 'https://www.gutenberg.org/ebooks/17464.txt.utf-8',
                    'created_at' => '2025-05-20 05:28:58',
                    'updated_at' => '2025-05-20 05:28:58',
                    'author' => 'Ferris, George T. (George Titus)',
                    'downloads' => 137,
                    'lang' => 'en',
                    'page_count' => 36,
                ),
        ));


    }
}