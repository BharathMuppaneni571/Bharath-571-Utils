import React, { useState } from 'react';
import { ShieldCheck, Copy, Sparkles, RefreshCw, Calendar } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const IdGenerator: React.FC = () => {
  const [idType, setIdType] = useState<'uuidv4' | 'uuidv7' | 'ulid'>('uuidv4');
  const [count, setCount] = useState<number>(5);
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { recordAction } = useToolState(
    'id-generator',
    (values: any) => {
      if (values.idType !== undefined) setIdType(values.idType);
      if (values.count !== undefined) setCount(values.count);
      if (values.generatedIds !== undefined) setGeneratedIds(values.generatedIds);
    },
    () => ({ idType, count, generatedIds })
  );

  // Secure UUID v4 generation using web crypto
  const generateUUIDv4 = (): string => {
    if (typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    arr[6] = (arr[6] & 0x0f) | 0x40; // Version 4
    arr[8] = (arr[8] & 0x3f) | 0x80; // Variant 10xx
    const hex = Array.from(arr).map((b) => b.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
  };

  // Secure UUID v7 generation using Web Crypto and timestamp
  const generateUUIDv7 = (): string => {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    
    const timestamp = Date.now(); // 48-bit timestamp
    const tsHi = Math.floor(timestamp / 0x100000000);
    const tsLo = timestamp % 0x100000000;

    arr[0] = (tsHi >> 8) & 0xff;
    arr[1] = tsHi & 0xff;
    arr[2] = (tsLo >> 24) & 0xff;
    arr[3] = (tsLo >> 16) & 0xff;
    arr[4] = (tsLo >> 8) & 0xff;
    arr[5] = tsLo & 0xff;

    arr[6] = (arr[6] & 0x0f) | 0x70; // Version 7
    arr[8] = (arr[8] & 0x3f) | 0x80; // Variant 10xx

    const hex = Array.from(arr).map((b) => b.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
  };

  // Crockford Base32 encoding for ULID
  const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const generateULID = (): string => {
    const time = Date.now();
    let timeStr = '';
    let t = time;
    for (let i = 0; i < 10; i++) {
      timeStr = ENCODING[t % 32] + timeStr;
      t = Math.floor(t / 32);
    }

    const randomBytes = new Uint8Array(16);
    window.crypto.getRandomValues(randomBytes);
    let randStr = '';
    for (let i = 0; i < 16; i++) {
      randStr += ENCODING[randomBytes[i] % 32];
    }
    return timeStr + randStr;
  };

  const handleGenerate = () => {
    const newIds: string[] = [];
    for (let i = 0; i < count; i++) {
      if (idType === 'uuidv4') newIds.push(generateUUIDv4());
      else if (idType === 'uuidv7') newIds.push(generateUUIDv7());
      else if (idType === 'ulid') newIds.push(generateULID());
    }
    setGeneratedIds(newIds);
    recordAction({ idType, count, generatedIds: newIds });
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Extract info/timestamp from UUID v7 or ULID
  const parseTimestamp = (id: string): string => {
    if (idType === 'uuidv7') {
      try {
        const clean = id.replace(/-/g, '');
        const timeHex = clean.slice(0, 12);
        const timestamp = parseInt(timeHex, 16);
        return new Date(timestamp).toLocaleString();
      } catch {
        return 'N/A';
      }
    } else if (idType === 'ulid') {
      try {
        const timePart = id.slice(0, 10);
        let timestamp = 0;
        for (let i = 0; i < timePart.length; i++) {
          timestamp = timestamp * 32 + ENCODING.indexOf(timePart[i]);
        }
        return new Date(timestamp).toLocaleString();
      } catch {
        return 'N/A';
      }
    }
    return 'UUID v4 contains purely random bits';
  };

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <ShieldCheck className="w-8 h-8 text-nexus-accent animate-bounce" />
        <div>
          <h2 className="text-2xl font-bold glow-text">Secure Token & ID Generator</h2>
          <p className="text-xs text-slate-400">Generate high-entropy UUIDs & time-sortable ULIDs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-1">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">ID Type</label>
            <div className="flex flex-col gap-2">
              {[
                { id: 'uuidv4', name: 'UUID v4', desc: 'Completely random identity' },
                { id: 'uuidv7', name: 'UUID v7', desc: 'Time-ordered / sortable UUID' },
                { id: 'ulid', name: 'ULID', desc: 'Crockford 26-char sortable ID' },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setIdType(type.id as any)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    idType === type.id
                      ? 'bg-nexus-accent/20 text-nexus-accent border-nexus-accent/40'
                      : 'bg-slate-950/30 text-slate-300 border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="text-sm font-semibold">{type.name}</div>
                  <div className="text-[10px] text-slate-400">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Count</label>
            <input
              type="number"
              min={1}
              max={100}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 font-mono text-sm focus:outline-none focus:border-nexus-accent/50"
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            />
          </div>

          <button
            onClick={handleGenerate}
            className="w-full bg-nexus-accent/20 hover:bg-nexus-accent/30 text-nexus-accent border border-nexus-accent/30 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Sparkles className="w-4 h-4" /> Generate IDs
          </button>
        </div>

        <div className="md:col-span-2 space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Generated Credentials</label>
          <div className="w-full h-80 bg-slate-950/50 border border-white/10 rounded-xl p-4 overflow-y-auto custom-scrollbar space-y-3">
            {generatedIds.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="text-xs">Click Generate to initialize keys</span>
              </div>
            ) : (
              generatedIds.map((id, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-nexus-accent/30 transition-all"
                >
                  <div className="space-y-1 font-mono text-xs text-nexus-accent max-w-[80%] break-all">
                    <div>{id}</div>
                    {idType !== 'uuidv4' && (
                      <div className="text-[9px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Created: {parseTimestamp(id)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(id, index)}
                    className="p-2 bg-slate-950/50 rounded-lg border border-white/10 hover:border-nexus-accent text-slate-400 hover:text-nexus-accent transition-colors flex items-center gap-1.5 text-[10px]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedIndex === index ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ToolHistory toolId="id-generator" />
    </div>
  );
};

export default IdGenerator;
