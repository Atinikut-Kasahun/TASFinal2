<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Offer Letter — Droga Pharma P.L.C.</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ink:       #1a1a2e;
      --accent:    #1a6b3c;
      --accent-lt: #e8f5ee;
      --paper:     #fdfcf8;
      --rule:      #d8d3c8;
      --shadow:    rgba(26,26,46,0.13);
    }

    body {
      background: #eceae4;
      font-family: 'DM Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }

    /* ── Outer wrapper ── */
    .envelope-scene {
      width: 100%;
      max-width: 720px;
      position: relative;
    }

    /* ── Envelope body ── */
    .envelope-body {
      background: linear-gradient(160deg, #d4c4a8 0%, #c8b89a 100%);
      border-radius: 8px;
      padding: 4px 4px 0;
      position: relative;
      z-index: 2;
      box-shadow:
        0 8px 40px var(--shadow),
        0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    /* Envelope diagonal fold lines bottom */
    .envelope-body::before,
    .envelope-body::after {
      content: '';
      position: absolute;
      bottom: 0;
      width: 52%;
      height: 3px;
      background: rgba(0,0,0,0.07);
      pointer-events: none;
      z-index: 10;
    }
    .envelope-body::before {
      left: 0;
      transform-origin: left bottom;
      transform: rotate(-11deg);
    }
    .envelope-body::after {
      right: 0;
      transform-origin: right bottom;
      transform: rotate(11deg);
    }

    /* ── Flap triangle ── */
    .envelope-flap {
      width: 100%;
      overflow: visible;
      position: relative;
      z-index: 5;
      height: 110px;
      margin-bottom: -2px;
    }
    .envelope-flap svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    /* ── Stamp + postmark ── */
    .stamp-area {
      position: absolute;
      top: 120px;
      right: 22px;
      z-index: 10;
      display: flex;
      align-items: flex-start;
      gap: 6px;
    }
    .stamp {
      width: 62px;
      height: 62px;
      background: var(--accent-lt);
      border: 2px solid var(--accent);
      border-radius: 3px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6px 4px;
      gap: 2px;
      box-shadow:
        inset 0 0 0 1.5px rgba(255,255,255,0.7),
        0 2px 6px rgba(0,0,0,0.18);
      position: relative;
    }
    /* Perforation */
    .stamp::after {
      content: '';
      position: absolute;
      inset: -4px;
      border: 3.5px dotted var(--accent);
      border-radius: 5px;
      opacity: 0.3;
    }
    .stamp-logo {
      font-family: 'DM Serif Display', serif;
      font-size: 10.5px;
      color: var(--accent);
      line-height: 1.15;
      text-align: center;
    }
    .stamp-sub {
      font-size: 7px;
      color: var(--accent);
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      opacity: 0.7;
    }
    .postmark {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 54px;
      height: 62px;
    }
    .postmark-ring {
      width: 50px;
      height: 50px;
      border: 1.5px solid rgba(0,0,0,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .postmark-ring::before,
    .postmark-ring::after {
      content: '';
      position: absolute;
      left: -5px; right: -5px;
      height: 1.5px;
      background: rgba(0,0,0,0.15);
    }
    .postmark-ring::before { top: 28%; }
    .postmark-ring::after  { top: 65%; }
    .postmark-text {
      font-size: 7px;
      font-weight: 700;
      letter-spacing: 1px;
      color: rgba(0,0,0,0.3);
      text-transform: uppercase;
      text-align: center;
      line-height: 1.4;
      z-index: 1;
    }

    /* ── Address window ── */
    .address-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 20px 10px;
      position: relative;
      z-index: 8;
    }
    .address-window {
      display: inline-block;
      background: rgba(255,255,255,0.52);
      border: 1.5px solid rgba(255,255,255,0.85);
      border-radius: 4px;
      padding: 10px 14px;
      min-width: 195px;
      backdrop-filter: blur(2px);
      box-shadow: 0 1px 4px rgba(0,0,0,0.09);
    }
    .addr-label {
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 5px;
    }
    .addr-name {
      font-weight: 700;
      font-size: 13px;
      color: #1a1a2e;
      line-height: 1.4;
    }
    .addr-city {
      font-size: 12px;
      color: #444;
      line-height: 1.5;
    }
    .addr-email {
      font-size: 11px;
      color: #666;
      margin-top: 2px;
    }

    /* ── The letter paper ── */
    .letter-card {
      background: var(--paper);
      border-radius: 4px;
      margin: 0 4px;
      padding: 50px 58px 52px;
      position: relative;
      z-index: 6;
      /* subtle paper texture via repeating lines */
      background-image: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 27px,
        rgba(0,0,0,0.032) 27px,
        rgba(0,0,0,0.032) 28px
      );
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.95);
    }

    /* ── Letterhead ── */
    .letter-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-bottom: 18px;
      border-bottom: 2.5px solid var(--accent);
      margin-bottom: 28px;
    }
    .brand-name {
      font-family: 'DM Serif Display', serif;
      font-size: 21px;
      color: var(--ink);
      line-height: 1;
      letter-spacing: -0.2px;
    }
    .brand-dept {
      font-size: 9.5px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--accent);
      margin-top: 4px;
    }
    .letter-date {
      font-size: 11.5px;
      color: #888;
      text-align: right;
      line-height: 1.6;
    }
    .letter-date strong {
      color: var(--ink);
      font-weight: 600;
    }

    /* ── Letter body ── */
    .to-block {
      margin-bottom: 20px;
    }
    .to-block p {
      font-size: 13.5px;
      color: var(--ink);
      line-height: 1.55;
    }
    .f-bold-ul {
      font-weight: 700;
      text-decoration: underline;
      text-underline-offset: 3px;
      color: var(--ink);
    }

    .offer-title {
      text-align: center;
      font-size: 14.5px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-decoration: underline;
      text-underline-offset: 4px;
      text-transform: uppercase;
      color: var(--ink);
      margin-bottom: 22px;
    }

    .lp {
      font-size: 13.5px;
      color: #2a2a3e;
      line-height: 1.82;
      text-align: justify;
      margin-bottom: 15px;
    }

    /* Notes (optional) */
    .notes-block {
      margin: 18px 0;
      padding: 12px 16px;
      border-left: 3px solid var(--accent);
      background: #f0f7f3;
      border-radius: 0 4px 4px 0;
      font-style: italic;
      font-size: 13px;
      color: #2a2a3e;
      line-height: 1.7;
    }

    .closing {
      margin-top: 42px;
      text-align: right;
    }
    .closing p {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--ink);
    }
    .sig-line {
      margin-top: 52px;
      padding-top: 8px;
      border-top: 1px solid var(--rule);
      width: 160px;
      margin-left: auto;
    }
    .sig-label {
      font-size: 9px;
      color: #bbb;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      text-align: right;
    }

    /* ── Footer inside letter ── */
    .letter-footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #e8e3d8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .lf-conf {
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #ccc;
    }
    .lf-ref {
      font-size: 8.5px;
      color: #ccc;
      letter-spacing: 0.4px;
    }

    /* ── Bottom fold ── */
    .envelope-bottom {
      height: 22px;
      background: linear-gradient(to bottom, #c0af96, #b0a080);
      margin: 0 4px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.2);
    }

    /* ── Ground shadow ── */
    .ground-shadow {
      height: 14px;
      background: radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.16) 0%, transparent 72%);
      margin: 0 20px;
    }

    @media (max-width: 580px) {
      .letter-card   { padding: 30px 24px 38px; }
      .letter-header { flex-direction: column; gap: 8px; align-items: flex-start; }
      .letter-date   { text-align: left; }
      .stamp-area    { top: 110px; right: 12px; }
    }
  </style>
