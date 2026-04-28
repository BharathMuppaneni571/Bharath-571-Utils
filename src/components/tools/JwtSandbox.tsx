import React, { useState } from 'react';
import { Copy, Shield, Key, User } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const JwtSandbox: React.FC = () => {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<any>(null);
  const [payload, setPayload] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'jwt-sandbox',
    (values: any) => {
      if (values.token !== undefined) setToken(values.token);
      if (values.header !== undefined) setHeader(values.header);
      if (values.payload !== undefined) setPayload(values.payload);
    },
    () => ({ token, header, payload })
  );

  const decodeJwt = () => {
    if (!token.trim()) return;
    try {
      const parts = token.split('.');
      if (parts.length < 2) throw new Error('Invalid JWT: Token must have at least 2 parts');

      const decode = (str: string) => {
        const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
          atob(b64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(json);
      };

      const newHeader = decode(parts[0]);
      const newPayload = decode(parts[1]);
      setHeader(newHeader);
      setPayload(newPayload);
      setError(null);
      recordAction();
    } catch (err: any) {
      setError(err.message);
      setHeader(null);
      setPayload(null);
    }
  };

  const copyToClipboard = async (data: any) => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-nexus-accent" />
        <h2 className="text-2xl font-bold glow-text">JWT Token Sandbox</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Encoded Token</label>
          <textarea
            className="w-full h-32 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors resize-none break-all"
            placeholder="eyJhbG..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button
            onClick={decodeJwt}
            className="w-full bg-nexus-accent/20 hover:bg-nexus-accent/30 text-nexus-accent border border-nexus-accent/30 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
          >
            Decode Token
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                <Key className="w-3 h-3" /> Header
              </label>
              {header && (
                <button onClick={() => copyToClipboard(header)} className="text-xs text-nexus-accent hover:text-white transition-colors">
                  <Copy className="w-3 h-3" />
                </button>
              )}
            </div>
            <pre className="w-full h-64 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-xs overflow-auto text-nexus-violet">
              {header ? JSON.stringify(header, null, 2) : 'Header will appear here...'}
            </pre>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                <User className="w-3 h-3" /> Payload
              </label>
              {payload && (
                <button onClick={() => copyToClipboard(payload)} className="text-xs text-nexus-accent hover:text-white transition-colors">
                  <Copy className="w-3 h-3" />
                </button>
              )}
            </div>
            <pre className="w-full h-64 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-xs overflow-auto text-nexus-accent">
              {payload ? JSON.stringify(payload, null, 2) : 'Payload will appear here...'}
            </pre>
          </div>
        </div>
      </div>

      <ToolHistory toolId="jwt-sandbox" />
    </div>
  );
};

export default JwtSandbox;
