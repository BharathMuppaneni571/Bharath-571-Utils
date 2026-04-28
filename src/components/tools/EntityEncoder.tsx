import React, { useState } from 'react';
import { Copy, Trash2, CodeXml } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const EntityEncoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const { recordAction } = useToolState(
    'entity',
    (values: any) => {
      if (values.input !== undefined) setInput(values.input);
      if (values.output !== undefined) setOutput(values.output);
    },
    () => ({ input, output })
  );

  const encodeHtml = () => {
    if (!input) return;
    const encoded = input.replace(/[\u00A0-\u9999<>&]/g, (i) => '&#' + i.charCodeAt(0) + ';');
    setOutput(encoded);
    recordAction();
  };

  const decodeHtml = () => {
    if (!input) return;
    const decoded = input.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n));
    setOutput(decoded);
    recordAction();
  };

  const encodeUrl = () => {
    if (!input) return;
    setOutput(encodeURIComponent(input));
    recordAction();
  };

  const decodeUrl = () => {
    if (!input) return;
    try {
      setOutput(decodeURIComponent(input));
      recordAction();
    } catch {
      setOutput('Invalid URL encoding');
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
  };

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CodeXml className="w-8 h-8 text-nexus-accent" />
        <h2 className="text-2xl font-bold glow-text">Entity Encoder / Decoder</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Input Text</label>
          <textarea
            className="w-full h-80 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors resize-none"
            placeholder="Enter text to encode/decode..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={encodeHtml}
              className="bg-nexus-accent/10 hover:bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/20 py-2 rounded-lg transition-all text-xs font-bold"
            >
              HTML Encode
            </button>
            <button
              onClick={decodeHtml}
              className="bg-nexus-accent/10 hover:bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/20 py-2 rounded-lg transition-all text-xs font-bold"
            >
              HTML Decode
            </button>
            <button
              onClick={encodeUrl}
              className="bg-nexus-violet/10 hover:bg-nexus-violet/20 text-nexus-violet border border-nexus-violet/20 py-2 rounded-lg transition-all text-xs font-bold"
            >
              URL Encode
            </button>
            <button
              onClick={decodeUrl}
              className="bg-nexus-violet/10 hover:bg-nexus-violet/20 text-nexus-violet border border-nexus-violet/20 py-2 rounded-lg transition-all text-xs font-bold"
            >
              URL Decode
            </button>
          </div>
          <button
            onClick={clearAll}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all text-xs font-bold"
          >
            <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Clear
          </button>
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
            <div className="w-full h-80 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm overflow-auto break-all text-slate-300">
              {output || 'Result will appear here...'}
            </div>
          </div>
        </div>
      </div>

      <ToolHistory toolId="entity" />
    </div>
  );
};

export default EntityEncoder;
