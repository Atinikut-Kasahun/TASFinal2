<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Mail\StatusChanged;
use Illuminate\Mail\Mailable;

class ApplicantStatusUpdated extends Notification
{
    use Queueable;

    protected $applicant;
    protected $oldStatus;
    protected $newStatus;

    /**
     * Create a new notification instance.
     */
    public function __construct($applicant, $oldStatus, $newStatus)
    {
        $this->applicant = $applicant;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database']; // Emails are handled directly in ApplicantController with try-catch
    }

    /**
     * Get the mail representation of the notification.
     */
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): Mailable
    {
        return (new StatusChanged(
            $this->applicant,
            $this->oldStatus,
            $this->newStatus
        ))->to($notifiable->email);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $jobTitle = $this->applicant->jobPosting->title ?? 'Position';
        $message = "Your status for {$jobTitle} has been updated to " . ($this->newStatus);

        if ($this->newStatus === 'written_exam')
            $message = "Shortlisted for Written Exam for {$jobTitle}!";
        if ($this->newStatus === 'technical_interview')
            $message = "Invited to Technical Interview for {$jobTitle}!";
        if ($this->newStatus === 'final_interview')
            $message = "Advanced to Final Interview for {$jobTitle}!";
        if ($this->newStatus === 'offer')
            $message = "You received an Offer for {$jobTitle}!";
        if ($this->newStatus === 'hired')
            $message = "Congratulations! You are officially HIRED for {$jobTitle}!";
        if ($this->newStatus === 'rejected')
            $message = "Decision update regarding your application for {$jobTitle}.";

        return [
            'title' => 'Application Update',
            'message' => $message,
            'status' => $this->newStatus,
            'job_title' => $jobTitle,
            'written_exam_score' => $this->applicant->written_exam_score,
            'technical_interview_score' => $this->applicant->technical_interview_score,
            'interviewer_feedback' => $this->applicant->interviewer_feedback,
            'applicant_id' => $this->applicant->id,
            'type' => 'status_update'
        ];
    }
}
