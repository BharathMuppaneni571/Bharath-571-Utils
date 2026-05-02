import React, { useState } from 'react';
import { Info, Copy, FileCode } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const MIME_DB: { [key: string]: string } = {
  'js': 'application/javascript',
  'json': 'application/json',
  'html': 'text/html',
  'css': 'text/css',
  'txt': 'text/plain',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'svg': 'image/svg+xml',
  'pdf': 'application/pdf',
  'zip': 'application/zip',
  'mp3': 'audio/mpeg',
  'mp4': 'video/mp4',
  'csv': 'text/csv',
  'xml': 'application/xml',
  'yaml': 'text/yaml',
  'md': 'text/markdown'
};

const MimeLookup: React.FC = () => {
  const [ext, setExt] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'mimelookup',
    (values: any) => {
      if (values.ext !== undefined) setExt(values.ext);
    },
    () => ({ ext })
  );

  const handleLookup = () => {
    const cleanExt = ext.replace('.', '').toLowerCase().trim();
    setResult(MIME_DB[cleanExt] || 'MIME type not found in local database.');
    recordAction();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <FileCode className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">MIME-type Lookup</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Registry</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Extension</label>
            <div className="flex gap-3">
              <input
                type="text"
                className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all text-white"
                placeholder="e.g. json or .png"
                value={ext}
                onChange={(e) => setExt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              />
              <button
                onClick={handleLookup}
                className="bg-nexus-accent text-slate-900 font-bold px-8 py-3 rounded-xl hover:scale-[1.02] transition-all"
              >
                Lookup
              </button>
            </div>
          </div>

          <div className="space-y-2">
             <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Result</label>
             <div className="glass bg-slate-950/30 rounded-2xl border border-white/5 p-6 flex items-center justify-between">
                <p className="text-xl font-mono text-slate-300">
                  {result || 'Waiting for input...'}
                </p>
                {result && !result.includes('not found') && (
                  <button
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-nexus-accent transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
             </div>
          </div>

          <div className="p-4 bg-nexus-accent/5 border border-nexus-accent/10 rounded-xl flex items-start gap-3">
            <Info className="w-4 h-4 text-nexus-accent mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              MIME (Multipurpose Internet Mail Extensions) types describe the media type of content. Browsers use them to determine how to handle specific file extensions.
            </p>
          </div>
        </div>

        <ToolHistory toolId="mimelookup" />
      </div>
    </div>
  );
};

export default MimeLookup;
