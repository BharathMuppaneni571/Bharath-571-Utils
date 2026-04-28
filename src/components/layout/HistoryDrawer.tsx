import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Trash2, Search, RotateCcw } from 'lucide-react';
import { useHistoryStore } from '../../store/useHistoryStore';
import type { HistoryRecord } from '../../store/useHistoryStore';
import { useAppStore } from '../../store/useAppStore';

const HistoryDrawer: React.FC = () => {
  const { isOpen, setIsOpen, records, isLoading, fetchHistory, clearHistory } = useHistoryStore();
  const { activeTool } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && activeTool !== 'dashboard') {
      fetchHistory(activeTool);
    }
  }, [isOpen, activeTool, fetchHistory]);

  const filteredRecords = records.filter((rec: HistoryRecord) => 
    rec.payload.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestore = (payloadStr: string) => {
    try {
      const payload = JSON.parse(payloadStr);
      // Dispatch a custom event that tools can listen to
      window.dispatchEvent(new CustomEvent('nexus-restore-tool-state', { detail: { toolId: activeTool, payload } }));
      setIsOpen(false);
    } catch (e) {
      console.error('Failed to parse history payload', e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900/95 border-l border-white/10 z-[101] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-nexus-accent" />
                <h2 className="text-xl font-bold glow-text">Tool History</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search history..."
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {activeTool !== 'dashboard' && (
                <button
                  onClick={() => clearHistory(activeTool)}
                  className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Clear History for {activeTool.replace('-', ' ')}
                </button>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {isLoading ? (
                  <div className="py-20 text-center text-slate-500 italic">Loading records...</div>
                ) : filteredRecords.length === 0 ? (
                  <div className="py-20 text-center text-slate-500 italic">No history found for this tool.</div>
                ) : (
                  filteredRecords.map((record: HistoryRecord) => (
                    <div
                      key={record.id}
                      className="group p-4 glass rounded-2xl border border-white/5 hover:border-nexus-accent/30 transition-all cursor-pointer relative overflow-hidden"
                      onClick={() => handleRestore(record.payload)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {new Date(record.created_at).toLocaleString()}
                        </span>
                        <RotateCcw className="w-3 h-3 text-nexus-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-3 font-mono break-all leading-relaxed">
                        {record.payload.substring(0, 300)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistoryDrawer;
