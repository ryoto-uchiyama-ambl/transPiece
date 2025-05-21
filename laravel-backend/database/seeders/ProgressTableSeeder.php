<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProgressTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {


        \DB::table('progress')->delete();

        \DB::table('progress')->insert(array(
            0 =>
                array(
                    'id' => 1,
                    'user_id' => 2,
                    'book_id' => 1,
                    'current_page' => 0,
                    'created_at' => '2025-05-20 05:28:59',
                    'updated_at' => '2025-05-20 05:28:59',
                    'is_favorite' => 0,
                ),
        ));


    }
}