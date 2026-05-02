import React, { useState, useEffect } from 'react';
import { Clock, Copy, Trash2, ArrowRightLeft, Timer } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const EpochConverter: React.FC = () => {
  const [epoch, setEpoch] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [result, setResult] = useState<any>(null);
  const [currentEpoch, setCurrentEpoch] = useState(Math.floor(Date.now() / 1000));

  const { recordAction } = useToolState(
    'epoch',
    (values: any) => {
      if (values.epoch !== undefined) setEpoch(values.epoch);
      if (values.dateStr !== undefined) setDateStr(values.dateStr);
    },
    () => ({ epoch, dateStr })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const convertEpoch = () => {
    if (!epoch) return;
    try {
      let num = parseInt(epoch);
      // Check if milliseconds (13 digits) or seconds (10 digits)
      if (epoch.length <= 10) num *= 1000;
      
      const d = new Date(num);
      if (isNaN(d.getTime())) throw new Error('Invalid Date');
      
      setResult({
        local: d.toString(),
        iso: d.toISOString(),
        relative: getRelativeTime(d)
      });
      recordAction();
    } catch (e) {
      setResult({ error: 'Invalid Unix Timestamp' });
    }
  };

  const convertDate = () => {
    if (!dateStr) return;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) throw new Error('Invalid Date');
      
      const seconds = Math.floor(d.getTime() / 1000);
      setResult({
        seconds,
        milliseconds: d.getTime(),
        iso: d.toISOString()
      });
      recordAction();
    } catch (e) {
      setResult({ error: 'Invalid Date Format' });
    }
  };

  const getRelativeTime = (date: Date) => {
    const diff = date.getTime() - Date.now();
    const absDiff = Math.abs(diff);
    const units: { [key: string]: number } = {
      year: 31536000000,
      month: 2592000000,
      day: 86400000,
      hour: 3600000,
      minute: 60000,
      second: 1000
    };

    for (const unit in units) {
      if (absDiff > units[unit]) {
        const value = Math.floor(absDiff / units[unit]);
        return `${value} ${unit}${value > 1 ? 's' : ''} ${diff > 0 ? 'from now' : 'ago'}`;
      }
    }
    return 'just now';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
              <Timer className="w-6 h-6 text-nexus-accent" />
            </div>
            <div>
              <h2 className="text-3xl font-bold glow-text tracking-tight">Epoch Converter</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Time Engine</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-950/40 border border-white/5 px-4 py-2 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-nexus-accent" />
            <span className="text-xs font-mono text-slate-300">Unix: {currentEpoch}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Epoch to Date */}
            <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unix Timestamp to Date</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all text-white"
                  placeholder="e.g. 1714665600"
                  value={epoch}
                  onChange={(e) => setEpoch(e.target.value)}
                />
                <button
                  onClick={convertEpoch}
                  className="bg-nexus-accent text-slate-900 font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-all"
                >
                  Convert
                </button>
              </div>
            </div>

            {/* Date to Epoch */}
            <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Human Date to Unix</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all text-white"
                  placeholder="e.g. 2026-05-02 12:00:00"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                />
                <button
                  onClick={convertDate}
                  className="bg-nexus-violet text-white font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-all"
                >
                  Convert
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center px-2">
               <button 
                onClick={() => setEpoch(currentEpoch.toString())}
                className="text-xs text-slate-500 hover:text-nexus-accent transition-colors underline"
               >
                 Insert current timestamp
               </button>
               <button 
                onClick={() => { setEpoch(''); setDateStr(''); setResult(null); }}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
               >
                 <Trash2 className="w-3 h-3" /> Clear
               </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Conversion Results</label>
            <div className="glass bg-slate-950/30 rounded-3xl border border-white/5 p-6 min-h-[300px] flex flex-col justify-center">
              {result ? (
                result.error ? (
                  <div className="text-center">
                    <p className="text-red-400 font-bold">{result.error}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {result.seconds !== undefined ? (
                      <div className="space-y-4">
                        <ResultRow label="Unix Seconds" value={result.seconds.toString()} onCopy={copyToClipboard} />
                        <ResultRow label="Milliseconds" value={result.milliseconds.toString()} onCopy={copyToClipboard} />
                        <ResultRow label="ISO 8601" value={result.iso} onCopy={copyToClipboard} />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ResultRow label="Local Time" value={result.local} onCopy={copyToClipboard} />
                        <ResultRow label="ISO 8601" value={result.iso} onCopy={copyToClipboard} />
                        <ResultRow label="Relative" value={result.relative} onCopy={copyToClipboard} />
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="text-center space-y-4 px-10">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                    <ArrowRightLeft className="w-8 h-8 text-slate-700" />
                  </div>
                  <p className="text-slate-600 text-sm">Enter a timestamp or date to see the results.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <ToolHistory toolId="epoch" />
      </div>
    </div>
  );
};

const ResultRow: React.FC<{ label: string, value: string, onCopy: (v: string) => void }> = ({ label, value, onCopy }) => (
  <div className="space-y-1.5 group">
    <div className="flex justify-between items-center px-1">
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      <button 
        onClick={() => onCopy(value)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-nexus-accent"
      >
        <Copy className="w-3 h-3" />
      </button>
    </div>
    <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 font-mono text-xs text-slate-300 break-all select-all">
      {value}
    </div>
  </div>
);

export default EpochConverter;
