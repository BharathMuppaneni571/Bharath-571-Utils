import React, { useState } from 'react';
import { Copy, Terminal, Zap, Code } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const CurlConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'curl-converter',
    (values: any) => {
      if (values.input !== undefined) setInput(values.input);
      if (values.output !== undefined) setOutput(values.output);
    },
    () => ({ input, output })
  );

  const convertCurl = () => {
    if (!input.trim()) return;
    try {
      let method = 'GET', url = '', headers: any = {}, body = null;
      
      const methodMatch = input.match(/-X\s+(\w+)/i);
      if (methodMatch) method = methodMatch[1].toUpperCase();

      const urlMatch = input.match(/curl\s+(?:-[^\s]+\s+[^\s]+\s+)*['"](https?:\/\/[^'"]+)['"]/) || 
                       input.match(/curl\s+(?:-[^\s]+\s+[^\s]+\s+)*(https?:\/\/\S+)/);
      if (urlMatch) url = urlMatch[1];

      const headerMatches = [...input.matchAll(/-H\s+['"]([^'"]+)['"]/gi)];
      headerMatches.forEach(m => {
        const [k, ...v] = m[1].split(':');
        if (k) headers[k.trim()] = v.join(':').trim();
      });

      const bodyMatch = input.match(/(?:-d|--data|--data-raw)\s+['"]((?:[^'"\\]|\\.)*)['"]/);
      if (bodyMatch) body = bodyMatch[1].replace(/\\'/g, "'").replace(/\\"/g, '"');

      const headersStr = Object.keys(headers).length ? `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')},\n` : '';
      const bodyStr = body ? `  body: ${JSON.stringify(body)},\n` : '';
      
      const result = `const response = await fetch('${url}', {\n  method: '${method}',\n${headersStr}${bodyStr}});\n\nconst data = await response.json();\nconsole.log(data);`;
      
      setOutput(result);
      setError(null);
      recordAction();
    } catch (err: any) {
      setError('Parse Error: ' + err.message);
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

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Terminal className="w-8 h-8 text-nexus-accent" />
        <h2 className="text-2xl font-bold glow-text">cURL to Fetch Converter</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">cURL Command</label>
          <textarea
            className="w-full h-80 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors resize-none"
            placeholder="Paste your curl command here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={convertCurl}
            className="w-full bg-nexus-accent/20 hover:bg-nexus-accent/30 text-nexus-accent border border-nexus-accent/30 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Zap className="w-4 h-4" /> Convert to Fetch
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Fetch JS Output</label>
            {output && (
              <button
                onClick={copyToClipboard}
                className="text-xs flex items-center gap-1.5 text-nexus-accent hover:text-nexus-accent/80 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </button>
            )}
          </div>
          <div className="relative">
            <pre className={`w-full h-[370px] bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-xs overflow-auto custom-scrollbar ${error ? 'text-red-400' : 'text-nexus-accent'}`}>
              <Code className="w-4 h-4 absolute top-4 right-4 opacity-20" />
              {error || output || 'Fetch code will appear here...'}
            </pre>
          </div>
        </div>
      </div>

      <ToolHistory toolId="curl-converter" />
    </div>
  );
};

export default CurlConverter;
