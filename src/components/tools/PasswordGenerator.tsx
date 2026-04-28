import React, { useState, useEffect } from 'react';
import { Copy, ShieldCheck, RefreshCw, Check, X } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');

  const { recordAction } = useToolState(
    'password-generator',
    (values: any) => {
      if (values.length !== undefined) setLength(values.length);
      if (values.includeUpper !== undefined) setIncludeUpper(values.includeUpper);
      if (values.includeLower !== undefined) setIncludeLower(values.includeLower);
      if (values.includeNumbers !== undefined) setIncludeNumbers(values.includeNumbers);
      if (values.includeSymbols !== undefined) setIncludeSymbols(values.includeSymbols);
      if (values.password !== undefined) setPassword(values.password);
    },
    () => ({ length, includeUpper, includeLower, includeNumbers, includeSymbols, password })
  );

  const generatePassword = () => {
    const charsets = {
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lower: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+[]{}|;:,.<>?',
    };

    let allowedChars = '';
    if (includeUpper) allowedChars += charsets.upper;
    if (includeLower) allowedChars += charsets.lower;
    if (includeNumbers) allowedChars += charsets.numbers;
    if (includeSymbols) allowedChars += charsets.symbols;

    if (!allowedChars) {
      setPassword('');
      return;
    }

    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += allowedChars[arr[i] % allowedChars.length];
    }
    setPassword(result);
    recordAction();
  };

  useEffect(() => {
    generatePassword();
  }, []);

  const copyToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-8 h-8 text-nexus-accent" />
        <h2 className="text-2xl font-bold glow-text">Password Generator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Password Length</label>
              <span className="text-nexus-accent font-mono font-bold text-xl">{length}</span>
            </div>
            <input 
              type="range" 
              min="8" 
              max="64" 
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-nexus-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Uppercase', state: includeUpper, set: setIncludeUpper },
              { label: 'Lowercase', state: includeLower, set: setIncludeLower },
              { label: 'Numbers', state: includeNumbers, set: setIncludeNumbers },
              { label: 'Symbols', state: includeSymbols, set: setIncludeSymbols },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => opt.set(!opt.state)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  opt.state 
                    ? 'bg-nexus-accent/10 border-nexus-accent/30 text-nexus-accent' 
                    : 'bg-slate-950/30 border-white/5 text-slate-500 hover:border-white/10'
                }`}
              >
                <span className="text-sm font-bold uppercase tracking-tight">{opt.label}</span>
                {opt.state ? <Check className="w-4 h-4" /> : <X className="w-4 h-4 opacity-20" />}
              </button>
            ))}
          </div>

          <button
            onClick={generatePassword}
            className="w-full bg-nexus-accent/20 hover:bg-nexus-accent/30 text-nexus-accent border border-nexus-accent/30 py-4 rounded-xl transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-nexus-accent/5"
          >
            <RefreshCw className="w-5 h-5" /> Generate New Password
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Result</label>
          <div className="flex-1 bg-slate-950/50 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-6 group">
            <div className="w-full font-mono text-2xl md:text-3xl break-all text-center text-slate-200 tracking-wider">
              {password || <span className="text-slate-700 italic">Select an option</span>}
            </div>
            
            <button
              onClick={copyToClipboard}
              disabled={!password}
              className="px-8 py-3 bg-white/5 hover:bg-nexus-accent hover:text-slate-900 border border-white/10 hover:border-nexus-accent rounded-xl transition-all flex items-center gap-2 text-sm font-bold disabled:opacity-50"
            >
              <Copy className="w-4 h-4" /> Copy Password
            </button>
          </div>
          
          <div className="p-4 bg-slate-900/50 border border-white/5 rounded-xl">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Strength</span>
                <span className={`text-[10px] font-bold uppercase ${length > 20 && includeUpper && includeSymbols ? 'text-green-400' : 'text-orange-400'}`}>
                  {length > 24 ? 'Extremely Strong' : length > 12 ? 'Strong' : 'Moderate'}
                </span>
             </div>
             <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${length > 20 ? 'bg-green-500' : 'bg-orange-500'}`} 
                  style={{ width: `${Math.min(100, (length / 32) * 100)}%` }} 
                />
             </div>
          </div>
        </div>
      </div>

      <ToolHistory toolId="password-generator" />
    </div>
  );
};

export default PasswordGenerator;
