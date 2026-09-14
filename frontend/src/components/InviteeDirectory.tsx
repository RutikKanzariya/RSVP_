'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, Search, Users, Zap, Trash2 } from 'lucide-react';
import { Invitee } from '@/types';

interface InviteeDirectoryProps {
  invitees: Invitee[];
  onRefresh: () => void;
}

export function InviteeDirectory({ invitees, onRefresh }: InviteeDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValid, setFilterValid] = useState<'all' | 'valid' | 'invalid'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Parsing CSV data...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedRows = results.data;
          const res = await fetch('/api/invitees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: parsedRows })
          });
          const data = await res.json();
          if (data.success) {
            setUploadStatus(`Imported ${data.added} rows! (${data.validCount} valid, ${data.invalidCount} invalid format)`);
            onRefresh();
          } else {
            setUploadStatus(`Upload error: ${data.error}`);
          }
        } catch (err: any) {
          setUploadStatus(`Failed to upload: ${err.message}`);
        } finally {
          setIsUploading(false);
        }
      },
      error: (error) => {
        setUploadStatus(`CSV Parse error: ${error.message}`);
        setIsUploading(false);
      }
    });
  };

  const handleGenerateSynthetic = async (count: number) => {
    setIsGenerating(true);
    setUploadStatus(`Generating ${count} synthetic invitees for scale test...`);
    try {
      const res = await fetch('/api/invitees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generate_count: count })
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatus(`Generated ${data.generated} invitees cleanly! (${data.invalidCount} flagged format errors for test)`);
        onRefresh();
      }
    } catch (err: any) {
      setUploadStatus(`Generator error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const filtered = invitees.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.phone.includes(searchTerm) ||
                          item.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterValid === 'valid') return matchesSearch && item.raw_row_valid;
    if (filterValid === 'invalid') return matchesSearch && !item.raw_row_valid;
    return matchesSearch;
  });

  const validTotal = invitees.filter(i => i.raw_row_valid).length;
  const invalidTotal = invitees.filter(i => !i.raw_row_valid).length;

  return (
    <div className="space-y-6">
      
      {/* CSV Import Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/20 mb-3">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Step 1: Bring Invitee List Into System</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Upload Invitee Master Directory</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Upload your event invitees via CSV file (or test with 1,000+ synthetic rows for scale testing). Invalid phone formats, bad emails, or missing names are automatically flagged.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept=".csv,.txt"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Parsing File...' : 'Upload CSV File'}</span>
            </button>

            <button
              onClick={() => handleGenerateSynthetic(500)}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Simulate 500 Scale List</span>
            </button>
          </div>
        </div>

        {uploadStatus && (
          <div className="mt-4 p-3 bg-blue-950/60 border border-blue-800/40 rounded-xl text-blue-300 text-xs font-mono flex items-center justify-between">
            <span>{uploadStatus}</span>
            <button onClick={() => setUploadStatus(null)} className="text-blue-400 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* Directory Controls & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterValid('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterValid === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({invitees.length})
          </button>

          <button
            onClick={() => setFilterValid('valid')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterValid === 'valid' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Valid ({validTotal})</span>
          </button>

          <button
            onClick={() => setFilterValid('invalid')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterValid === 'invalid' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Format Errors ({invalidTotal})</span>
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Invitee Name</th>
                <th className="px-6 py-4 font-semibold">Phone Number</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Company</th>
                <th className="px-6 py-4 font-semibold text-center">Validation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No invitees matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 100).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
                        {inv.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{inv.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">{inv.phone}</td>
                    <td className="px-6 py-4 text-slate-400">{inv.email}</td>
                    <td className="px-6 py-4 text-slate-400">{inv.company || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      {inv.raw_row_valid ? (
                        <span className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ready for Call</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-medium" title={inv.validation_errors.join(', ')}>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Invalid ({inv.validation_errors.length} issue)</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 100 && (
          <div className="p-3 bg-slate-950 text-center text-xs text-slate-400 border-t border-slate-800">
            Showing top 100 rows out of {filtered.length} total invitees.
          </div>
        )}
      </div>

    </div>
  );
}
