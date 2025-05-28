<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Modify ENUM field by using raw SQL since Laravel doesn't support changing ENUM directly
        DB::statement("ALTER TABLE users MODIFY COLUMN account_type ENUM('SuperAdmin', 'Doctor', 'Nurse', 'Dentist', 'SHS', 'College', 'Employee') NOT NULL DEFAULT 'Employee'");
    }

    public function down(): void
    {
        // Optional: reverse back to old ENUM values
        DB::statement("ALTER TABLE users MODIFY COLUMN account_type ENUM('Super Admin', 'Admin / Nurse', 'Employee / Students') NOT NULL DEFAULT 'Employee / Students'");
    }
};
