import React, { useState } from 'react';
import { Search, History, Palette, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useThemeStore } from '../../store/useThemeStore';
import type { AppTheme } from '../../store/useThemeStore';
import { motion, AnimatePresence } from 'framer-motion';

const TopNav: React.FC = () => {
  const username = useAuthStore(state => state.username);
  const logout = useAuthStore(state => state.logout);
  const setIsHistoryOpen = useHistoryStore(state => state.setIsOpen);
  const { theme, setTheme, accentColor, setAccentColor } = useThemeStore();
  const { activeTool, toggleCommandPalette, setActiveTool } = useAppStore();

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Simplified themes: Only Dark and Light
  const themes: { id: AppTheme, name: string, color: string }[] = [
    { id: 'dark', name: 'Nexus Dark', color: 'bg-slate-900' },
    { id: 'light', name: 'Nexus Light', color: 'bg-slate-100' },
  ];

  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-slate-950/20 backdrop-blur-md sticky top-0 z-50">
      <div className="flex-1 max-w-xl">
        <div className="relative group cursor-pointer" onClick={toggleCommandPalette}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-nexus-accent transition-colors" />
          <input 
            type="text" 
            readOnly
            placeholder="Search tools... (Ctrl+K)"
            className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2 pl-11 pr-4 text-xs focus:outline-none focus:border-nexus-accent/50 focus:bg-slate-900/60 transition-all cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* History Toggle - Only visible if using a tool (not on dashboard) */}
        {activeTool !== 'dashboard' && (
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 rounded-lg border border-white/5 text-slate-400 hover:text-nexus-accent hover:bg-white/5 transition-all relative"
            title="Tool History"
          >
            <History className="w-4 h-4" />
          </button>
        )}

        {/* Theme Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className="p-2 hover:bg-white/5 border border-white/5 rounded-lg transition-all text-slate-400 hover:text-nexus-violet"
            title="Appearance"
          >
            <Palette className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {isThemeOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsThemeOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 glass rounded-2xl p-4 shadow-2xl border border-white/10"
                >
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Theme</h3>
                  <div className="space-y-2 mb-4">
                    {themes.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setTheme(t.id); setIsThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all ${theme === t.id ? 'border-nexus-accent bg-nexus-accent/10 text-white' : 'border-transparent text-slate-400 hover:bg-white/5'}`}
                      >
                        <div className={`w-4 h-4 rounded-full ${t.color} border border-white/10`} />
                        <span className="text-xs font-bold">{t.name}</span>
                      </button>
                    ))}
                  </div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1 border-t border-white/10 pt-3">Accent Color</h3>
                  <div className="flex items-center gap-3 px-1">
                    <input 
                      type="color" 
                      value={accentColor || '#14b8a6'} 
                      onChange={(e) => setAccentColor(e.target.value)} 
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <span className="text-xs text-slate-400 font-mono uppercase">
                      {accentColor || '#14b8a6'}
                    </span>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="h-6 w-px bg-white/10 mx-1 md:mx-2" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-2 pr-2 md:pr-3 py-1 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-nexus-accent to-nexus-violet p-[2px]">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white font-bold text-[10px]">
                {username?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-200 leading-none">{username}</div>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 glass rounded-2xl p-2 shadow-2xl border border-white/10 overflow-hidden"
                >
                  <button 
                    onClick={() => { setActiveTool('settings'); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" /> Profile Settings
                  </button>
                  <div className="h-px bg-white/5 my-1" />
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
