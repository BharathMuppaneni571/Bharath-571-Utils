import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const AuthCard: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, register, loginGuest, error, isLoading, setAuthenticated } = useAuthStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'none' | 'shake' | 'suck'>('none');

  const triggerShake = () => {
    setAnimationType('shake');
    
    // Bomb explosion visual logic
    const card = document.querySelector('.auth-card-el');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const blast = document.createElement('div');
    blast.className = 'auth-blast-overlay';
    document.body.appendChild(blast);
    setTimeout(() => blast.remove(), 500);

    const bomb = document.createElement('div');
    bomb.className = 'auth-bomb-emoji';
    bomb.textContent = '💣';
    bomb.style.left = `${cx - 20}px`;
    bomb.style.top = `${cy - 20}px`;
    document.body.appendChild(bomb);
    setTimeout(() => bomb.remove(), 900);

    const colors = ['#ef4444','#f97316','#fbbf24','#f87171','#fb923c','#fcd34d','#ff6b6b'];
    for (let i = 0; i < 28; i++) {
      const particle = document.createElement('div');
      particle.className = 'auth-explosion-particle';
      const angle = (Math.PI * 2 / 28) * i + (Math.random() * 0.3);
      const speed = 80 + Math.random() * 160;
      const tx = Math.cos(angle) * speed;
      const ty = Math.sin(angle) * speed;
      const size = 4 + Math.random() * 10;
      const dur = 0.5 + Math.random() * 0.5;
      particle.style.cssText = `
        left: ${cx - size/2}px;
        top: ${cy - size/2}px;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        --tx: ${tx}px;
        --ty: ${ty}px;
        --dur: ${dur}s;
      `;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), dur * 1000 + 100);
    }

    setTimeout(() => setAnimationType('none'), 600);
  };

  const triggerSuck = (finalUsername: string) => {
    setAnimationType('suck');
    setIsAnimating(true);

    const vortex = document.createElement('div');
    vortex.className = 'vortex-bg-overlay';
    document.body.appendChild(vortex);

    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      ring.className = 'black-hole-ring';
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 1100);
    }

    for (let i = 0; i < 12; i++) {
      const ray = document.createElement('div');
      ray.className = 'suck-ray';
      const angle = (360 / 12) * i;
      const dist = 300 + Math.random() * 100;
      ray.style.left = '50%';
      ray.style.top = '50%';
      ray.style.transform = `rotate(${angle}deg) translateY(-${dist}px)`;
      document.body.appendChild(ray);
      setTimeout(() => ray.remove(), 1100);
    }

    setTimeout(() => {
      vortex.remove();
      setAuthenticated(true, finalUsername);
    }, 1100);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading || isAnimating) return;

    if (mode === 'register' && password !== confirmPassword) {
      triggerShake();
      return;
    }

    if (!username || !password) {
      triggerShake();
      return;
    }

    const success = mode === 'login' 
      ? await login(username, password, true)
      : await register(username, password);

    if (success) {
      if (mode === 'login') {
        triggerSuck(username);
      } else {
        setMode('login');
      }
    } else {
      triggerShake();
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className={`auth-card-el w-full max-w-[450px] glass p-6 md:p-10 rounded-[32px] relative z-10 shadow-2xl text-center overflow-hidden ${animationType === 'shake' ? 'auth-card-shake' : ''} ${animationType === 'suck' ? 'auth-card-sucking' : ''}`}
    >
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 bg-white rounded-2xl p-2 flex items-center justify-center shadow-lg">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-nexus-accent to-nexus-violet bg-clip-text text-transparent mb-1">
        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
      </h1>
      <p className="text-slate-400 mb-6 text-sm px-4">
        {mode === 'login' ? 'Sign in to access Nexus-571' : 'Join Nexus-571 to sync your data'}
      </p>

      {error && !isAnimating && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="flex gap-3 p-1 bg-slate-950/50 rounded-xl mb-6">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            mode === 'login' ? 'bg-nexus-accent text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            mode === 'register' ? 'bg-nexus-accent text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 text-left"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-200 outline-none focus:border-nexus-accent/50 focus:bg-slate-950/60 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-200 outline-none focus:border-nexus-accent/50 focus:bg-slate-950/60 transition-all"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-200 outline-none focus:border-nexus-accent/50 focus:bg-slate-950/60 transition-all"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading || isAnimating}
              className="w-full bg-gradient-to-r from-nexus-accent to-nexus-violet text-white font-bold py-3 rounded-xl shadow-lg shadow-nexus-accent/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group mt-2 text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.div>
        </AnimatePresence>
      </form>

      <div className="mt-8">
        <button 
          onClick={async () => {
            const success = await loginGuest();
            if (success) triggerSuck('Guest');
          }}
          className="w-full py-2.5 bg-nexus-accent/10 hover:bg-nexus-accent/20 border border-nexus-accent/20 rounded-xl transition-all text-xs font-bold text-nexus-accent"
        >
          Login as Guest (Local)
        </button>
      </div>
    </motion.div>
  );
};

export default AuthCard;
