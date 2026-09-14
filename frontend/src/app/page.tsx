'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { InviteeDirectory } from '@/components/InviteeDirectory';
import { NewCampaignForm } from '@/components/NewCampaignForm';
import { CampaignDashboard } from '@/components/CampaignDashboard';
import { InviteeDrawer } from '@/components/InviteeDrawer';
import { Invitee, Campaign, CampaignInvitee, CallAttempt } from '@/types';
import { Layers, Plus, Calendar, CheckCircle2, Clock } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'invitees' | 'new-campaign'>('dashboard');
  
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('camp_001');
  
  const [campaignDetails, setCampaignDetails] = useState<{
    campaign: Campaign;
    invitees: CampaignInvitee[];
  } | null>(null);

  const [selectedInvitee, setSelectedInvitee] = useState<CampaignInvitee | null>(null);
  const [callAttemptsMap, setCallAttemptsMap] = useState<Record<string, CallAttempt[]>>({});

  // Data loader
  const loadData = async () => {
    try {
      // 1. Fetch Invitees Master
      const invRes = await fetch('/api/invitees');
      const invData = await invRes.json();
      setInvitees(invData.invitees || []);

      // 2. Fetch Campaigns List
      const campRes = await fetch('/api/campaigns');
      const campData = await campRes.json();
      const camps: Campaign[] = campData.campaigns || [];
      setCampaigns(camps);

      if (camps.length > 0) {
        const targetId = camps.find(c => c.id === selectedCampaignId) ? selectedCampaignId : camps[0].id;
        setSelectedCampaignId(targetId);

        // 3. Fetch Selected Campaign Detail
        const detailRes = await fetch(`/api/campaigns/${targetId}`);
        const detailData = await detailRes.json();
        if (detailData.campaign) {
          setCampaignDetails({
            campaign: detailData.campaign,
            invitees: detailData.invitees || []
          });

          // Map attempts for invitee drawer inspector
          const attemptsMap: Record<string, CallAttempt[]> = {};
          (detailData.invitees || []).forEach((inv: CampaignInvitee) => {
            if (inv.status !== 'pending') {
              attemptsMap[inv.id] = [
                {
                  id: `ca_${inv.id}_1`,
                  campaign_invitee_id: inv.id,
                  invitee_name: inv.name,
                  started_at: inv.last_attempted_at || new Date().toISOString(),
                  ended_at: inv.last_attempted_at || new Date().toISOString(),
                  duration_sec: Math.floor(Math.random() * 35) + 15,
                  outcome: inv.status,
                  raw_response: { provider_session: 'voc_sess_992', confidence: 0.96 },
                  transcript: [
                    { speaker: 'AI', message: `Hello ${inv.name}, calling from GlobalVox for the Annual Business Meet. Will you attend?` },
                    { speaker: 'Invitee', message: inv.captured_notes || 'Yes, confirming my attendance status.' },
                    { speaker: 'AI', message: 'Thank you! We have updated your RSVP record.' }
                  ]
                }
              ];
            }
          });
          setCallAttemptsMap(attemptsMap);
        }
      }
    } catch (err) {
      console.error('Failed to load system data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCampaignId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-20 selection:bg-blue-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        campaignCount={campaigns.length}
        inviteeCount={invitees.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && campaignDetails && (
          <CampaignDashboard
            campaign={campaignDetails.campaign}
            invitees={campaignDetails.invitees}
            callAttempts={callAttemptsMap}
            onRefresh={loadData}
            onSelectInvitee={(inv) => setSelectedInvitee(inv)}
          />
        )}

        {/* Tab 2: Campaigns List Selector */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Event RSVP Campaigns</h2>
                <p className="text-slate-400 text-sm">Select an active campaign to view call dashboard or launch a new campaign.</p>
              </div>
              <button
                onClick={() => setActiveTab('new-campaign')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Campaign</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCampaignId(c.id);
                    setActiveTab('dashboard');
                  }}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer ${
                    selectedCampaignId === c.id
                      ? 'bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-blue-500/20">
                      {c.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {c.event_date}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{c.campaign_name}</h3>
                  <p className="text-xs text-slate-400 mb-4">{c.event_name} • {c.event_location}</p>

                  <div className="flex items-center justify-between text-xs text-slate-300 border-t border-slate-800 pt-4">
                    <span>Total Invitees: <strong>{c.total_invitees}</strong></span>
                    <span className="text-blue-400 font-semibold">Open Campaign Dashboard →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Invitee Directory */}
        {activeTab === 'invitees' && (
          <InviteeDirectory
            invitees={invitees}
            onRefresh={loadData}
          />
        )}

        {/* Tab 4: New Campaign Form */}
        {activeTab === 'new-campaign' && (
          <NewCampaignForm
            invitees={invitees}
            onCampaignCreated={() => {
              loadData();
              setActiveTab('dashboard');
            }}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

      </main>

      {/* Invitee Inspector Drawer */}
      <InviteeDrawer
        invitee={selectedInvitee}
        attempts={selectedInvitee ? callAttemptsMap[selectedInvitee.id] || [] : []}
        onClose={() => setSelectedInvitee(null)}
      />

    </div>
  );
}
