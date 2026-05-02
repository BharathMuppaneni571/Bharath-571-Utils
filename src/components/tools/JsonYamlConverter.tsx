import React, { useState } from 'react';
import { FileCode, Copy, Trash2, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';
import jsyaml from 'js-yaml';

const JsonYamlConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'json2yaml' | 'yaml2json'>('json2yaml');

  const { recordAction } = useToolState(
    'jsonyaml',
    (values: any) => {
      if (values.input !== undefined) setInput(values.input);
      if (values.output !== undefined) setOutput(values.output);
      if (values.mode !== undefined) setMode(values.mode);
    },
    () => ({ input, output, mode })
  );

  const convert = () => {
    if (!input.trim()) return;
    setError(null);
    try {
      if (mode === 'json2yaml') {
        const obj = JSON.parse(input);
        const yaml = jsyaml.dump(obj);
        setOutput(yaml);
      } else {
        const obj = jsyaml.load(input);
        const json = JSON.stringify(obj, null, 2);
        setOutput(json);
      }
      recordAction();
    } catch (err: any) {
      setError(err.message || 'Conversion failed. Check your input format.');
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

  const toggleMode = () => {
    setMode(mode === 'json2yaml' ? 'yaml2json' : 'json2yaml');
    setInput(output);
    setOutput('');
    setError(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
              <FileCode className="w-6 h-6 text-nexus-accent" />
            </div>
            <div>
              <h2 className="text-3xl font-bold glow-text tracking-tight">JSON ↔ YAML</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Data Bridge</p>
            </div>
          </div>
          <button
            onClick={toggleMode}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-slate-300 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            {mode === 'json2yaml' ? 'JSON to YAML' : 'YAML to JSON'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              {mode === 'json2yaml' ? 'Input JSON' : 'Input YAML'}
            </label>
            <textarea
              className="w-full h-[450px] bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner text-slate-300"
              placeholder={mode === 'json2yaml' ? 'Paste JSON here...' : 'Paste YAML here...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={convert}
                className="flex-1 bg-nexus-accent text-slate-900 font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-nexus-accent/20"
              >
                Convert Now
              </button>
              <button
                onClick={() => { setInput(''); setOutput(''); setError(null); }}
                className="px-5 py-3.5 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-white/5 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                {mode === 'json2yaml' ? 'Output YAML' : 'Output JSON'}
              </label>
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="text-[10px] font-bold flex items-center gap-1.5 text-nexus-accent hover:text-white transition-all uppercase tracking-widest px-3 py-1 bg-nexus-accent/10 rounded-full"
                >
                  <Copy className="w-3 h-3" /> Copy Result
                </button>
              )}
            </div>
            <div className="relative h-[450px]">
              <pre className={`w-full h-full bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-xs overflow-auto custom-scrollbar shadow-inner ${error ? 'text-red-400' : 'text-slate-300'}`}>
                {error ? (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : output || 'Result will appear here...'}
              </pre>
            </div>
          </div>
        </div>

        <ToolHistory toolId="jsonyaml" />
      </div>
    </div>
  );
};

export default JsonYamlConverter;
