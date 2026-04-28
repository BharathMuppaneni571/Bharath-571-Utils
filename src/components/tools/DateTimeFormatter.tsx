import React, { useState } from 'react';
import { Copy, Calendar, Clock, Globe } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const DateTimeFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<{ iso: string; locale: string; utc: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'datetime-formatter',
    (values: any) => {
      if (values.input !== undefined) setInput(values.input);
      if (values.results !== undefined) setResults(values.results);
    },
    () => ({ input, results })
  );

  const formatDateTime = () => {
    if (!input.trim()) return;
    try {
      let date: Date;
      if (!isNaN(input as any) && input.length >= 10) {
        date = new Date(parseInt(input, 10));
      } else {
        date = new Date(input);
      }

      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }

      const newResults = {
        iso: date.toISOString(),
        locale: date.toLocaleString(),
        utc: date.toUTCString(),
      };
      setResults(newResults);
      setError(null);
      recordAction();
    } catch (err: any) {
      setError(err.message);
      setResults(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const setNow = () => {
    const now = new Date();
    setInput(now.toISOString());
    setResults({
      iso: now.toISOString(),
      locale: now.toLocaleString(),
      utc: now.toUTCString(),
    });
    setError(null);
  };

  const setTimestamp = () => {
    const now = Date.now();
    setInput(now.toString());
    formatDateTime();
  };

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-8 h-8 text-nexus-accent" />
        <h2 className="text-2xl font-bold glow-text">Date-Time Formatter</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Timestamp / Date String</label>
          <textarea
            className="w-full h-32 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors resize-none"
            placeholder="e.g. 2024-08-30T14:23:00Z or 1693400580000"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={formatDateTime}
              className="flex-1 bg-nexus-accent/20 hover:bg-nexus-accent/30 text-nexus-accent border border-nexus-accent/30 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Format
            </button>
            <button
              onClick={setNow}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all text-sm"
            >
              Now (ISO)
            </button>
            <button
              onClick={setTimestamp}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all text-sm"
            >
              Now (TS)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Results</label>
          
          <div className="space-y-3">
            {error ? (
              <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            ) : results ? (
              <>
                <div className="group relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      <Globe className="w-3 h-3" /> ISO 8601
                    </span>
                    <button onClick={() => copyToClipboard(results.iso)} className="opacity-0 group-hover:opacity-100 transition-opacity text-nexus-accent hover:text-white">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3 bg-slate-950/50 border border-white/5 rounded-lg font-mono text-xs text-slate-300 break-all">
                    {results.iso}
                  </div>
                </div>

                <div className="group relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Locale String
                    </span>
                    <button onClick={() => copyToClipboard(results.locale)} className="opacity-0 group-hover:opacity-100 transition-opacity text-nexus-accent hover:text-white">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3 bg-slate-950/50 border border-white/5 rounded-lg font-mono text-xs text-slate-300 break-all">
                    {results.locale}
                  </div>
                </div>

                <div className="group relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      <Globe className="w-3 h-3" /> UTC String
                    </span>
                    <button onClick={() => copyToClipboard(results.utc)} className="opacity-0 group-hover:opacity-100 transition-opacity text-nexus-accent hover:text-white">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3 bg-slate-950/50 border border-white/5 rounded-lg font-mono text-xs text-slate-300 break-all">
                    {results.utc}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-40 flex items-center justify-center text-slate-600 italic text-sm border border-white/5 rounded-xl border-dashed">
                Enter a date or timestamp to format...
              </div>
            )}
          </div>
        </div>
      </div>

      <ToolHistory toolId="datetime-formatter" />
    </div>
  );
};

export default DateTimeFormatter;
