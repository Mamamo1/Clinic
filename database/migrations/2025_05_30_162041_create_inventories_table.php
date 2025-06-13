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
        Schema::create('inventories', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('generic')->nullable();
    $table->string('brand_name')->nullable();
    $table->string('dosage')->nullable();
    $table->string('category'); // e.g., Medicine or Supplies
    $table->integer('quantity');
    $table->integer('threshold')->default(0);
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
