<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('dental_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('previous_dentist')->nullable();
            $table->date('last_dental_visit')->nullable();
            $table->text('last_tooth_extraction')->nullable(); // Changed from string to text for longer content
            $table->boolean('allergy_anesthesia')->default(false);
            $table->boolean('allergy_pain_reliever')->default(false);
            $table->text('last_dental_procedure')->nullable();
            $table->text('additional_notes')->nullable();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('user_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('dental_histories');
    }
};
