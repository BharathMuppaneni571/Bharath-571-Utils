import React, { useState, useEffect } from 'react';
import { Copy, Clock, Settings, Info } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const CronGenerator: React.FC = () => {
  const [min, setMin] = useState('0');
  const [hour, setHour] = useState('12');
  const [dom, setDom] = useState('*');
  const [month, setMonth] = useState('*');
  const [dow, setDow] = useState('*');
  const [cron, setCron] = useState('0 12 * * *');
  const [translation, setTranslation] = useState('At 12:00 PM');

  const { recordAction } = useToolState(
    'cron-generator',
    (values: any) => {
      if (values.min !== undefined) setMin(values.min);
      if (values.hour !== undefined) setHour(values.hour);
      if (values.dom !== undefined) setDom(values.dom);
      if (values.month !== undefined) setMonth(values.month);
      if (values.dow !== undefined) setDow(values.dow);
      if (values.cron !== undefined) setCron(values.cron);
      if (values.translation !== undefined) setTranslation(values.translation);
    },
    () => ({ min, hour, dom, month, dow, cron, translation })
  );

  const generateCron = () => {
    const expr = `${min || '*'} ${hour || '*'} ${dom || '*'} ${month || '*'} ${dow || '*'}`;
    setCron(expr);
    translateCron(expr);
  };

  const translateCron = (expr: string) => {
    // Basic translation logic for common cases
    try {
      const parts = expr.split(' ');
      if (parts.length !== 5) return setTranslation('Invalid expression');

      const [m, h, d, mo, dw] = parts;
      let text = 'At ';

      // Time
      if (m === '*' && h === '*') {
        text = 'Every minute';
      } else if (m.includes('/') && h === '*') {
        text = `Every ${m.split('/')[1]} minutes`;
      } else if (!isNaN(m as any) && !isNaN(h as any)) {
        const hh = parseInt(h);
        const mm = parseInt(m);
        const ampm = hh >= 12 ? 'PM' : 'AM';
        const displayH = hh % 12 === 0 ? 12 : hh % 12;
        const displayM = mm.toString().padStart(2, '0');
        text = `At ${displayH}:${displayM} ${ampm}`;
      } else {
        text = `At minute ${m} of hour ${h}`;
      }

      // Day of month
      if (d !== '*') {
        text += `, on day ${d} of the month`;
      }

      // Month
      if (mo !== '*') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        if (!isNaN(mo as any)) {
          text += `, in ${months[parseInt(mo) - 1]}`;
        } else {
          text += `, in month ${mo}`;
        }
      }

      // Day of week
      if (dw !== '*') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        if (!isNaN(dw as any)) {
          text += `, only on ${days[parseInt(dw)]}`;
        } else {
          text += `, only on ${dw}`;
        }
      }

      setTranslation(text);
    } catch {
      setTranslation('Expression is too complex for basic translation');
    }
  };

  useEffect(() => {
    generateCron();
  }, [min, hour, dom, month, dow]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cron);
      recordAction();
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-8 h-8 text-nexus-accent" />
        <h2 className="text-2xl font-bold glow-text">Cron Expression Generator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Minute</label>
          <input
            type="text"
            className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-3 text-center font-mono text-nexus-accent focus:outline-none focus:border-nexus-accent/50"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="*"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Hour</label>
          <input
            type="text"
            className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-3 text-center font-mono text-nexus-accent focus:outline-none focus:border-nexus-accent/50"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            placeholder="*"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Day (Month)</label>
          <input
            type="text"
            className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-3 text-center font-mono text-nexus-accent focus:outline-none focus:border-nexus-accent/50"
            value={dom}
            onChange={(e) => setDom(e.target.value)}
            placeholder="*"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Month</label>
          <input
            type="text"
            className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-3 text-center font-mono text-nexus-accent focus:outline-none focus:border-nexus-accent/50"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="*"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Day (Week)</label>
          <input
            type="text"
            className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-3 text-center font-mono text-nexus-accent focus:outline-none focus:border-nexus-accent/50"
            value={dow}
            onChange={(e) => setDow(e.target.value)}
            placeholder="*"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Compiled Expression</label>
            <button
              onClick={copyToClipboard}
              className="text-xs flex items-center gap-1.5 text-nexus-accent hover:text-nexus-accent/80 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </div>
          <div className="p-6 bg-slate-950/50 border border-white/10 rounded-xl font-mono text-2xl text-center text-nexus-accent tracking-widest">
            {cron}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Human Readable</label>
          <div className="p-6 bg-slate-900/50 border border-nexus-accent/20 rounded-xl flex items-center gap-4">
            <Info className="w-6 h-6 text-nexus-accent shrink-0" />
            <div className="text-slate-200 font-medium">
              {translation}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-slate-950/30 border border-white/5 rounded-xl">
         <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <Settings className="w-3 h-3" /> Quick Examples
         </h4>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: 'Every Minute', val: '* * * * *' },
              { label: 'Every 5 Min', val: '*/5 * * * *' },
              { label: 'Every Hour', val: '0 * * * *' },
              { label: 'Daily at Mid', val: '0 0 * * *' },
              { label: 'Daily at Noon', val: '0 12 * * *' },
              { label: 'Weekly (Sun)', val: '0 0 * * 0' },
              { label: 'Monthly (1st)', val: '0 0 1 * *' },
              { label: 'Weekday Morn', val: '0 9 * * 1-5' },
            ].map((ex) => (
              <button
                key={ex.label}
                onClick={() => {
                  const p = ex.val.split(' ');
                  setMin(p[0]); setHour(p[1]); setDom(p[2]); setMonth(p[3]); setDow(p[4]);
                  recordAction();
                }}
                className="text-[10px] bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 py-2 px-3 rounded-lg transition-colors text-left"
              >
                {ex.label}
              </button>
            ))}
         </div>
      </div>

      <ToolHistory toolId="cron-generator" />
    </div>
  );
};

export default CronGenerator;
