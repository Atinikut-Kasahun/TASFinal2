<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1A2B3D; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; border: 1px solid #F0F0F0; border-radius: 24px; overflow: hidden; }
        .header { background-color: #1A2B3D; color: #ffffff; padding: 40px; text-align: center; }
        .content { padding: 40px; background-color: #ffffff; }
        .footer { background-color: #F9FAFB; padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.1em; }
        h1 { margin: 0; font-size: 24px; font-weight: 900; }
        p { margin-bottom: 20px; font-size: 16px; }
        .highlight { color: #1F7A6E; font-weight: 700; }
        .signature { margin-top: 40px; padding-top: 20px; border-top: 1px solid #F0F0F0; }
        .company-name { font-weight: 900; color: #1A2B3D; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Application Received</h1></div>
        <div class="content">
            <p>Hello <strong>{{ $applicant->name }}</strong>,</p>
            <p>Thank you for applying for the <span class="highlight">{{ $job->title }}</span> position at <span class="company-name">{{ $tenant->name }}</span>.</p>
            <p>We've successfully received your application. Our hiring team is currently reviewing your profile and qualifications.</p>
            <p>We will reach out to you via email or phone if your profile is shortlisted for the next steps.</p>
            <div class="signature">
                <p>Best regards,<br><span class="company-name">{{ $tenant->name }} – Hiring Team</span></p>
            </div>
        </div>
        <div class="footer">&copy; {{ date('Y') }} {{ $tenant->name }} &bull; Powered by Droga TAS</div>
    </div>
</body>
</html>
```

**Step 2** — Open this file and make sure it has the PHP class:
```
C:\Users\eta\Documents\Projects\TAS9\backend\app\Mail\ApplicationReceived.php