<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMedicalHistoriesTable extends Migration
{
    public function up()
    {
        Schema::create('medical_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->boolean('is_pwd')->default(false);
            $table->text('pwd_disability')->nullable();
            $table->boolean('anemia')->default(false);
            $table->boolean('bleeding_disorders')->default(false);
            $table->boolean('vertigo_dizziness')->default(false);
            $table->boolean('migraine')->default(false);
            $table->boolean('epilepsy')->default(false);
            $table->boolean('panic_anxiety')->default(false);
            $table->boolean('hyperacidity_gerd')->default(false);
            $table->boolean('heart_disease')->default(false);
            $table->boolean('kidney_disease')->default(false);
            $table->boolean('asthma')->default(false);
            $table->boolean('sexually_transmitted_illness')->default(false);
            $table->boolean('congenital_heart_disease')->default(false);
            $table->boolean('immunocompromised')->default(false);
            $table->text('immunocompromised_specify')->nullable();
            $table->boolean('musculoskeletal_injury')->default(false);
            $table->text('musculoskeletal_injury_specify')->nullable();
            $table->boolean('mumps')->default(false);
            $table->boolean('chickenpox')->default(false);
            $table->boolean('hepatitis')->default(false);
            $table->boolean('scoliosis')->default(false);
            $table->boolean('diabetes_mellitus')->default(false);
            $table->boolean('head_injury')->default(false);
            $table->boolean('visual_defect')->default(false);
            $table->text('visual_defect_specify')->nullable();
            $table->boolean('hearing_defect')->default(false);
            $table->text('hearing_defect_specify')->nullable();
            $table->boolean('tuberculosis')->default(false);
            $table->boolean('hypertension')->default(false);
            $table->boolean('g6pd')->default(false);
            $table->boolean('rheumatic_heart_disease')->default(false);
            $table->text('allergies_specify')->nullable();
            $table->timestamps();

            // Security: add foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('medical_histories');
    }
}
