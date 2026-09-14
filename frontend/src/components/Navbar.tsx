'use client';

import React from 'react';
import { PhoneCall, Users, Layers, PlayCircle, BarChart3, ShieldAlert, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'campaigns' | 'invitees' | 'new-campaign';
  setActiveTab: (tab: 'dashboard' | 'campaigns' | 'invitees' | 'new-campaign') => void;
  campaignCount: number;
  inviteeCount: number;
}

export function Navbar({ activeTab, setActiveTab, campaignCount, inviteeCount }: NavbarProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <PhoneCall className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-blue-200">
                  GlobalVox
                </span>
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/30 font-medium">
                  Voice Agent HQ
                </span>
              </div>
              <p className="text-xs text-slate-400">RSVP Calling Campaign Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'campaigns'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Campaigns</span>
              <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-700">
                {campaignCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('invitees')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'invitees'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Invitee Directory</span>
              <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-700">
                {inviteeCount}
              </span>
            </button>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('new-campaign')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>New Campaign</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
