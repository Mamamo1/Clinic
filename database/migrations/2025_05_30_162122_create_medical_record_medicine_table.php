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
        Schema::create('medical_record_medicine', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('medical_record_id');
    $table->unsignedBigInteger('inventory_id');
    $table->integer('quantity_issued');
    $table->timestamps();

    $table->foreign('medical_record_id')->references('id')->on('medical_records')->onDelete('cascade');
    $table->foreign('inventory_id')->references('id')->on('inventories')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_record_medicine');
    }
};
