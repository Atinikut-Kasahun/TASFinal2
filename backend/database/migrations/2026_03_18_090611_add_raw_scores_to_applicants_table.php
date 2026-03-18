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
        Schema::table('applicants', function (Blueprint $table) {
            $table->decimal('written_raw_score', 8, 2)->nullable();
            $table->decimal('written_out_of', 8, 2)->nullable();
            $table->decimal('technical_raw_score', 8, 2)->nullable();
            $table->decimal('technical_out_of', 8, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->dropColumn([
                'written_raw_score',
                'written_out_of',
                'technical_raw_score',
                'technical_out_of'
            ]);
        });
    }
};
