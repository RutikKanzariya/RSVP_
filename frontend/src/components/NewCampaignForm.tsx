'use client';

import React, { useState } from 'react';
import { Sparkles, Calendar, MapPin, Target, Users, CheckCircle2 } from 'lucide-react';
import { Invitee } from '@/types';

interface NewCampaignFormProps {
  invitees: Invitee[];
  onCampaignCreated: () => void;
  onCancel: () => void;
}

export function NewCampaignForm({ invitees, onCampaignCreated, onCancel }: NewCampaignFormProps) {
  const validInvitees = invitees.filter(i => i.raw_row_valid);
  
  const [eventName, setEventName] = useState('GlobalVox Annual Business Meet 2026');
  const [eventDate, setEventDate] = useState('2026-10-25');
  const [eventLocation, setEventLocation] = useState('Ahmedabad Convention Centre, Gujarat');
  const [campaignName, setCampaignName] = useState('Annual Business Meet — RSVP Voice Campaign');
  const [objective, setObjective] = useState('Contact each invitee, confirm attendance status, collect dietary preferences, and answer general venue questions.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          event_date: eventDate,
          event_location: eventLocation,
          campaign_name: campaignName,
          objective: objective,
          invitee_ids: validInvitees.map(i => i.id)
        })
      });

      const data = await res.json();
      if (data.success) {
        onCampaignCreated();
      } else {
        setErrorMsg(data.error || 'Failed to create campaign');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
      
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create New RSVP Campaign</h2>
          <p className="text-slate-400 text-sm">Configure event parameters & snapshot target invitee directory.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/60 rounded-xl text-rose-300 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Event Title</label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Campaign Name</label>
            <input
              type="text"
              required
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> Event Date
            </label>
            <input
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Event Location
            </label>
            <input
              type="text"
              required
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-indigo-400" /> AI Voice Calling Objective
          </label>
          <textarea
            rows={3}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Snapshot Summary Alert */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-start space-x-3">
          <Users className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-white">Target Invitee Snapshot Protection</h4>
            <p className="text-xs text-slate-400 mt-1">
              Creating this campaign will snapshot <span className="font-bold text-blue-400">{validInvitees.length} valid invitees</span> from the master directory. Edits to master lists later will not alter this active campaign.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || validInvitees.length === 0}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Snapshotting Campaign...' : 'Launch Campaign'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
