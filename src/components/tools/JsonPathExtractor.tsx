import React, { useState } from 'react';
import { Search, Copy, ArrowRightCircle, AlertCircle } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';
import { JSONPath } from 'jsonpath-plus';

const JsonPathExtractor: React.FC = () => {
  const [json, setJson] = useState('');
  const [path, setPath] = useState('$.store.book[*].author');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'jsonpath',
    (values: any) => {
      if (values.json !== undefined) setJson(values.json);
      if (values.path !== undefined) setPath(values.path);
    },
    () => ({ json, path })
  );

  const handleExtract = () => {
    if (!json.trim()) return;
    setError(null);
    try {
      const parsed = JSON.parse(json);
      const result = JSONPath({ path, json: parsed });
      setOutput(JSON.stringify(result, null, 2));
      recordAction();
    } catch (err: any) {
      setError(err.message || 'Extraction failed. Check your JSON or Path syntax.');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <Search className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">JSONPath Extractor</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Data Query</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">JSONPath Expression</label>
            <div className="flex gap-3">
               <input
                 type="text"
                 className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-5 py-4 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all text-white shadow-inner"
                 placeholder="$.store.book[*].author"
                 value={path}
                 onChange={(e) => setPath(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
               />
               <button
                 onClick={handleExtract}
                 className="bg-nexus-accent text-slate-900 font-bold px-8 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-nexus-accent/20 flex items-center gap-2"
               >
                 <ArrowRightCircle className="w-4 h-4" /> Extract
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Input JSON</label>
              <textarea
                className="w-full h-96 bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-xs focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner text-slate-300 custom-scrollbar"
                placeholder='{ "store": { "book": [ { "author": "Nigel Rees" } ] } }'
                value={json}
                onChange={(e) => setJson(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Query Result</label>
                {output && (
                  <button
                    onClick={() => navigator.clipboard.writeText(output)}
                    className="text-[10px] font-bold text-nexus-accent uppercase tracking-widest flex items-center gap-1.5"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                )}
              </div>
              <pre className={`w-full h-96 bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-xs overflow-auto custom-scrollbar shadow-inner ${error ? 'text-red-400' : 'text-slate-300'}`}>
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

        <ToolHistory toolId="jsonpath" />
      </div>
    </div>
  );
};

export default JsonPathExtractor;
