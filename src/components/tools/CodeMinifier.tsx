import React, { useState } from 'react';
import { Minimize2, Copy, Zap } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const CodeMinifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [type, setType] = useState<'js' | 'css' | 'html'>('js');

  const { recordAction } = useToolState(
    'minify',
    (values: any) => {
      if (values.input !== undefined) setInput(values.input);
      if (values.output !== undefined) setOutput(values.output);
    },
    () => ({ input, output })
  );

  const handleMinify = () => {
    if (!input.trim()) return;
    let result = '';
    
    if (type === 'js' || type === 'css') {
      // Basic regex minification
      result = input
        .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/ ?([\{\}\(\);:,]) ?/g, '$1') // Remove spaces around delimiters
        .trim();
    } else {
      // Basic HTML minification
      result = input
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
        .replace(/>\s+</g, '><') // Remove space between tags
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();
    }
    
    setOutput(result);
    recordAction();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <Minimize2 className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">Code Minifier</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Performance Tool</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Language Type</label>
              <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5">
                {(['js', 'css', 'html'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all uppercase ${type === t ? 'bg-nexus-accent text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="w-full h-80 bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner text-slate-300"
              placeholder="Paste code to minify..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button
              onClick={handleMinify}
              className="w-full py-4 bg-nexus-accent text-slate-900 font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              Minify Code
            </button>
          </div>

          <div className="space-y-4 flex flex-col">
            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Output</label>
              {output && (
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="text-[10px] font-bold text-nexus-accent uppercase tracking-widest px-3 py-1 bg-nexus-accent/10 rounded-full"
                >
                  <Copy className="w-3 h-3 inline mr-1" /> Copy
                </button>
              )}
            </div>
            <pre className="flex-1 w-full h-[400px] bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-xs overflow-auto custom-scrollbar shadow-inner text-slate-400 break-all whitespace-pre-wrap">
              {output || 'Minified output will appear here...'}
            </pre>
          </div>
        </div>

        <ToolHistory toolId="minify" />
      </div>
    </div>
  );
};

export default CodeMinifier;
