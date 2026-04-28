import React, { useState } from 'react';
import { Copy, Trash2, FileJson, Minimize2, Maximize2 } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'json',
    (values: any) => {
      if (values.input !== undefined) setInput(values.input);
      if (values.output !== undefined) setOutput(values.output);
    },
    () => ({ input, output })
  );

  const formatJson = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      const result = JSON.stringify(parsed, null, 4);
      setOutput(result);
      setError(null);
      recordAction();
    } catch (err: any) {
      setError('Invalid JSON: ' + err.message);
      setOutput('');
    }
  };

  const minifyJson = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      const result = JSON.stringify(parsed);
      setOutput(result);
      setError(null);
      recordAction();
    } catch (err: any) {
      setError('Invalid JSON: ' + err.message);
      setOutput('');
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <FileJson className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">JSON Formatter</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Utility</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Input JSON</label>
            <textarea
              className="w-full h-96 bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner"
              placeholder="Paste your JSON here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={formatJson}
                className="flex-1 bg-nexus-accent text-slate-900 font-bold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-nexus-accent/20 flex items-center justify-center gap-2"
              >
                <Maximize2 className="w-4 h-4" /> Format
              </button>
              <button
                onClick={minifyJson}
                className="flex-1 bg-nexus-violet text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-nexus-violet/20 flex items-center justify-center gap-2"
              >
                <Minimize2 className="w-4 h-4" /> Minify
              </button>
              <button
                onClick={clearAll}
                className="px-5 py-3 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-white/5 transition-all"
                title="Clear"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Output</label>
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="text-[10px] font-bold flex items-center gap-1.5 text-nexus-accent hover:text-white transition-all uppercase tracking-widest px-3 py-1 bg-nexus-accent/10 rounded-full"
                >
                  <Copy className="w-3 h-3" /> Copy Result
                </button>
              )}
            </div>
            <div className="relative group">
              <pre className={`w-full h-96 bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-xs overflow-auto custom-scrollbar shadow-inner ${error ? 'text-red-400' : 'text-slate-300'}`}>
                {error || output || 'Formatted output will appear here...'}
              </pre>
            </div>
          </div>
        </div>

        <ToolHistory toolId="json" />
      </div>
    </div>
  );
};

export default JsonFormatter;
