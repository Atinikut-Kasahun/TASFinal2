<?php

namespace App\Mail;

use App\Models\Applicant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public Applicant $applicant;
    public string $oldStatus;
    public string $newStatus;
    public string $jobTitle;
    public string $companyName;

    public function __construct(Applicant $applicant, string $oldStatus, string $newStatus)
    {
        $this->applicant   = $applicant;
        $this->oldStatus   = $oldStatus;
        $this->newStatus   = $newStatus;
        $this->jobTitle    = $applicant->jobPosting->title ?? 'the position';
        $this->companyName = $applicant->tenant->name    ?? 'Our Company';
    }

    public function envelope(): Envelope
    {
        $subjects = [
            'written_exam'        => "📝 Next Step: Written Exam — {$this->jobTitle}",
            'technical_interview' => "🛠️ Technical Interview Invitation — {$this->jobTitle}",
            'final_interview'     => "🎯 Final Interview Invitation — {$this->jobTitle}",
            'offer'               => "🎉 Congratulations! Job Offer — {$this->jobTitle}",
            'hired'               => "✅ Welcome Aboard! — {$this->companyName}",
            'rejected'            => "Update on Your Application — {$this->jobTitle}",
        ];

        $subject = $subjects[$this->newStatus]
            ?? "Application Update: {$this->jobTitle} at {$this->companyName}";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.status-changed');
    }

    public function attachments(): array
    {
        return [];
    }
}
