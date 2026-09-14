import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

// GET /api/campaigns/[id] - Get campaign details with invitees and stats
// PATCH /api/campaigns/[id] - Update status (run / pause / complete)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: campaignId } = await params;
  const campaign = db.campaigns.find(c => c.id === campaignId);

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  const invitees = db.campaignInvitees[campaignId] || [];

  // Calculate live stats breakdown
  const stats = {
    total: invitees.length,
    confirmed: invitees.filter(i => i.status === 'confirmed').length,
    declined: invitees.filter(i => i.status === 'declined').length,
    undecided: invitees.filter(i => i.status === 'undecided').length,
    pending: invitees.filter(i => i.status === 'pending').length,
    calling: invitees.filter(i => i.status === 'calling').length,
    failed: invitees.filter(i => i.status === 'failed').length,
  };

  return NextResponse.json({
    campaign,
    invitees,
    stats
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: campaignId } = await params;
  const campaign = db.campaigns.find(c => c.id === campaignId);


  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  const body = await req.json();
  if (body.status) {
    campaign.status = body.status;
  }

  return NextResponse.json({ success: true, campaign });
}
