import React, { useState } from 'react';
import { Copy, Trash2, Shield, Lock, Unlock } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const Base64Converter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'base64',
    (values: any) => {
      if (values.input !== undefined) setInput(values.input);
      if (values.output !== undefined) setOutput(values.output);
    },
    () => ({ input, output })
  );

  const encodeBase64 = () => {
    try {
      if (!input) return;
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
      setError(null);
      recordAction();
    } catch (err: any) {
      setError('Encoding error: ' + err.message);
      setOutput('');
    }
  };

  const decodeBase64 = () => {
    try {
      if (!input) return;
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
      setError(null);
      recordAction();
    } catch (err: any) {
      setError('Invalid Base64 string');
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
    <div className="glass p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-nexus-accent" />
        <h2 className="text-2xl font-bold glow-text">Base64 Converter</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Input Text / Base64</label>
          <textarea
            className="w-full h-80 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors resize-none"
            placeholder="Enter text to encode or Base64 to decode..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={encodeBase64}
              className="flex-1 bg-nexus-accent/20 hover:bg-nexus-accent/30 text-nexus-accent border border-nexus-accent/30 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Encode
            </button>
            <button
              onClick={decodeBase64}
              className="flex-1 bg-nexus-violet/20 hover:bg-nexus-violet/30 text-nexus-violet border border-nexus-violet/30 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" /> Decode
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Result</label>
            {output && (
              <button
                onClick={copyToClipboard}
                className="text-xs flex items-center gap-1.5 text-nexus-accent hover:text-nexus-accent/80 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Result
              </button>
            )}
          </div>
          <div className="relative">
            <div className={`w-full h-80 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm overflow-auto break-all ${error ? 'text-red-400' : 'text-slate-300'}`}>
              {error || output || 'Result will appear here...'}
            </div>
          </div>
        </div>
      </div>

      <ToolHistory toolId="base64" />
    </div>
  );
};

export default Base64Converter;
