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
            // Legal & Compliance
            $table->string('contract_path')->nullable();
            $table->boolean('contract_signed')->default(false);
            $table->boolean('id_verified')->default(false);
            $table->string('bank_account')->nullable();
            $table->string('tax_id')->nullable();
            $table->boolean('payroll_setup')->default(false);

            // Technical Readiness
            $table->boolean('workstation_ready')->default(false);
            $table->string('company_email')->nullable();
            $table->boolean('email_created')->default(false);

            // Integration
            $table->boolean('office_tour_done')->default(false);
            $table->dateTime('orientation_date')->nullable();
            $table->boolean('orientation_done')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->dropColumn([
                'contract_path',
                'contract_signed',
                'id_verified',
                'bank_account',
                'tax_id',
                'payroll_setup',
                'workstation_ready',
                'company_email',
                'email_created',
                'office_tour_done',
                'orientation_date',
                'orientation_done',
            ]);
        });
    }
};
