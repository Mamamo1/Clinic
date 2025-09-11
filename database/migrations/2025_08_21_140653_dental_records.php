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
        Schema::create('dental_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('examination_date');
            $table->json('purpose'); // Array of purposes: check-up, consultation, prophylaxis, fluoride
            $table->enum('oral_hygiene', ['excellent', 'good', 'poor']);
            $table->integer('decayed_teeth_count')->default(0);
            $table->integer('extraction_teeth_count')->default(0);
            $table->json('teeth_conditions')->nullable(); // Array of tooth conditions with numbers
            $table->text('oral_prophylaxis_treatment')->nullable();
            $table->text('tooth_filling_treatment')->nullable();
            $table->text('tooth_extraction_treatment')->nullable();
            $table->text('other_treatments')->nullable();
            $table->string('school_dentist');
            $table->text('dentist_signature')->nullable();
            $table->text('remarks')->nullable();
            $table->date('next_appointment')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes for better performance
            $table->index(['user_id', 'examination_date']);
            $table->index('examination_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dental_records');
    }
};
