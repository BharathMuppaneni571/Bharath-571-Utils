import React, { useState } from 'react';
import { FileText, Trash2, Download, Plus, Loader2 } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';
import { jsPDF } from 'jspdf';

const Img2Pdf: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { recordAction } = useToolState(
    'img2pdf',
    () => {},
    () => ({})
  );

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        setImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
    recordAction();
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setLoading(true);
    try {
      const pdf = new jsPDF();
      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();
        const img = images[i];
        const props = pdf.getImageProperties(img);
        const width = pdf.internal.pageSize.getWidth();
        const height = (props.height * width) / props.width;
        pdf.addImage(img, 'JPEG', 0, 0, width, height);
      }
      pdf.save(`nexus-export-${Date.now()}.pdf`);
      recordAction();
    } catch (err) {
      console.error('PDF Generation failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">Images to PDF</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Document Forge</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="relative group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFiles}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-nexus-accent/50 transition-all bg-white/5">
              <Plus className="w-12 h-12 text-slate-600 mx-auto mb-4 group-hover:text-nexus-accent transition-colors" />
              <p className="text-slate-300 font-bold mb-1">Add Images to PDF</p>
              <p className="text-slate-500 text-xs">Support JPG, PNG, WebP. Multiple files allowed.</p>
            </div>
          </div>

          {images.length > 0 && (
            <div className="space-y-6 animate-in slide-in-from-top-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden aspect-[3/4] border border-white/10 bg-slate-900">
                    <img src={img} className="w-full h-full object-cover" alt={`Page ${i + 1}`} />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => removeImage(i)}
                        className="bg-red-500/80 p-2 rounded-lg hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-nexus-accent text-slate-900 text-[10px] font-bold rounded">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={generatePdf}
                disabled={loading}
                className="w-full py-4 bg-nexus-accent text-slate-900 font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-nexus-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Generate PDF ({images.length} Pages)
              </button>
            </div>
          )}
        </div>

        <ToolHistory toolId="img2pdf" />
      </div>
    </div>
  );
};

export default Img2Pdf;
