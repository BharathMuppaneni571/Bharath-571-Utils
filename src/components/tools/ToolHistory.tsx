import React, { useEffect } from 'react';
import { Clock, RotateCcw, Trash2 } from 'lucide-react';
import { useHistoryStore } from '../../store/useHistoryStore';

interface ToolHistoryProps {
  toolId: string;
}

const ToolHistory: React.FC<ToolHistoryProps> = ({ toolId }) => {
  const { records, fetchHistory, clearHistory, isLoading } = useHistoryStore();

  useEffect(() => {
    fetchHistory(toolId);
  }, [toolId, fetchHistory]);

  const handleRestore = (payloadStr: string) => {
    try {
      const payload = JSON.parse(payloadStr);
      window.dispatchEvent(new CustomEvent('nexus-restore-tool-state', { detail: { toolId, payload } }));
    } catch (e) {
      console.error('Failed to restore history item', e);
    }
  };

  if (isLoading && records.length === 0) return null;
  if (!isLoading && records.length === 0) return null;

  return (
    <div className="mt-12 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
          <Clock className="w-3 h-3" /> Recent Activity
        </div>
        <button 
          onClick={() => clearHistory(toolId)}
          className="text-red-500/50 hover:text-red-500 transition-colors"
          title="Clear tool history"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {records.slice(0, 6).map((rec) => (
          <div 
            key={rec.id}
            onClick={() => handleRestore(rec.payload)}
            className="glass p-3 rounded-xl border border-white/5 hover:border-nexus-accent/30 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] text-slate-600 font-medium">
                {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <RotateCcw className="w-2.5 h-2.5 text-nexus-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10px] text-slate-400 truncate font-mono">
              {rec.payload.substring(0, 100)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolHistory;
