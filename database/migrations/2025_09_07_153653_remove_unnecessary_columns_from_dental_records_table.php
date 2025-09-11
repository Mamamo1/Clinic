<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('dental_records', function (Blueprint $table) {
            // Drop columns you don't need
            $table->dropColumn([
                'oral_prophylaxis_treatment',
                'remarks',
                'tooth_filling_treatment',
                'tooth_extraction_treatment',
                'other_treatments',
                'dentist_signature',
                'next_appointment',
            ]);
        });
    }

    public function down()
    {
        Schema::table('dental_records', function (Blueprint $table) {
            // Restore columns if rollback is needed
            $table->string('oral_prophylaxis_treatment')->nullable();
            $table->string('remarks')->nullable();
            $table->string('tooth_filling_treatment')->nullable();
            $table->string('tooth_extraction_treatment')->nullable();
            $table->string('other_treatments')->nullable();
            $table->string('dentist_signature')->nullable();
            $table->date('next_appointment')->nullable();
        });
    }
};
