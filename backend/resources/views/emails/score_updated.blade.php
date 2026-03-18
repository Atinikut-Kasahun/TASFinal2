<!DOCTYPE html>
<html>
<head>
    <title>Assessment Result</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Hello {{ $applicant->name }},</h2>

    <p>We have updated the results for your recent assessment at Droga Pharma.</p>

    <p><strong>Assessment Type:</strong> {{ $examType }}<br>
    <strong>Score:</strong> 
    @if($examType === 'Written Exam' && $applicant->written_raw_score && $applicant->written_out_of)
        {{ rtrim(rtrim(number_format($applicant->written_raw_score, 2), '0'), '.') }}/{{ rtrim(rtrim(number_format($applicant->written_out_of, 2), '0'), '.') }}%
    @elseif($examType === 'Technical Interview' && $applicant->technical_raw_score && $applicant->technical_out_of)
        {{ rtrim(rtrim(number_format($applicant->technical_raw_score, 2), '0'), '.') }}/{{ rtrim(rtrim(number_format($applicant->technical_out_of, 2), '0'), '.') }}%
    @else
        {{ $score }}%
    @endif
    </p>

    @if($messageText)
        <div style="background-color: #f9f9f9; border-left: 4px solid #FDF22F; padding: 10px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Feedback/Notes:</strong><br/>{{ $messageText }}</p>
        </div>
    @endif

    <p>Thank you for your continued interest in joining our team. We will be in touch soon regarding the next steps.</p>

    <p>Best regards,<br>
    The Droga Pharma HR Team</p>
</body>
</html>
