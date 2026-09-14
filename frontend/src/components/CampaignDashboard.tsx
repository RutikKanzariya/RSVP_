'use client';

import React, { useState, useEffect } from 'react';
import { PhoneCall, Play, Pause, RefreshCw, CheckCircle2, XCircle, HelpCircle, Clock, AlertTriangle, Users, BarChart3, Filter, ArrowRight, Zap } from 'lucide-react';
import { Campaign, CampaignInvitee, CallAttempt } from '@/types';

interface CampaignDashboardProps {
  campaign: Campaign;
  invitees: CampaignInvitee[];
  callAttempts: Record<string, CallAttempt[]>;
  onRefresh: () => void;
  onSelectInvitee: (invitee: CampaignInvitee) => void;
}

export function CampaignDashboard({ campaign, invitees, callAttempts, onRefresh, onSelectInvitee }: CampaignDashboardProps) {
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ processed: 0, total: 0, currentName: '' });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Stats calculation
  const total = invitees.length;
  const confirmed = invitees.filter(i => i.status === 'confirmed').length;
  const declined = invitees.filter(i => i.status === 'declined').length;
  const undecided = invitees.filter(i => i.status === 'undecided').length;
  const pending = invitees.filter(i => i.status === 'pending').length;
  const failed = invitees.filter(i => i.status === 'failed').length;

  const completedCount = confirmed + declined + undecided + failed;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Backend handles batching and MongoDB bulk updates in ~1-2 seconds
  const startCallingCampaign = async () => {
    const pendingInvitees = invitees.filter(i => i.status === 'pending');
    if (pendingInvitees.length === 0) return;

    setIsRunningBatch(true);
    setBatchProgress({ processed: 0, total: pendingInvitees.length, currentName: 'Initializing AI calling engine...' });

    try {
      setBatchProgress({ processed: pendingInvitees.length / 2, total: pendingInvitees.length, currentName: `Simulating ${pendingInvitees.length} Calls Serverside...` });
      
      await fetch('http://localhost:8000/api/calling/execute-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id
        })
      });
      
      setBatchProgress({ processed: pendingInvitees.length, total: pendingInvitees.length, currentName: 'Batch process complete!' });
    } catch (err) {
      console.error('Call failed', err);
    } finally {
      setIsRunningBatch(false);
      onRefresh();
    }
  };

  const filteredInvitees = invitees.filter(inv => {
    const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.phone.includes(searchTerm) ||
                          inv.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter !== 'all') {
      return matchesSearch && inv.status === statusFilter;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Executive Campaign Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/0 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Active Campaign</span>
              </span>
              <span className="text-slate-400 text-xs font-mono">{campaign.event_date}</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight">{campaign.campaign_name}</h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              <span>Event: <strong className="text-slate-200">{campaign.event_name}</strong></span>
              <span>•</span>
              <span>Location: <strong className="text-slate-200">{campaign.event_location}</strong></span>
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-5 h-5 ${isRunningBatch ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={startCallingCampaign}
              disabled={isRunningBatch || pending === 0}
              className="flex items-center space-x-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.02] active:scale-98 disabled:opacity-50"
            >
              <PhoneCall className="w-5 h-5 animate-bounce" />
              <span>{isRunningBatch ? 'AI Agent Calling Invites...' : pending === 0 ? 'Campaign Completed' : `Start AI Calling (${pending} Pending)`}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Real-time Indicator */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{isRunningBatch ? batchProgress.currentName : `Campaign Progress: ${completedCount} of ${total} Contacted`}</span>
            </span>
            <span className="text-blue-400 font-bold text-sm">{progressPercent}%</span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* High-Level Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-black text-white">{total}</p>
          <span className="text-[11px] text-slate-500">Master Snapshotted</span>
        </div>

        {/* Confirmed */}
        <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 shadow-lg space-y-1 bg-emerald-950/10">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{confirmed}</p>
          <span className="text-[11px] text-emerald-500/80">{total > 0 ? Math.round((confirmed / total) * 100) : 0}% of total</span>
        </div>

        {/* Declined */}
        <div className="bg-slate-900 border border-rose-500/20 rounded-2xl p-4 shadow-lg space-y-1 bg-rose-950/10">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Declined</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">{declined}</p>
          <span className="text-[11px] text-rose-500/80">{total > 0 ? Math.round((declined / total) * 100) : 0}% of total</span>
        </div>

        {/* Undecided */}
        <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-4 shadow-lg space-y-1 bg-amber-950/10">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Undecided</span>
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{undecided}</p>
          <span className="text-[11px] text-amber-500/80">Follow-up requested</span>
        </div>

        {/* Pending */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-300">{pending}</p>
          <span className="text-[11px] text-slate-500">Awaiting AI Call</span>
        </div>

        {/* Failed */}
        <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-4 shadow-lg space-y-1 bg-red-950/10">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Failed</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400">{failed}</p>
          <span className="text-[11px] text-red-500/80">Carrier / Timeout errors</span>
        </div>

      </div>

      {/* Invitee Execution Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Table Filters Header */}
        <div className="p-4 sm:p-6 bg-slate-950/80 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-bold text-white">Campaign Invitee Calling List</h3>
            <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-0.5 rounded-full font-mono">
              {filteredInvitees.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['all', 'confirmed', 'declined', 'undecided', 'pending', 'failed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/40 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Invitee</th>
                <th className="px-6 py-4 font-semibold">Phone / Contact</th>
                <th className="px-6 py-4 font-semibold">RSVP Status</th>
                <th className="px-6 py-4 font-semibold">Call Attempts</th>
                <th className="px-6 py-4 font-semibold">Latest AI Notes</th>
                <th className="px-6 py-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvitees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No invitees found for the selected status filter.
                  </td>
                </tr>
              ) : (
                filteredInvitees.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectInvitee(inv)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      <div>{inv.name}</div>
                      <div className="text-xs text-slate-400">{inv.company || 'Individual'}</div>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-300 text-xs">{inv.phone}</td>

                    <td className="px-6 py-4">
                      {inv.status === 'confirmed' && (
                        <span className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmed</span>
                        </span>
                      )}
                      {inv.status === 'declined' && (
                        <span className="inline-flex items-center space-x-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Declined</span>
                        </span>
                      )}
                      {inv.status === 'undecided' && (
                        <span className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Undecided</span>
                        </span>
                      )}
                      {inv.status === 'pending' && (
                        <span className="inline-flex items-center space-x-1.5 bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                      {inv.status === 'failed' && (
                        <span className="inline-flex items-center space-x-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Failed ({inv.attempt_count}/3)</span>
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {inv.attempt_count} attempts
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-300 max-w-xs truncate">
                      {inv.captured_notes || '—'}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-400 hover:text-white text-xs font-semibold inline-flex items-center space-x-1">
                        <span>View Log</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
