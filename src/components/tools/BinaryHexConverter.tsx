import React, { useState } from 'react';
import { Binary, Copy, ArrowRightLeft } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const BinaryHexConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'bin2hex' | 'hex2bin'>('bin2hex');

  const { recordAction } = useToolState(
    'binhex',
    (values: any) => {
      if (values.input !== undefined) setInput(values.input);
      if (values.output !== undefined) setOutput(values.output);
      if (values.mode !== undefined) setMode(values.mode);
    },
    () => ({ input, output, mode })
  );

  const handleConvert = () => {
    if (!input.trim()) return;
    try {
      if (mode === 'bin2hex') {
        // Binary to Hex
        const binary = input.replace(/[^01]/g, '');
        let hex = '';
        for (let i = 0; i < binary.length; i += 4) {
          const chunk = binary.substr(i, 4).padEnd(4, '0');
          hex += parseInt(chunk, 2).toString(16).toUpperCase();
        }
        setOutput(hex);
      } else {
        // Hex to Binary
        const hex = input.replace(/[^0-9A-Fa-f]/g, '');
        let bin = '';
        for (let i = 0; i < hex.length; i++) {
          bin += parseInt(hex[i], 16).toString(2).padStart(4, '0');
        }
        setOutput(bin);
      }
      recordAction();
    } catch (err) {
      setOutput('Conversion error');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
              <Binary className="w-6 h-6 text-nexus-accent" />
            </div>
            <div>
              <h2 className="text-3xl font-bold glow-text tracking-tight">Binary ↔ Hex</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Base Engine</p>
            </div>
          </div>
          <button
            onClick={() => setMode(mode === 'bin2hex' ? 'hex2bin' : 'bin2hex')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-slate-300 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            {mode === 'bin2hex' ? 'Bin to Hex' : 'Hex to Bin'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Input {mode === 'bin2hex' ? 'Binary' : 'Hex'}</label>
            <textarea
              className="w-full h-32 bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner text-slate-300"
              placeholder={mode === 'bin2hex' ? 'e.g. 10101010' : 'e.g. AA'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <button
            onClick={handleConvert}
            className="w-full py-4 bg-nexus-accent text-slate-900 font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            Convert Data
          </button>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Output {mode === 'bin2hex' ? 'Hex' : 'Binary'}</label>
              {output && (
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="text-[10px] font-bold text-nexus-accent uppercase tracking-widest"
                >
                  <Copy className="w-3 h-3 inline mr-1" /> Copy
                </button>
              )}
            </div>
            <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-sm break-all text-nexus-accent min-h-[80px]">
              {output || 'Result will appear here...'}
            </div>
          </div>
        </div>

        <ToolHistory toolId="binhex" />
      </div>
    </div>
  );
};

export default BinaryHexConverter;
