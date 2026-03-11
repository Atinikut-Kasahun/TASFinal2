<?php

namespace App\Http\Controllers;

use App\Mail\OfferLetter;
use App\Models\Applicant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class OfferController extends Controller
{
    /**
     * Send an offer letter email to the applicant.
     */
    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'salary'       => 'required|numeric',
            'start_date'   => 'required|date',
            'notes'        => 'nullable|string',
        ]);

        $applicant = Applicant::where('id', $request->applicant_id)
            ->where('tenant_id', $request->user()->tenant_id)
            ->with(['jobPosting', 'tenant'])
            ->firstOrFail();

        // Send the offer letter email
        Mail::to($applicant->email)->send(new OfferLetter(
            applicant:      $applicant,
            jobPosting:     $applicant->jobPosting,
            offeredSalary:  (string) $request->salary,
            startDate:      $request->start_date,
            notes:          $request->notes,
        ));

        return response()->json([
            'message' => 'Offer letter sent successfully to ' . $applicant->email,
            'offer'   => [
                'applicant_name' => $applicant->name,
                'job_title'      => $applicant->jobPosting->title,
                'salary'         => number_format((float) $request->salary),
                'start_date'     => $request->start_date,
                'email_sent_to'  => $applicant->email,
            ],
        ]);
    }
}
