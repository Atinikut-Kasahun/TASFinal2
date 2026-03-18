<?php

namespace App\Mail;

use App\Models\Applicant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ScoreUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public $applicant;
    public $examType; // 'Written Exam' or 'Technical Interview'
    public $score;
    public $messageText;

    /**
     * Create a new message instance.
     */
    public function __construct(Applicant $applicant, string $examType, float $score, ?string $messageText = null)
    {
        $this->applicant = $applicant;
        $this->examType = $examType;
        $this->score = $score;
        $this->messageText = $messageText;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your ' . $this->examType . ' Result - Droga Pharma',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.score_updated',
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
