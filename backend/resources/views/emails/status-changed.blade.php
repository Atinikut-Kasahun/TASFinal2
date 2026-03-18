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
        .header { padding: 40px 40px 32px; text-align: center; background: #FDF22F; }
        .header .icon { font-size: 48px; margin-bottom: 16px; display: block; }
        .header h1 { color: #000000; font-size: 24px; font-weight: 900; line-height: 1.3; }
        .header p  { color: rgba(0,0,0,0.6); font-size: 14px; margin-top: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
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
        .badge-written_exam        { background: #111; color: #FDF22F; }
        .badge-technical_interview { background: #111; color: #FDF22F; }
        .badge-final_interview     { background: #111; color: #FDF22F; }
        .badge-offer               { background: #111; color: #FDF22F; }
        .badge-hired               { background: #111; color: #FDF22F; }
        .badge-rejected            { background: #f1f5f9; color: #64748b; }
        .cta-btn { display: block; width: fit-content; margin: 0 auto 28px; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-size: 15px; font-weight: 900; text-align: center; background: #FDF22F; color: #000000; text-transform: uppercase; letter-spacing: 1px; }
        .divider { border: none; border-top: 1px solid #e2e8f0; margin: 28px 0; }
        .footer { padding: 24px 40px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { font-size: 12px; color: #94a3b8; line-height: 1.6; }
        .footer strong { color: #64748b; }
    </style>
</head>
<body>
<div class="wrapper">

    {{-- ── LOGO HEADER (Workable style) ── --}}
    <div style="background-color: #ffffff; padding: 32px 40px 16px; text-align: center;">
        <div style="font-family: Arial, sans-serif; display: inline-block;">
            <span style="display: inline-block; background-color: #FDF22F; color: #000000; padding: 4px 10px; border-radius: 6px; font-weight: 900; font-size: 20px; letter-spacing: -1px; margin-right: 6px; border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; vertical-align: middle;">D</span>
            <span style="color: #000000; font-weight: 900; font-size: 22px; letter-spacing: -1px; vertical-align: middle;">DROGA GROUP</span>
            <span style="color: #666666; font-weight: 300; font-size: 22px; letter-spacing: -0.5px; vertical-align: middle; margin-left: 6px;">HIRING HUB</span>
        </div>
    </div>

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



        {{-- OFFER DETAILS SECTION --}}
        @if($newStatus === 'offer' && $applicant->offered_salary)
            <div style="background: #FDF22F; border-radius: 16px; padding: 32px 24px; margin-bottom: 24px; text-align: center; border: 2px solid #000; box-shadow: 0 10px 15px -3px rgba(253, 242, 47, 0.2);">
                <div style="font-size: 11px; font-weight: 900; color: #000; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; opacity: 0.5;">OFFICIAL OFFER</div>
                <div style="font-size: 13px; font-weight: 900; color: #000; margin-bottom: 6px; letter-spacing: 0.5px;">PROPOSED MONTHLY SALARY</div>
                <div style="font-size: 40px; font-weight: 950; color: #000; line-height: 1; margin-bottom: 20px;">
                    {{ number_format($applicant->offered_salary, 2) }} <span style="font-size: 16px; font-weight: 700;">ETB</span>
                </div>
                
                @if($applicant->start_date)
                    <div style="display:inline-block; padding: 10px 20px; background: #000; border-radius: 12px; font-size: 12px; font-weight: 800; color: #FDF22F; text-transform: uppercase; letter-spacing: 1px;">
                        📅 Target Start Date: {{ date('F j, Y', strtotime($applicant->start_date)) }}
                    </div>
                @endif
            </div>
        @endif

        {{-- SCORE / RESULTS SECTION --}}
        @if(isset($score) && $score !== null)
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
                <div style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                    @if($score == $applicant->written_exam_score)
                        WRITTEN EXAM RESULT
                    @elseif($score == $applicant->technical_interview_score)
                        TECHNICAL INTERVIEW RESULT
                    @else
                        ASSESSMENT RESULT
                    @endif
                </div>
                <div style="font-size: 48px; font-weight: 900; color: #000; line-height: 1;">
                    @if($score == $applicant->written_exam_score && $applicant->written_raw_score && $applicant->written_out_of)
                        {{ rtrim(rtrim(number_format($applicant->written_raw_score, 2), '0'), '.') }}<span style="font-size: 24px; color: #94a3b8;">/{{ rtrim(rtrim(number_format($applicant->written_out_of, 2), '0'), '.') }}%</span>
                    @elseif($score == $applicant->technical_interview_score && $applicant->technical_raw_score && $applicant->technical_out_of)
                        {{ rtrim(rtrim(number_format($applicant->technical_raw_score, 2), '0'), '.') }}<span style="font-size: 24px; color: #94a3b8;">/{{ rtrim(rtrim(number_format($applicant->technical_out_of, 2), '0'), '.') }}%</span>
                    @else
                        {{ rtrim(rtrim(number_format($score, 2), '0'), '.') }}<span style="font-size: 20px; color: #94a3b8;">%</span>
                    @endif
                </div>
            </div>
        @endif

        {{-- TA TEAM ASSESSOR FEEDBACK & NOTES --}}
        @if($applicant->interviewer_feedback)
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 6px solid #FDF22F; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">ASSESSOR'S FEEDBACK & NOTES</div>
                <div style="font-size: 15px; color: #334155; line-height: 1.6; font-style: italic;">
                    "{{ $applicant->interviewer_feedback }}"
                </div>
            </div>
        @endif

        {{-- ATTACHED DOCUMENTS NOTIFICATION --}}
        @if(isset($examPaperPath) && $examPaperPath)
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="margin-top: 16px; display: inline-block; padding: 8px 16px; background: #e2e8f0; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 12px; font-weight: 700; color: #475569;">
                    📎 Written Exam Paper Attached
                </div>
            </div>
        @endif

        {{-- INTERVIEW / EXAM SCHEDULE DETAILS --}}
        @if(isset($interview) && $interview)
            <div style="background: #FFFBEB; border: 2px solid #FDF22F; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <div style="font-size: 11px; font-weight: 900; color: #8B8B00; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">SCHEDULED DETAILS</div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">DATE & TIME</div>
                        <div style="font-size: 15px; font-weight: 700; color: #000;">{{ $interview->scheduled_at->format('l, F j, Y') }} at {{ $interview->scheduled_at->format('g:i A') }}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">LOCATION / MODE</div>
                        <div style="font-size: 15px; font-weight: 700; color: #000;">{{ $interview->location ?? 'To be announced' }}</div>
                    </div>
                </div>

                @if((isset($interviewMessage) && $interviewMessage) || (isset($interview) && $interview->message))
                    <div style="margin-top: 16px; padding: 16px; background: #ffffff; border-radius: 12px; border: 1px solid #FDF22F; box-shadow: inset 0 0 10px rgba(253, 242, 47, 0.1);">
                        <div style="font-size: 10px; font-weight: 900; color: #8B8B00; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">STAGE INSTRUCTIONS & MESSAGE</div>
                        <div style="font-size: 14px; color: #000; line-height: 1.5; font-style: italic;">
                            "{{ $interviewMessage ?? $interview->message }}"
                        </div>
                    </div>
                @endif
            </div>
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
               class="cta-btn">
                View Application Portal →
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
