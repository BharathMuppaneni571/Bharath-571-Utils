import React, { useState } from 'react';
import { Link, Copy, Trash2, Lock, Unlock } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const UrlEncoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'url-encoder',
    (values: any) => {
      if (values.input !== undefined) setInput(values.input);
      if (values.output !== undefined) setOutput(values.output);
    },
    () => ({ input, output })
  );

  const encodeUrl = () => {
    try {
      if (!input) return;
      setOutput(encodeURIComponent(input));
      setError(null);
      recordAction();
    } catch (err: any) {
      setError('Encoding error: ' + err.message);
    }
  };

  const decodeUrl = () => {
    try {
      if (!input) return;
      setOutput(decodeURIComponent(input));
      setError(null);
      recordAction();
    } catch (err: any) {
      setError('Invalid URL encoding');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <Link className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">URL Encoder / Decoder</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Web Engine</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Input Text</label>
              <textarea
                className="w-full h-80 bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner text-slate-300"
                placeholder="Enter URL or text to encode/decode..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={encodeUrl}
                className="flex-1 py-4 bg-nexus-accent text-slate-900 font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-nexus-accent/20"
              >
                <Lock className="w-4 h-4" /> Encode
              </button>
              <button
                onClick={decodeUrl}
                className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" /> Decode
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Result</label>
              {output && (
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="text-[10px] font-bold text-nexus-accent uppercase tracking-widest flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              )}
            </div>
            <div className={`w-full h-80 bg-slate-950/30 border border-white/10 rounded-2xl p-6 overflow-auto custom-scrollbar shadow-inner ${error ? 'text-red-400' : 'text-slate-300'}`}>
               {error ? (
                 <p className="font-mono text-sm">{error}</p>
               ) : (
                 <pre className="whitespace-pre-wrap font-mono text-sm">{output || 'Result will appear here...'}</pre>
               )}
            </div>
            <button
              onClick={() => { setInput(''); setOutput(''); setError(null); }}
              className="w-full py-3 text-slate-500 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
        </div>

        <ToolHistory toolId="url-encoder" />
      </div>
    </div>
  );
};

export default UrlEncoder;
