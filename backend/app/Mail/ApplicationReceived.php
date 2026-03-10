<?php

namespace App\Mail;

use App\Models\Applicant;
use App\Models\JobPosting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationReceived extends Mailable
{
    use Queueable, SerializesModels;

    public $applicant;
    public $job;
    public $tenant;

    public function __construct(Applicant $applicant, JobPosting $job)
    {
        $this->applicant = $applicant;
        $this->job       = $job;
        $this->tenant    = $job->tenant;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Application Received: {$this->job->title} at {$this->tenant->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.application-received',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}