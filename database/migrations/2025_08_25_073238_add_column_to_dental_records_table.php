<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('dental_records', function (Blueprint $table) {
            $table->text('oral_prophylaxis_notes')->nullable()->after('oral_prophylaxis_treatment');
            $table->text('other_notes')->nullable()->after('other_treatments');
            $table->string('tooth_extraction_numbers')->nullable()->after('tooth_extraction_treatment');
            $table->string('tooth_filling_numbers')->nullable()->after('tooth_filling_treatment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dental_records', function (Blueprint $table) {
            $table->dropColumn([
                'oral_prophylaxis_notes',
                'other_notes', 
                'tooth_extraction_numbers',
                'tooth_filling_numbers'
            ]);
        });
    }
};
