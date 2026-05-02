import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, FlaskConical } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'regex',
    (values: any) => {
      if (values.pattern !== undefined) setPattern(values.pattern);
      if (values.flags !== undefined) setFlags(values.flags);
      if (values.testText !== undefined) setTestText(values.testText);
    },
    () => ({ pattern, flags, testText })
  );

  useEffect(() => {
    testRegex();
  }, [pattern, flags, testText]);

  const testRegex = () => {
    if (!pattern) {
      setMatches([]);
      setError(null);
      return;
    }

    try {
      const re = new RegExp(pattern, flags);
      const allMatches = [...testText.matchAll(re)];
      setMatches(allMatches);
      setError(null);
      if (pattern && testText) recordAction();
    } catch (err: any) {
      setError(err.message);
      setMatches([]);
    }
  };

  const getHighlightedText = () => {
    if (!pattern || error || matches.length === 0) return testText;

    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      const parts = testText.split(re);
      const findMatches = [...testText.matchAll(re)];
      
      return (
        <span>
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {findMatches[i] && (
                <mark className="bg-nexus-accent/40 text-white rounded-sm px-0.5 border-b border-nexus-accent">
                  {findMatches[i][0]}
                </mark>
              )}
            </React.Fragment>
          ))}
        </span>
      );
    } catch (e) {
      return testText;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">RegEx Tester</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Pattern Lab</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Regular Expression</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono">/</span>
                  <input
                    type="text"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-8 pr-12 py-3 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all text-white"
                    placeholder="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono">/</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Flags</label>
                <input
                  type="text"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all text-white"
                  placeholder="gim"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-400 text-xs font-mono">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Test String</label>
              <textarea
                className="w-full h-48 bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner text-slate-300"
                placeholder="Paste text to test your regex against..."
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Match Result Highlight</label>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-slate-500">{matches.length} matches found</span>
                   {matches.length > 0 && <CheckCircle2 className="w-3 h-3 text-nexus-accent" />}
                </div>
              </div>
              <div className="w-full min-h-[100px] bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-sm overflow-auto custom-scrollbar text-slate-400 leading-relaxed">
                {getHighlightedText()}
              </div>
            </div>

            {matches.length > 0 && (
              <div className="space-y-4">
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Match Details</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   {matches.slice(0, 12).map((match, i) => (
                     <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Match #{i + 1} at index {match.index}</span>
                        <code className="text-nexus-accent text-sm truncate">{match[0]}</code>
                     </div>
                   ))}
                   {matches.length > 12 && (
                     <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-center">
                        <span className="text-[9px] text-slate-500 italic">...and {matches.length - 12} more</span>
                     </div>
                   )}
                 </div>
              </div>
            )}
          </div>
        </div>

        <ToolHistory toolId="regex" />
      </div>
    </div>
  );
};

export default RegexTester;
