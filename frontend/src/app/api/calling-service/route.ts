import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { RSVPStatus, CallAttempt } from '@/types';

// API route simulating external AI calling provider
// Endpoint: POST /api/calling-service
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaign_invitee_id, force_outcome, simulated_delay_ms = 800 } = body;

    if (!campaign_invitee_id) {
      return NextResponse.json({ error: 'campaign_invitee_id is required' }, { status: 400 });
    }

    // Find CampaignInvitee across campaigns
    let campaignId = '';
    let targetInviteeIndex = -1;

    for (const cid in db.campaignInvitees) {
      const idx = db.campaignInvitees[cid].findIndex(ci => ci.id === campaign_invitee_id);
      if (idx !== -1) {
        campaignId = cid;
        targetInviteeIndex = idx;
        break;
      }
    }

    if (targetInviteeIndex === -1) {
      return NextResponse.json({ error: 'Invitee not found in active campaigns' }, { status: 404 });
    }

    const invitee = db.campaignInvitees[campaignId][targetInviteeIndex];

    // Artificial delay to simulate real call setup & dialog duration
    if (simulated_delay_ms > 0) {
      await new Promise(res => setTimeout(res, simulated_delay_ms));
    }

    // Determine Call outcome with realistic failure rates & distribution
    // 55% Confirmed, 15% Declined, 15% Undecided, 15% Failed (Timeout / Busy / Network error)
    let outcome: RSVPStatus;
    let errorMessage: string | undefined = undefined;
    let notes = '';
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    let duration = Math.floor(Math.random() * 40) + 15; // 15-55s

    if (force_outcome) {
      outcome = force_outcome;
    } else {
      const rand = Math.random();
      if (rand < 0.55) {
        outcome = 'confirmed';
      } else if (rand < 0.70) {
        outcome = 'declined';
      } else if (rand < 0.85) {
        outcome = 'undecided';
      } else {
        outcome = 'failed';
      }
    }

    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + duration * 1000).toISOString();

    // Contextual dialog transcripts and note generation based on outcome
    let transcript: { speaker: 'AI' | 'Invitee'; message: string }[] = [];

    if (outcome === 'confirmed') {
      sentiment = 'positive';
      notes = 'Confirmed attendance over voice call. Requested event venue directions and agenda details.';
      transcript = [
        { speaker: 'AI', message: `Hello ${invitee.name}, calling on behalf of GlobalVox for the event. Will you be able to attend?` },
        { speaker: 'Invitee', message: 'Yes, absolutely! Please mark me as confirmed.' },
        { speaker: 'AI', message: 'Wonderful! We look forward to seeing you there.' }
      ];
    } else if (outcome === 'declined') {
      sentiment = 'negative';
      notes = 'Declined. Cited prior business travel conflict during the event dates.';
      transcript = [
        { speaker: 'AI', message: `Hi ${invitee.name}, GlobalVox calling for RSVP confirmation. Are you attending the upcoming meet?` },
        { speaker: 'Invitee', message: 'Sorry, I have a prior business commitment that week and cannot make it.' },
        { speaker: 'AI', message: 'Thank you for letting us know. We appreciate your response.' }
      ];
    } else if (outcome === 'undecided') {
      sentiment = 'neutral';
      notes = 'Undecided. Will confirm after reviewing team schedule by end of week.';
      transcript = [
        { speaker: 'AI', message: `Hello ${invitee.name}, reaching out from GlobalVox for your RSVP status.` },
        { speaker: 'Invitee', message: 'I am still checking my calendar. Can you send an email summary?' },
        { speaker: 'AI', message: 'Certainly! Summary sent to your email.' }
      ];
    } else {
      duration = Math.floor(Math.random() * 8) + 3;
      notes = 'Call attempt failed.';
      const errors = [
        'PROVIDER_TIMEOUT (No response from carrier within 10s)',
        'BUSY_SIGNAL (Recipient rejected call or line busy)',
        'SUBSCRIBER_UNREACHABLE (Network unreachable / Phone off)',
        'SERVICE_503 (External AI voice gateway temporary overload)'
      ];
      errorMessage = errors[Math.floor(Math.random() * errors.length)];
    }

    // Increment attempts
    const newAttemptCount = invitee.attempt_count + 1;
    const maxRetries = 3;

    let updatedStatus: RSVPStatus = outcome;
    if (outcome === 'failed' && newAttemptCount < maxRetries) {
      // Revert status to pending so retry batch runner can re-attempt up to maxRetries
      updatedStatus = 'pending';
    }

    // Update memory store state
    invitee.attempt_count = newAttemptCount;
    invitee.status = updatedStatus;
    invitee.last_attempted_at = endTime;
    invitee.captured_notes = notes;
    if (sentiment) invitee.sentiment = sentiment;

    const callAttemptLog: CallAttempt = {
      id: `ca_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      campaign_invitee_id: invitee.id,
      invitee_name: invitee.name,
      started_at: startTime,
      ended_at: endTime,
      duration_sec: duration,
      outcome: outcome,
      error_message: errorMessage,
      raw_response: {
        provider_session_id: `provider_sess_${Math.random().toString(36).substring(7)}`,
        status_code: outcome === 'failed' ? 502 : 200,
        provider: 'GlobalVox-AI-Voice-Engine-v2',
        timestamp: endTime
      },
      transcript
    };

    if (!db.callAttempts[invitee.id]) {
      db.callAttempts[invitee.id] = [];
    }
    db.callAttempts[invitee.id].unshift(callAttemptLog);

    return NextResponse.json({
      success: true,
      invitee: invitee,
      attempt: callAttemptLog
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error in Calling Service' }, { status: 500 });
  }
}
