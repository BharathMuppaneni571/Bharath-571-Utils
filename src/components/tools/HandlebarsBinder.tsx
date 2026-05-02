import React, { useState } from 'react';
import { View, Copy, Play, AlertCircle } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';
import Handlebars from 'handlebars';

const HandlebarsBinder: React.FC = () => {
  const [template, setTemplate] = useState('Hello {{name}}! Welcome to {{platform}}.');
  const [data, setData] = useState('{\n  "name": "Developer",\n  "platform": "Nexus-571"\n}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'handlebars',
    (values: any) => {
      if (values.template !== undefined) setTemplate(values.template);
      if (values.data !== undefined) setData(values.data);
    },
    () => ({ template, data })
  );

  const handleBind = () => {
    if (!template.trim()) return;
    setError(null);
    try {
      const parsedData = JSON.parse(data);
      const compile = Handlebars.compile(template);
      const result = compile(parsedData);
      setOutput(result);
      recordAction();
    } catch (err: any) {
      setError(err.message || 'Binding failed. Check your Template or JSON data.');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <View className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">Handlebars Binder</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Templating</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Handlebars Template</label>
              <textarea
                className="w-full h-48 bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner text-slate-300"
                placeholder="<h1>{{title}}</h1>"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">JSON Data</label>
              <textarea
                className="w-full h-48 bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner text-slate-300"
                placeholder='{ "title": "Hello World" }'
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
            <button
              onClick={handleBind}
              className="w-full py-4 bg-nexus-accent text-slate-900 font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-nexus-accent/20"
            >
              <Play className="w-4 h-4 fill-current" /> Compile & Bind
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rendered Output</label>
              {output && (
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="text-[10px] font-bold text-nexus-accent uppercase tracking-widest"
                >
                  <Copy className="w-3 h-3 inline mr-1" /> Copy
                </button>
              )}
            </div>
            <div className={`w-full h-full min-h-[450px] bg-white/5 border border-white/10 rounded-2xl p-6 overflow-auto custom-scrollbar shadow-inner ${error ? 'text-red-400' : 'text-slate-300'}`}>
               {error ? (
                 <div className="flex items-start gap-2">
                   <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                   <span>{error}</span>
                 </div>
               ) : (
                 <pre className="whitespace-pre-wrap font-mono text-sm">{output || 'Rendered result will appear here...'}</pre>
               )}
            </div>
          </div>
        </div>

        <ToolHistory toolId="handlebars" />
      </div>
    </div>
  );
};

export default HandlebarsBinder;
