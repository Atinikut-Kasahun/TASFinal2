<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Notifications\Notifiable;

class Applicant extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'tenant_id',
        'job_posting_id',
        'name',
        'email',
        'phone',
        'headline',
        'age',
        'gender',
        'professional_background',
        'years_of_experience',
        'resume_path',
        'photo_path',
        'portfolio_link',
        'status', // new, written_exam, technical_interview, final_interview, offer, hired, rejected
        'source', // website, social media, ethiojobs
        'match_score',
        'written_exam_score',
        'technical_interview_score',
        'interviewer_feedback',
        'exam_paper_path',
        'offer_letter_path',
        'offered_salary',
        'start_date',
        'feedback',
        'hired_at',
        'password',          // applicant portal account password
        'applicant_token',   // session token for portal auth
        'password_reset_token',
        'password_reset_expires_at',
        'employment_status',    // 'active' | 'resigned' | 'terminated'
        'separation_date',
        'separation_reason',
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
        'written_raw_score',
        'written_out_of',
        'technical_raw_score',
        'technical_out_of',
    ];

    protected $hidden = [
        'password',
        'applicant_token',
        'password_reset_token',
    ];

    public function attachments()
    {
        return $this->hasMany(ApplicantAttachment::class);
    }

    protected $casts = [
        'feedback' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function interviews()
    {
        return $this->hasMany(Interview::class);
    }

    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class);
    }
}
