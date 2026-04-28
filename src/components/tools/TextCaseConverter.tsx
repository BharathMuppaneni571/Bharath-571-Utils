import React, { useState } from 'react';
import { Copy, Trash2, Type } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const TextCaseConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const { recordAction } = useToolState(
    'text-case',
    (values: any) => {
      if (values.input !== undefined) setInput(values.input);
      if (values.output !== undefined) setOutput(values.output);
    },
    () => ({ input, output })
  );

  const convertCase = (type: string) => {
    if (!input.trim()) return;
    let result = '';
    
    const toWords = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ').trim().split(/\s+/);

    switch(type) {
      case 'upper':      result = input.toUpperCase(); break;
      case 'lower':      result = input.toLowerCase(); break;
      case 'title':      result = input.replace(/\b\w/g, c => c.toUpperCase()); break;
      case 'sentence':   result = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase(); break;
      case 'camel':      result = toWords(input).map((w,i) => i===0 ? w.toLowerCase() : w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(''); break;
      case 'pascal':     result = toWords(input).map(w => w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(''); break;
      case 'snake':      result = toWords(input).map(w => w.toLowerCase()).join('_'); break;
      case 'kebab':      result = toWords(input).map(w => w.toLowerCase()).join('-'); break;
      case 'constant':   result = toWords(input).map(w => w.toUpperCase()).join('_'); break;
      case 'alternating':result = [...input].map((c,i)=> i%2===0?c.toLowerCase():c.toUpperCase()).join(''); break;
      case 'reverse':    result = [...input].reverse().join(''); break;
      case 'trim':       result = input.replace(/\s+/g, ' ').trim(); break;
      default:           result = input;
    }
    setOutput(result);
    recordAction();
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
        <Type className="w-8 h-8 text-nexus-accent" />
        <h2 className="text-2xl font-bold glow-text">Text Case Converter</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Input Text</label>
          <textarea
            className="w-full h-64 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors resize-none"
            placeholder="Paste your text here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'UPPER', id: 'upper' },
              { label: 'lower', id: 'lower' },
              { label: 'Title', id: 'title' },
              { label: 'Sentence', id: 'sentence' },
              { label: 'camelCase', id: 'camel' },
              { label: 'Pascal', id: 'pascal' },
              { label: 'snake_case', id: 'snake' },
              { label: 'kebab-case', id: 'kebab' },
              { label: 'CONSTANT', id: 'constant' },
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => convertCase(btn.id)}
                className="bg-white/5 hover:bg-nexus-accent/20 text-slate-400 hover:text-nexus-accent border border-white/5 hover:border-nexus-accent/30 py-2 rounded-lg transition-all text-[10px] font-bold"
              >
                {btn.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setInput('')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all text-xs font-bold"
          >
            <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Clear Input
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Converted Result</label>
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
            <div className="w-full h-80 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm overflow-auto text-slate-200">
              {output || 'Result will appear here...'}
            </div>
          </div>
        </div>
      </div>

      <ToolHistory toolId="text-case" />
    </div>
  );
};

export default TextCaseConverter;
