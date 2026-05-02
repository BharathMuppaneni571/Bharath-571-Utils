import React, { useState } from 'react';
import { CodeXml, Copy, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';
import xmljs from 'xml-js';

const XmlJsonConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'xml2json' | 'json2xml'>('xml2json');

  const { recordAction } = useToolState(
    'xmljson',
    (values: any) => {
      if (values.input !== undefined) setInput(values.input);
      if (values.output !== undefined) setOutput(values.output);
      if (values.mode !== undefined) setMode(values.mode);
    },
    () => ({ input, output, mode })
  );

  const handleConvert = () => {
    if (!input.trim()) return;
    setError(null);
    try {
      if (mode === 'xml2json') {
        const result = xmljs.xml2json(input, { compact: true, spaces: 4 });
        setOutput(result);
      } else {
        const result = xmljs.json2xml(input, { compact: true, spaces: 4 });
        setOutput(result);
      }
      recordAction();
    } catch (err: any) {
      setError(err.message || 'Conversion failed. Check your input format.');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
              <CodeXml className="w-6 h-6 text-nexus-accent" />
            </div>
            <div>
              <h2 className="text-3xl font-bold glow-text tracking-tight">XML ↔ JSON</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Data Bridge</p>
            </div>
          </div>
          <button
            onClick={() => setMode(mode === 'xml2json' ? 'json2xml' : 'xml2json')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-slate-300 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            {mode === 'xml2json' ? 'XML to JSON' : 'JSON to XML'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              {mode === 'xml2json' ? 'Input XML' : 'Input JSON'}
            </label>
            <textarea
              className="w-full h-[450px] bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner text-slate-300"
              placeholder={mode === 'xml2json' ? '<root><item>Value</item></root>' : '{"root": {"item": "Value"}}'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              onClick={handleConvert}
              className="w-full bg-nexus-accent text-slate-900 font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-nexus-accent/20"
            >
              Convert Now
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Result</label>
              {output && (
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="text-[10px] font-bold text-nexus-accent uppercase tracking-widest"
                >
                  <Copy className="w-3 h-3 inline mr-1" /> Copy
                </button>
              )}
            </div>
            <pre className={`w-full h-[450px] bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-xs overflow-auto custom-scrollbar shadow-inner ${error ? 'text-red-400' : 'text-slate-300'}`}>
              {error ? (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : output || 'Result will appear here...'}
            </pre>
          </div>
        </div>

        <ToolHistory toolId="xmljson" />
      </div>
    </div>
  );
};

export default XmlJsonConverter;
