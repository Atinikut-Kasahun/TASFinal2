<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #F5F6FA; color: #111; padding: 40px 16px; }
        .container { max-width: 600px; margin: 0 auto; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); background: #fff; }
        .header { background-color: #FDF22F; padding: 48px 40px; text-align: center; }
        .header h1 { color: #000; font-size: 26px; font-weight: 900; margin-bottom: 8px; }
        .content { padding: 48px 40px; }
        .greeting { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
        .btn-wrapper { text-align: center; margin: 36px 0; }
        .btn { display: inline-block; background-color: #FDF22F; color: #000 !important; text-decoration: none; font-size: 13px; font-weight: 900; text-transform: uppercase; padding: 18px 40px; border-radius: 50px; border: 2px solid #000; }
        .footer { background-color: #000; padding: 32px 40px; text-align: center; color: #fff; font-size: 11px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Staff Password Reset</h1>
            <p>Droga Group Hiring Hub</p>
        </div>
        <div class="content">
            <p class="greeting">Hello, {{ $name }},</p>
            <p>We received a request to reset your staff account password. Click the button below to proceed. This link is valid for 60 minutes.</p>
            <div class="btn-wrapper">
                <a href="{{ $resetUrl }}" class="btn">Reset Password →</a>
            </div>
            <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Droga Group Hiring Hub. All rights reserved.
        </div>
    </div>
</body>
</html>
