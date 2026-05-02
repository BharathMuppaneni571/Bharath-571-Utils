import React, { useState } from 'react';
import { Send, Globe, Copy, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const RestApiClient: React.FC = () => {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ key: 'Content-Type', val: 'application/json' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'restapi',
    () => {},
    () => ({})
  );

  const handleSend = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const headerObj: any = {};
      headers.forEach(h => { if(h.key) headerObj[h.key] = h.val; });

      const options: any = {
        method,
        headers: headerObj,
      };
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data: data
      });
      recordAction();
    } catch (err: any) {
      setError(err.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const addHeader = () => setHeaders([...headers, { key: '', val: '' }]);
  const removeHeader = (i: number) => setHeaders(headers.filter((_, idx) => idx !== i));
  const updateHeader = (i: number, k: string, v: string) => {
    const nh = [...headers];
    nh[i].key = k;
    nh[i].val = v;
    setHeaders(nh);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <Globe className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">REST API Client</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Connectivity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex gap-2">
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value)}
                className="bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-nexus-accent focus:outline-none"
              >
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input
                type="text"
                className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-5 py-3 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all text-white shadow-inner"
                placeholder="https://api.example.com/data"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-nexus-accent text-slate-900 font-bold px-6 py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center px-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Headers</label>
                  <button onClick={addHeader} className="text-nexus-accent hover:text-white transition-colors">
                     <Plus className="w-3.5 h-3.5" />
                  </button>
               </div>
               <div className="space-y-2">
                  {headers.map((h, i) => (
                    <div key={i} className="flex gap-2 animate-in slide-in-from-right-2">
                       <input 
                         className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white" 
                         placeholder="Header"
                         value={h.key}
                         onChange={(e) => updateHeader(i, e.target.value, h.val)}
                       />
                       <input 
                         className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white" 
                         placeholder="Value"
                         value={h.val}
                         onChange={(e) => updateHeader(i, h.key, e.target.value)}
                       />
                       <button onClick={() => removeHeader(i)} className="text-slate-500 hover:text-red-400">
                          <X className="w-4 h-4" />
                       </button>
                    </div>
                  ))}
               </div>
            </div>

            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className="space-y-2">
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Request Body (JSON)</label>
                 <textarea
                   className="w-full h-48 bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-xs focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner text-slate-300"
                   placeholder='{ "key": "value" }'
                   value={body}
                   onChange={(e) => setBody(e.target.value)}
                 />
              </div>
            )}
          </div>

          <div className="space-y-4 flex flex-col min-h-[500px]">
             <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Response</label>
             <div className="flex-1 glass bg-slate-950/30 rounded-3xl border border-white/5 p-6 overflow-hidden flex flex-col">
                {loading ? (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-4 border-nexus-accent/20 border-t-nexus-accent rounded-full animate-spin" />
                      <p className="text-slate-500 text-sm">Waiting for server...</p>
                   </div>
                ) : error ? (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                      <p className="text-red-400 font-mono text-xs">{error}</p>
                   </div>
                ) : response ? (
                   <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${response.status < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                               {response.status} {response.statusText}
                            </span>
                         </div>
                         <button onClick={() => navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))} className="text-nexus-accent">
                            <Copy className="w-3.5 h-3.5" />
                         </button>
                      </div>
                      <pre className="flex-1 bg-black/20 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-auto custom-scrollbar">
                         {JSON.stringify(response.data, null, 2)}
                      </pre>
                   </div>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-slate-600">
                      <Globe className="w-12 h-12" />
                      <p className="text-sm">Response will appear here after request.</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        <ToolHistory toolId="restapi" />
      </div>
    </div>
  );
};

export default RestApiClient;
