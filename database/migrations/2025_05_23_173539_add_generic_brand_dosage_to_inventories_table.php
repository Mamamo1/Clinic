<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('inventories', function (Blueprint $table) {

        $table->string('generic')->nullable();
        $table->string('brand_name')->nullable();
        $table->string('dosage')->nullable();
    });
}

public function down()
{
    Schema::table('inventories', function (Blueprint $table) {
        $table->dropColumn(['generic', 'brand_name', 'dosage']);
    });
}

};
