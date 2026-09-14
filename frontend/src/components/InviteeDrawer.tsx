'use client';

import React from 'react';
import { X, PhoneCall, CheckCircle2, XCircle, HelpCircle, Clock, AlertTriangle, MessageSquare, History, FileText, User } from 'lucide-react';
import { CampaignInvitee, CallAttempt } from '@/types';

interface InviteeDrawerProps {
  invitee: CampaignInvitee | null;
  attempts: CallAttempt[];
  onClose: () => void;
}

export function InviteeDrawer({ invitee, attempts, onClose }: InviteeDrawerProps) {
  if (!invitee) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5" /><span>Confirmed Attendance</span></span>;
      case 'declined':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5"><XCircle className="w-3.5 h-3.5" /><span>Declined</span></span>;
      case 'undecided':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5"><HelpCircle className="w-3.5 h-3.5" /><span>Undecided / Needs Time</span></span>;
      case 'failed':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5"><AlertTriangle className="w-3.5 h-3.5" /><span>Call Failed (Retries Exhausted)</span></span>;
      default:
        return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5"><Clock className="w-3.5 h-3.5" /><span>Pending Contact</span></span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-lg">
              {invitee.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">{invitee.name}</h3>
              <p className="text-xs text-slate-400">{invitee.company || 'Individual Invitee'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Bar */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400">Current Campaign Status</span>
            {getStatusBadge(invitee.status)}
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block mb-1 font-semibold">Phone Number</span>
              <span className="text-white font-mono text-sm">{invitee.phone}</span>
            </div>
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block mb-1 font-semibold">Email Address</span>
              <span className="text-white truncate block">{invitee.email}</span>
            </div>
          </div>

          {/* AI Notes & Sentiment */}
          {invitee.captured_notes && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400">
                <FileText className="w-4 h-4" />
                <span>Captured AI Insights & Notes</span>
              </div>
              <p className="text-slate-300 text-sm italic">{invitee.captured_notes}</p>
              {invitee.dietary_requirements && (
                <div className="mt-2 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded inline-block">
                  Dietary Requirement: {invitee.dietary_requirements}
                </div>
              )}
            </div>
          )}

          {/* Call Attempts Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-sm font-bold text-white">
                <History className="w-4 h-4 text-indigo-400" />
                <span>Call Attempt History ({attempts.length})</span>
              </div>
              <span className="text-xs text-slate-400">Total Attempts: {invitee.attempt_count}</span>
            </div>

            {attempts.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
                No voice calls initiated for this invitee yet.
              </div>
            ) : (
              attempts.map((attempt, i) => (
                <div key={attempt.id || i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                    <span className="font-semibold text-slate-300">
                      Attempt #{attempts.length - i} — {new Date(attempt.started_at).toLocaleTimeString()}
                    </span>
                    <span className="font-mono text-slate-400">{attempt.duration_sec}s duration</span>
                  </div>

                  {attempt.error_message && (
                    <div className="p-2.5 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300 text-xs font-mono">
                      Error: {attempt.error_message}
                    </div>
                  )}

                  {/* Dialog Transcript */}
                  {attempt.transcript && attempt.transcript.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">AI Transcript</span>
                      <div className="space-y-2 text-xs">
                        {attempt.transcript.map((line, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl max-w-[85%] ${
                              line.speaker === 'AI'
                                ? 'bg-blue-600/20 text-blue-200 border border-blue-500/20 mr-auto'
                                : 'bg-slate-800 text-slate-200 ml-auto'
                            }`}
                          >
                            <span className="text-[10px] font-bold block text-slate-400 mb-0.5">{line.speaker}</span>
                            <span>{line.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
