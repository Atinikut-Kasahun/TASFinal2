<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()->latest()->get();
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $request->user()->unreadNotifications()->count()
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        return response()->json(['success' => true]);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    }

    public function reply(Request $request, $id)
    {
        $request->validate(['message' => 'required|string|max:1000']);

        // Load the original notification to get the sender_id
        $notification = $request->user()->notifications()->findOrFail($id);
        $data = $notification->data;

        $senderId = $data['sender_id'] ?? null;
        if (!$senderId) {
            return response()->json(['error' => 'Cannot reply - no sender found on this notification.'], 422);
        }

        $sender = \App\Models\User::findOrFail($senderId);
        $replierName = $request->user()->name;

        // Safely get candidate context (may be absent on reply-to-reply notifications)
        $applicantId = $data['applicant_id'] ?? null;
        $applicantName = $applicantId
            ? (optional(\App\Models\Applicant::find($applicantId))->name ?? 'a candidate')
            : ($data['candidate_name'] ?? 'a candidate');

        // Build a simple reply notification using CandidateMention type
        $sender->notify(new \App\Notifications\DirectReply(
            $replierName,
            $request->user()->id,
            $request->message,
            $applicantName
        ));

        // Also mark original as read
        $notification->markAsRead();

        return response()->json(['success' => true]);
    }
    public function destroy(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->delete();
        return response()->json(['success' => true]);
    }
}