</head>
<body>

<div class="envelope-scene">

  <div class="envelope-body">

    <!-- ── Flap ── -->
    <div class="envelope-flap">
      <svg viewBox="0 0 720 110" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stop-color="#bfae94"/>
            <stop offset="100%" stop-color="#c8b89e"/>
          </linearGradient>
        </defs>
        <!-- Flap shape -->
        <path d="M0,0 L720,0 L360,108 Z" fill="url(#fg)"/>
        <!-- Inner crease shadow -->
        <path d="M0,0 L360,108 L720,0" fill="none" stroke="rgba(0,0,0,0.07)" stroke-width="1.5"/>
        <!-- Highlight edges -->
        <path d="M1,0 L360,105"  fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>
        <path d="M719,0 L360,105" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>
        <!-- Wax seal circle at tip -->
        <circle cx="360" cy="90" r="14" fill="#1a6b3c" opacity="0.85"/>
        <circle cx="360" cy="90" r="10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
        <text x="360" y="94" text-anchor="middle" font-family="DM Serif Display, serif" font-size="10" fill="white" opacity="0.9">DP</text>
      </svg>
    </div>

    <!-- ── Stamp + address ── -->
    <div class="stamp-area">
      <div class="stamp">
        <span class="stamp-logo">Droga<br/>Pharma</span>
        <span class="stamp-sub">P.L.C.</span>
      </div>
      <div class="postmark">
        <div class="postmark-ring">
          <span class="postmark-text">ADDIS<br/>ABABA<br/>ET</span>
        </div>
      </div>
    </div>

    <div class="address-row">
      <div class="address-window">
        <div class="addr-label">Deliver To</div>
        <div class="addr-name">{{ $applicant->name }}</div>
        <div class="addr-city">Addis Ababa, Ethiopia</div>
        <div class="addr-email">{{ $applicant->email }}</div>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         LETTER PAPER
    ══════════════════════════════════════ -->
    <div class="letter-card">

      <!-- Letterhead -->
      <div class="letter-header">
        <div>
          <div class="brand-name">Droga Pharma P.L.C.</div>
          <div class="brand-dept">Human Resources Department</div>
        </div>
        <div class="letter-date">
          <strong>Addis Ababa</strong>, Ethiopia<br/>
          {{ \Carbon\Carbon::parse($startDate)->format('F d, Y') }}
        </div>
      </div>

      <!-- To: block -->
      <div class="to-block">
        <p>To: <span class="f-bold-ul">{{ $applicant->name }}</span></p>
        <p><span class="f-bold-ul">Addis Ababa</span></p>
      </div>

      <!-- Title -->
      <div class="offer-title">Offer Letter</div>

      <!-- Salutation -->
      <p class="lp">Dear <span class="f-bold-ul">{{ explode(' ', trim($applicant->name))[0] }}</span>,</p>

      <!-- Para 1 -->
      <p class="lp">
        We are pleased to offer you the position of
        <span class="f-bold-ul">{{ $jobPosting->title }}</span>
        at Droga Pharma P.L.C. The position will be based in Addis Ababa.
      </p>

      <!-- Para 2 — fully dynamic salary + date -->
      <p class="lp">
        As we discussed, your starting date will be
        <span class="f-bold-ul">
          {{ \Carbon\Carbon::parse($startDate)->format('F d, Y') }}
        </span>
        with a monthly basic salary of
        <span class="f-bold-ul">
          ETB {{ number_format((float)$offeredSalary, 0) }}
          ({{ ucwords((new \NumberFormatter('en', \NumberFormatter::SPELLOUT))->format((float)$offeredSalary)) }})
        </span>
        and details of the salary and related benefit packages will be communicated
        in a separate employment letter.
      </p>

      <!-- Para 3 -->
      <p class="lp">
        We are confident you will be able to make a significant contribution to the success
        of our company and look forward to working with you.
      </p>

      <!-- Para 4 -->
      <p class="lp">
        Please Sign and return a copy of this letter to indicate your acceptance of this offer.
      </p>

      @if(!empty($notes))
      <div class="notes-block">{{ $notes }}</div>
      @endif

      <!-- Closing -->
      <div class="closing">
        <p>Sincerely,</p>
        <div class="sig-line">
          <div class="sig-label">Authorised Signatory</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="letter-footer">
        <span class="lf-conf">Confidential</span>
        <span class="lf-ref">Droga Pharma P.L.C. · Human Resources · Addis Ababa</span>
      </div>

    </div><!-- /letter-card -->

    <!-- Bottom fold -->
    <div class="envelope-bottom"></div>

  </div><!-- /envelope-body -->

  <!-- Ground shadow -->
  <div class="ground-shadow"></div>

</div><!-- /envelope-scene -->

</body>
</html>
