<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {


        \DB::table('users')->delete();

        \DB::table('users')->insert(array(
            0 =>
                array(
                    'id' => 1,
                    'name' => 'aa',
                    'email' => 'a@a',
                    'email_verified_at' => NULL,
                    'password' => '$2y$12$8rA9AU8jctFcX/wdumU.eufEQin2P.Cpo0MHLPLJZCWN0vEeiGR1K',
                    'remember_token' => NULL,
                    'created_at' => '2025-05-20 05:18:30',
                    'updated_at' => '2025-05-20 05:18:30',
                ),
            1 =>
                array(
                    'id' => 2,
                    'name' => 'test',
                    'email' => 'tes@tes',
                    'email_verified_at' => NULL,
                    'password' => '$2y$12$WkuqWKmrmf1uESdrJgjGX.pGr9NF8ga1l6ChuKKtPISF2PKcKh/0O',
                    'remember_token' => NULL,
                    'created_at' => '2025-05-20 05:19:03',
                    'updated_at' => '2025-05-20 05:19:03',
                ),
        ));


    }
}