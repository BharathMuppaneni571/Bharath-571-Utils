import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, History, Zap, CornerDownLeft } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { authenticatedFetch } from '../../lib/api';

const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, toggleCommandPalette, setActiveTool } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, toggleCommandPalette]);

  const fetchResults = async (q: string) => {
    if (!q) {
      setResults([]);
      return;
    }

    const actions = [
      { id: 'json', title: 'JSON Formatter', type: 'tool', icon: Zap },
      { id: 'base64', title: 'Base64 Converter', type: 'tool', icon: Zap },
      { id: 'imgopt', title: 'Image Optimizer', type: 'tool', icon: Zap },
      { id: 'hash', title: 'Hash Generator', type: 'tool', icon: Zap },
      { id: 'unit', title: 'Unit Converter', type: 'tool', icon: Zap },
      { id: 'case', title: 'Text Case Converter', type: 'tool', icon: Zap },
      { id: 'entity', title: 'Entity Encoder', type: 'tool', icon: Zap },
      { id: 'notepad', title: 'Notepad', type: 'tool', icon: FileText },
      { id: 'password', title: 'Password Generator', type: 'tool', icon: Zap },
      { id: 'url-shortener', title: 'URL Shortener', type: 'tool', icon: Zap },
      { id: 'datetime', title: 'Date-Time Formatter', type: 'tool', icon: Zap },
      { id: 'color', title: 'Color Picker', type: 'tool', icon: Zap },
      { id: 'jwt', title: 'JWT Sandbox', type: 'tool', icon: Zap },
      { id: 'curl', title: 'cURL Converter', type: 'tool', icon: Zap },
      { id: 'cron', title: 'Cron Generator', type: 'tool', icon: Zap },
    ].filter(a => a.title.toLowerCase().includes(q.toLowerCase()));

    try {
      const res = await authenticatedFetch(`/api/search?q=${encodeURIComponent(q)}&mode=insensitive`);
      if (res.ok) {
        const cloudData = await res.json();
        const formattedCloud = cloudData.map((r: any) => ({
          ...r,
          title: r.title || r.id || 'Untitled',
          type: r.type || 'history',
          icon: r.type === 'note' ? FileText : History
        }));
        setResults([...actions, ...formattedCloud]);
      } else {
        setResults(actions);
      }
    } catch (e) {
      setResults(actions);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: any) => {
    if (item.type === 'tool') {
      setActiveTool(item.id);
    } else if (item.type === 'note') {
      setActiveTool('notepad');
    } else if (item.type === 'history') {
      setActiveTool(item.toolId);
      setTimeout(() => {
        try {
          const payload = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;
          window.dispatchEvent(new CustomEvent('nexus-restore-tool-state', { detail: { toolId: item.toolId, payload } }));
        } catch(e){}
      }, 100);
    }
    toggleCommandPalette();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (results.length || 1)) % (results.length || 1));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCommandPalette}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-[201]"
          >
            <div className="p-4 border-b border-white/10 flex items-center gap-4">
              <Search className="w-6 h-6 text-nexus-accent" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent text-lg text-slate-100 outline-none placeholder:text-slate-600"
                placeholder="Search tools, notes, or history..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                ESC
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              {results.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  {query ? 'No results found' : 'Type to search everything...'}
                </div>
              ) : (
                results.map((item, index) => {
                  const Icon = item.icon || Zap;
                  return (
                    <div
                      key={index}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                        index === selectedIndex ? 'bg-nexus-accent/10 border border-nexus-accent/20 translate-x-1' : 'bg-transparent border border-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${index === selectedIndex ? 'bg-nexus-accent text-slate-900' : 'bg-white/5 text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold truncate ${index === selectedIndex ? 'text-white' : 'text-slate-300'}`}>
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest font-medium">
                          {item.type} {item.toolId ? `• ${item.toolId}` : ''}
                        </div>
                      </div>
                      {index === selectedIndex && (
                        <div className="flex items-center gap-2 text-nexus-accent text-[10px] font-bold">
                          <span>OPEN</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="p-3 border-t border-white/10 bg-slate-950/30 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-6">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> Select</span>
                <span className="flex items-center gap-1">↑↓ Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-nexus-accent" />
                Nexus Search
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
