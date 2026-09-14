import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { Campaign, CampaignInvitee } from '@/types';

// GET /api/campaigns - List all campaigns
// POST /api/campaigns - Create a new campaign (snapshotting invitees)
export async function GET() {
  return NextResponse.json({
    campaigns: db.campaigns,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_name, event_date, event_location, campaign_name, objective, invitee_ids } = body;

    if (!event_name || !campaign_name) {
      return NextResponse.json({ error: 'Event name and Campaign name are required' }, { status: 400 });
    }

    // Determine target invitees from master list (only valid rows)
    const validMasterInvitees = db.invitees.filter(i => i.raw_row_valid);
    const selectedInvitees = invitee_ids && invitee_ids.length > 0
      ? validMasterInvitees.filter(i => invitee_ids.includes(i.id))
      : validMasterInvitees;

    if (selectedInvitees.length === 0) {
      return NextResponse.json({ error: 'No valid invitees selected to snapshot into campaign' }, { status: 400 });
    }

    const newCampaignId = `camp_${Date.now()}`;
    const newCampaign: Campaign = {
      id: newCampaignId,
      event_name,
      event_date: event_date || '2026-10-25',
      event_location: event_location || 'Ahmedabad',
      campaign_name,
      objective: objective || 'RSVP Calling',
      status: 'draft',
      created_at: new Date().toISOString(),
      total_invitees: selectedInvitees.length,
      max_retries: 3,
    };

    // Snapshot invitees into CampaignInvitee model
    const snapshottedInvitees: CampaignInvitee[] = selectedInvitees.map((inv, idx) => ({
      id: `ci_${newCampaignId}_${idx + 1}`,
      campaign_id: newCampaignId,
      invitee_id: inv.id,
      name: inv.name,
      phone: inv.phone,
      email: inv.email,
      company: inv.company,
      status: 'pending',
      attempt_count: 0
    }));

    db.campaigns.unshift(newCampaign);
    db.campaignInvitees[newCampaignId] = snapshottedInvitees;

    return NextResponse.json({
      success: true,
      campaign: newCampaign,
      invitee_count: snapshottedInvitees.length
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create campaign' }, { status: 500 });
  }
}
