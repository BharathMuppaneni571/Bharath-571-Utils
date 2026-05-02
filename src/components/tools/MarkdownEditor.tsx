import React, { useState, useEffect } from 'react';
import { Edit3, Copy, Trash2, Download } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';
import { marked } from 'marked';

const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState('# Nexus-571 Markdown\n\nStart typing your **markdown** here to see the live preview on the right!\n\n## Features\n- Live Preview\n- Syntax Highlighting\n- Export to HTML');
  const [html, setHtml] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const { recordAction } = useToolState(
    'markdown',
    (values: any) => {
      if (values.markdown !== undefined) setMarkdown(values.markdown);
    },
    () => ({ markdown })
  );

  useEffect(() => {
    const render = async () => {
      const rendered = await marked.parse(markdown);
      setHtml(rendered);
    };
    render();
    if (markdown.length > 50) recordAction();
  }, [markdown]);

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const downloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-note-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
              <Edit3 className="w-6 h-6 text-nexus-accent" />
            </div>
            <div>
              <h2 className="text-3xl font-bold glow-text tracking-tight">Markdown Editor</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Studio</p>
            </div>
          </div>
          
          <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'edit' ? 'bg-nexus-accent text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-nexus-accent text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`space-y-4 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Markdown Input</label>
              <div className="flex gap-2">
                 <button onClick={downloadMd} className="text-slate-500 hover:text-nexus-accent transition-colors" title="Download .md">
                   <Download className="w-3.5 h-3.5" />
                 </button>
                 <button onClick={() => setMarkdown('')} className="text-slate-500 hover:text-red-400 transition-colors" title="Clear">
                   <Trash2 className="w-3.5 h-3.5" />
                 </button>
              </div>
            </div>
            <textarea
              className="w-full h-[600px] bg-slate-950/50 border border-white/10 rounded-2xl p-6 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner text-slate-300 leading-relaxed custom-scrollbar"
              placeholder="Start writing markdown..."
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
            />
          </div>

          <div className={`space-y-4 ${activeTab === 'edit' ? 'hidden lg:block' : 'block'}`}>
            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Preview</label>
              <button
                onClick={copyHtml}
                className="text-[10px] font-bold flex items-center gap-1.5 text-nexus-accent hover:text-white transition-all uppercase tracking-widest px-3 py-1 bg-nexus-accent/10 rounded-full"
              >
                <Copy className="w-3 h-3" /> Copy HTML
              </button>
            </div>
            <div className="w-full h-[600px] bg-white/5 border border-white/10 rounded-2xl p-8 overflow-auto custom-scrollbar shadow-inner prose prose-invert prose-nexus max-w-none">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>
        </div>

        <ToolHistory toolId="markdown" />
      </div>
    </div>
  );
};

export default MarkdownEditor;
