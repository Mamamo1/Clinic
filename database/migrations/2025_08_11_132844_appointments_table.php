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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('student_id');
            $table->string('full_name');
            $table->enum('service_type', ['doctor', 'dentist']);
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->text('reason');
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->string('doctor_name')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes for better performance
            $table->index(['appointment_date', 'appointment_time'], 'idx_appointment_datetime');
            $table->index(['user_id', 'status'], 'idx_user_status');
            $table->index('status', 'idx_status');
            $table->index('service_type', 'idx_service_type');
            
            // Unique constraint to prevent double booking with custom short name
            $table->unique(['appointment_date', 'appointment_time', 'service_type'], 'unique_appointment_slot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
