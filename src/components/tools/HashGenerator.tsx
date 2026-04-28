import React, { useState } from 'react';
import { Copy, Hash, Zap } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const HashGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [output, setOutput] = useState('');

  const { recordAction } = useToolState(
    'hash',
    (values: any) => {
      if (values.input !== undefined) setInput(values.input);
      if (values.algorithm !== undefined) setAlgorithm(values.algorithm);
      if (values.output !== undefined) setOutput(values.output);
    },
    () => ({ input, algorithm, output })
  );

  const calculateHash = async () => {
    if (!input) return;
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setOutput(hashHex);
      recordAction();
    } catch (err) {
      console.error('Hash calculation failed', err);
      setOutput('Error: Could not calculate hash');
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

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Hash className="w-8 h-8 text-nexus-accent" />
        <h2 className="text-2xl font-bold glow-text">Hash Generator</h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-end">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Input Text</label>
            <textarea
              className="w-full h-32 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors resize-none"
              placeholder="Enter text to hash..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-4 min-w-[200px]">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Algorithm</label>
              <select
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-nexus-accent/50"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                <option value="SHA-1">SHA-1</option>
                <option value="SHA-256">SHA-256</option>
                <option value="SHA-384">SHA-384</option>
                <option value="SHA-512">SHA-512</option>
              </select>
            </div>
            <button
              onClick={calculateHash}
              className="w-full bg-nexus-accent/20 hover:bg-nexus-accent/30 text-nexus-accent border border-nexus-accent/30 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold"
            >
              <Zap className="w-4 h-4" /> Calculate
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Generated Hash</label>
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
            <div className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm break-all text-nexus-accent shadow-inner min-h-[60px]">
              {output || 'Hash will appear here...'}
            </div>
          </div>
        </div>
      </div>

      <ToolHistory toolId="hash" />
    </div>
  );
};

export default HashGenerator;
