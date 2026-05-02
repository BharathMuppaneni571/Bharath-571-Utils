import React, { useState } from 'react';
import { QrCode, FileText, Trash2, Plus, Loader2 } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

const QrBatchExport: React.FC = () => {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState('');

  const { recordAction } = useToolState(
    'qrpdf',
    () => {},
    () => ({})
  );

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([...items, newItem.trim()]);
    setNewItem('');
    recordAction();
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const exportPdf = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const pdf = new jsPDF();
      for (let i = 0; i < items.length; i++) {
        if (i > 0) pdf.addPage();
        const url = await QRCode.toDataURL(items[i], { width: 400 });
        pdf.text(`Nexus QR: ${items[i]}`, 10, 10);
        pdf.addImage(url, 'PNG', 40, 20, 130, 130);
      }
      pdf.save(`nexus-qr-batch-${Date.now()}.pdf`);
      recordAction();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <QrCode className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">QR Batch Export</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Logistics</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex gap-3">
             <input
               type="text"
               className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-5 py-4 font-sans text-sm focus:outline-none focus:border-nexus-accent/50 transition-all text-white shadow-inner"
               placeholder="Add URL or Text for QR..."
               value={newItem}
               onChange={(e) => setNewItem(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && addItem()}
             />
             <button
               onClick={addItem}
               className="bg-white/5 border border-white/10 text-white font-bold px-6 py-4 rounded-xl hover:bg-nexus-accent hover:text-slate-900 transition-all"
             >
               <Plus className="w-5 h-5" />
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-auto custom-scrollbar pr-2">
             {items.map((item, i) => (
               <div key={i} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl group animate-in slide-in-from-left-2">
                  <div className="flex items-center gap-3 overflow-hidden">
                     <span className="text-[10px] font-bold text-slate-600">#{i + 1}</span>
                     <span className="text-xs text-slate-300 truncate">{item}</span>
                  </div>
                  <button onClick={() => removeItem(i)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400">
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
             ))}
          </div>

          <button
            onClick={exportPdf}
            disabled={items.length === 0 || loading}
            className="w-full py-4 bg-nexus-accent text-slate-900 font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-nexus-accent/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            Export Batch as PDF
          </button>
        </div>

        <ToolHistory toolId="qrpdf" />
      </div>
    </div>
  );
};

export default QrBatchExport;
