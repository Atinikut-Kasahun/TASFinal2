<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Application Update</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; color: #1a202c; }
        .wrapper { max-width: 620px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { padding: 40px 40px 32px; text-align: center; }
        .header.written_exam     { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
        .header.technical_interview { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); }
        .header.final_interview  { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); }
        .header.offer            { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
        .header.hired            { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); }
        .header.rejected         { background: linear-gradient(135deg, #64748b 0%, #475569 100%); }
        .header .icon { font-size: 48px; margin-bottom: 16px; display: block; }
        .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; line-height: 1.3; }
        .header p  { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 8px; }
        .body      { padding: 36px 40px; }
        .greeting  { font-size: 17px; font-weight: 600; color: #1a202c; margin-bottom: 16px; }
        .message   { font-size: 15px; line-height: 1.7; color: #4a5568; margin-bottom: 24px; }
        .stage-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px; }
        .stage-card .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 6px; }
        .stage-card .value { font-size: 15px; font-weight: 600; color: #1a202c; }
        .stage-card .value.status-badge {
            display: inline-block;
            padding: 4px 14px;
            border-radius: 99px;
            font-size: 13px;
            font-weight: 700;
        }
        .badge-written_exam        { background: #ede9fe; color: #4f46e5; }
        .badge-technical_interview { background: #e0f2fe; color: #0891b2; }
        .badge-final_interview     { background: #fef3c7; color: #d97706; }
        .badge-offer               { background: #d1fae5; color: #059669; }
        .badge-hired               { background: #bbf7d0; color: #16a34a; }
        .badge-rejected            { background: #f1f5f9; color: #64748b; }
        .cta-btn { display: block; width: fit-content; margin: 0 auto 28px; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 700; text-align: center; }
        .cta-written_exam        { background: #4f46e5; color: #ffffff; }
        .cta-technical_interview { background: #0891b2; color: #ffffff; }
        .cta-final_interview     { background: #d97706; color: #ffffff; }
        .cta-offer               { background: #059669; color: #ffffff; }
        .cta-hired               { background: #16a34a; color: #ffffff; }
        .cta-rejected            { background: #64748b; color: #ffffff; }
        .divider { border: none; border-top: 1px solid #e2e8f0; margin: 28px 0; }
        .footer { padding: 24px 40px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { font-size: 12px; color: #94a3b8; line-height: 1.6; }
        .footer strong { color: #64748b; }
    </style>
</head>
<body>
<div class="wrapper">

    {{-- ── HEADER (colour changes per status) ── --}}
    <div class="header {{ $newStatus }}">
        @if($newStatus === 'written_exam')
            <span class="icon">📝</span>
            <h1>Written Exam Invitation</h1>
            <p>You've been selected for the next stage</p>
        @elseif($newStatus === 'technical_interview')
            <span class="icon">🛠️</span>
            <h1>Technical Interview</h1>
            <p>Great news — you've advanced to the technical round</p>
        @elseif($newStatus === 'final_interview')
            <span class="icon">🎯</span>
            <h1>Final Interview</h1>
            <p>You're one step away from an offer</p>
        @elseif($newStatus === 'offer')
            <span class="icon">🎉</span>
            <h1>Job Offer Extended!</h1>
            <p>Congratulations — you've received an offer</p>
        @elseif($newStatus === 'hired')
            <span class="icon">✅</span>
            <h1>Welcome to the Team!</h1>
            <p>Your hiring is confirmed — we're thrilled to have you</p>
        @elseif($newStatus === 'rejected')
            <span class="icon">📬</span>
            <h1>Application Update</h1>
            <p>Thank you for your time and interest</p>
        @else
            <span class="icon">📋</span>
            <h1>Application Status Update</h1>
            <p>There's an update on your application</p>
        @endif
    </div>

    {{-- ── BODY ── --}}
    <div class="body">
        <p class="greeting">Dear {{ $applicant->name }},</p>

        {{-- Per-stage message --}}
        @if($newStatus === 'written_exam')
            <p class="message">
                We are pleased to inform you that your application for <strong>{{ $jobTitle }}</strong>
                at <strong>{{ $companyName }}</strong> has progressed to the <strong>Written Exam</strong> stage.
                Our team was impressed with your profile and would like to evaluate your skills further through a written assessment.
                <br><br>
                Our recruiting team will reach out shortly with the exam details, format, and schedule.
                Please ensure your contact information is up to date on your applicant portal.
            </p>
        @elseif($newStatus === 'technical_interview')
            <p class="message">
                Congratulations! You have successfully advanced to the <strong>Technical Interview</strong> round
                for the <strong>{{ $jobTitle }}</strong> position at <strong>{{ $companyName }}</strong>.
                <br><br>
                This is a great achievement — our team will contact you shortly to arrange the interview schedule,
                format, and any preparation materials you may need.
            </p>
        @elseif($newStatus === 'final_interview')
            <p class="message">
                Excellent news! You have been selected for the <strong>Final Interview</strong> for
                <strong>{{ $jobTitle }}</strong> at <strong>{{ $companyName }}</strong>.
                <br><br>
                You are among our top candidates. Our team will reach out to confirm the date, time, and format
                of this last interview. We look forward to speaking with you again.
            </p>
        @elseif($newStatus === 'offer')
            <p class="message">
                We are thrilled to extend a formal <strong>Job Offer</strong> to you for the
                <strong>{{ $jobTitle }}</strong> role at <strong>{{ $companyName }}</strong>! 🎉
                <br><br>
                Your offer letter with full details — including compensation, start date, and next steps —
                will be sent to you separately. Please review it carefully and don't hesitate to reach out
                with any questions.
            </p>
        @elseif($newStatus === 'hired')
            <p class="message">
                Welcome to <strong>{{ $companyName }}</strong>! 🎊 We are absolutely delighted to confirm
                that you have been officially <strong>hired</strong> for the <strong>{{ $jobTitle }}</strong> position.
                <br><br>
                Our onboarding team will be in touch very soon with your start date, orientation details,
                and everything you need for your first day. Get ready for an exciting journey ahead!
            </p>
        @elseif($newStatus === 'rejected')
            <p class="message">
                Thank you sincerely for taking the time to apply for the <strong>{{ $jobTitle }}</strong>
                position at <strong>{{ $companyName }}</strong> and for your patience throughout our selection process.
                <br><br>
                After careful consideration, we have decided to move forward with other candidates whose
                qualifications more closely match our current needs. This was a very competitive process,
                and we genuinely appreciate your interest in joining our team.
                <br><br>
                We encourage you to apply for future openings that match your skills and experience.
                We wish you every success in your career journey.
            </p>
        @else
            <p class="message">
                There has been an update on your application for <strong>{{ $jobTitle }}</strong>
                at <strong>{{ $companyName }}</strong>. Please log in to your applicant portal to view the details.
            </p>
        @endif

        {{-- Application details card --}}
        <div class="stage-card">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div>
                    <div class="label">Position</div>
                    <div class="value">{{ $jobTitle }}</div>
                </div>
                <div>
                    <div class="label">Company</div>
                    <div class="value">{{ $companyName }}</div>
                </div>
                <div>
                    <div class="label">Current Stage</div>
                    <div class="value">
                        <span class="status-badge badge-{{ $newStatus }}">
                            @switch($newStatus)
                                @case('written_exam')        Written Exam @break
                                @case('technical_interview') Technical Interview @break
                                @case('final_interview')     Final Interview @break
                                @case('offer')               Offer Extended @break
                                @case('hired')               Hired ✓ @break
                                @case('rejected')            Not Selected @break
                                @default                     {{ ucfirst(str_replace('_',' ',$newStatus)) }}
                            @endswitch
                        </span>
                    </div>
                </div>
                <div>
                    <div class="label">Applicant</div>
                    <div class="value">{{ $applicant->name }}</div>
                </div>
            </div>
        </div>

        {{-- CTA button (not shown for rejected) --}}
        @if($newStatus !== 'rejected')
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/applicant/portal"
               class="cta-btn cta-{{ $newStatus }}">
                View Your Application Portal →
            </a>
        @endif

        <hr class="divider"/>
        <p style="font-size:13px; color:#94a3b8; text-align:center;">
            If you have any questions, reply to this email or contact our recruitment team directly.
        </p>
    </div>

    <div class="footer">
        <p>
            <strong>{{ $companyName }}</strong> · Talent Acquisition Team<br>
            This is an automated notification. Please do not reply directly to this email.<br>
            © {{ date('Y') }} {{ $companyName }}. All rights reserved.
        </p>
    </div>

</div>
</body>
</html>
