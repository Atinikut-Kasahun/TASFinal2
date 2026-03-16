<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use App\Models\JobPosting;
use App\Models\Applicant;
use App\Models\JobRequisition;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Roles
        $roles = [
            'admin' => 'Global Administrator',
            'hr_manager' => 'HR Manager (Approver)',
            'ta_manager' => 'Talent Acquisition Manager',
            'hiring_manager' => 'General Manager (GM)',
            'managing_director' => 'Managing Director (MD)',
            'interviewer' => 'Interviewer',
            'employee' => 'Staff Employee (Hired)',
        ];

        foreach ($roles as $slug => $name) {
            Role::updateOrCreate(['slug' => $slug], [
                'name' => $name,
            ]);
        }

        // 2. Create Tenants (5 Sister Companies)
        $companies = [
            'Droga Pharma',
            'Droga Physiotherapy',
            'Droga Diagnostic Center',
            'Droga Health',
            'Droga Coffee'
        ];

        foreach ($companies as $name) {
            $tenant = Tenant::firstOrCreate(['slug' => \Illuminate\Support\Str::slug($name)], [
                'name' => $name,
            ]);

            // 3. Create Users for each company
            $userConfigs = [
                ['role' => 'ta_manager', 'email_prefix' => 'ta'],
                ['role' => 'hr_manager', 'email_prefix' => 'hr'],
                ['role' => 'hiring_manager', 'email_prefix' => 'gm'],
                ['role' => 'managing_director', 'email_prefix' => 'md'],
            ];

            foreach ($userConfigs as $config) {
                $email = "{$config['email_prefix']}." . \Illuminate\Support\Str::slug($name) . "@droga.com";
                $user = User::firstOrCreate(['email' => $email], [
                    'name' => strtoupper($config['email_prefix']) . " - $name",
                    'password' => bcrypt('password'),
                    'tenant_id' => $tenant->id,
                    'department' => $config['email_prefix'] === 'ta' ? 'Human Resources' : 'Operations',
                    'joined_date' => now()->subMonths(rand(1, 24))->toDateString(),
                ]);

                $user->roles()->syncWithoutDetaching([Role::where('slug', $config['role'])->first()->id]);
            }
        }

        // 4. Create a Global Admin
        $firstTenant = Tenant::first();
        $admin = User::firstOrCreate(['email' => 'admin@droga.com'], [
            'name' => 'Global Admin',
            'password' => bcrypt('password'),
            'tenant_id' => $firstTenant ? $firstTenant->id : null,
        ]);

        $admin->roles()->syncWithoutDetaching([Role::where('slug', 'admin')->first()->id]);

        // 5. Create Job Postings & Seed Candidates
        $tenants = Tenant::all();
        $stages = ['applied', 'phone_screen', 'interview', 'offer', 'hired'];
        $sources = ['ethiojobs', 'linkedin', 'referral', 'telegram', 'website'];

        foreach ($tenants as $tenant) {
            $job = JobPosting::create([
                'tenant_id' => $tenant->id,
                'title' => 'Sample Job for ' . $tenant->name,
                'department' => 'Operations',
                'location' => 'Main Office',
                'description' => 'Detailed description of the role...',
                'status' => 'active',
            ]);

            for ($i = 0; $i < 12; $i++) {
                Applicant::create([
                    'tenant_id' => $tenant->id,
                    'job_posting_id' => $job->id,
                    'name' => "Candidate " . ($i + 1),
                    'email' => "candidate" . ($i + 1) . "@" . $tenant->slug . ".com",
                    'status' => $stages[array_rand($stages)],
                    'source' => $sources[array_rand($sources)],
                    'match_score' => rand(65, 96),
                ]);
            }

            // 6. Create Job Requisitions
            $manager = User::where('tenant_id', $tenant->id)->first();
            if ($manager) {
                JobRequisition::create([
                    'tenant_id' => $tenant->id,
                    'requested_by' => $manager->id,
                    'title' => 'Headcount Request: New Specialist',
                    'department' => 'Operations',
                    'location' => 'Remote / Branch Office',
                    'headcount' => 1,
                    'status' => 'pending',
                ]);
                // 7. Create Sample Employees (People already hired)
            for ($i = 0; $i < 5; $i++) {
                $employee = User::create([
                    'name' => "Employee " . ($i + 1) . " ($tenant->name)",
                    'email' => "employee" . ($i + 1) . "." . $tenant->slug . "@droga.com",
                    'password' => bcrypt('password'),
                    'tenant_id' => $tenant->id,
                    'department' => $job->department,
                    'joined_date' => now()->subMonths(rand(3, 12))->toDateString(),
                    'employment_status' => 'active',
                ]);
                $employee->roles()->attach(Role::where('slug', 'employee')->first()->id);
            }
        }
        }
    }
}
