import React, { useState, useRef } from 'react';
import { Upload, Download, Image as ImageIcon, Settings } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const ImageOptimizer: React.FC = () => {
  const [quality, setQuality] = useState(0.8);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [optimizedUrl, setOptimizedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { recordAction } = useToolState(
    'image-optimizer',
    (values: any) => {
      if (values.quality !== undefined) setQuality(values.quality);
      if (values.optimizedUrl !== undefined) setOptimizedUrl(values.optimizedUrl);
    },
    () => ({ quality, optimizedUrl })
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFile(file);
      optimizeImage(file, quality);
    }
  };

  const optimizeImage = (file: File, q: number) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', q);
          setOptimizedUrl(dataUrl);
          setIsProcessing(false);
          recordAction();
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!optimizedUrl) return;
    const a = document.createElement('a');
    a.href = optimizedUrl;
    a.download = 'optimized-image.jpg';
    a.click();
  };

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ImageIcon className="w-8 h-8 text-nexus-accent" />
        <h2 className="text-2xl font-bold glow-text">Image Optimizer</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 hover:border-nexus-accent/50 hover:bg-white/5 transition-all cursor-pointer group"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden" 
            />
            <div className="w-16 h-16 bg-nexus-accent/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-nexus-accent" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-200">Click to upload or drag and drop</p>
              <p className="text-sm text-slate-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
            </div>
          </div>

          <div className="space-y-4 glass p-4 rounded-xl border-white/5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-3 h-3" /> Compression Quality
              </label>
              <span className="text-nexus-accent font-mono font-bold">{Math.round(quality * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.05"
              value={quality}
              onChange={(e) => {
                const q = parseFloat(e.target.value);
                setQuality(q);
                if (originalFile) optimizeImage(originalFile, q);
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-nexus-accent"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>Small Size</span>
              <span>Best Quality</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Preview</label>
          <div className="flex-1 min-h-[300px] bg-slate-950/50 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden relative">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-nexus-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-500 font-medium">Optimizing...</span>
              </div>
            ) : optimizedUrl ? (
              <img src={optimizedUrl} alt="Optimized" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-slate-600 flex flex-col items-center gap-2">
                <ImageIcon className="w-12 h-12 opacity-20" />
                <span className="text-sm italic">No image selected</span>
              </div>
            )}
          </div>
          <button 
            disabled={!optimizedUrl || isProcessing}
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-nexus-accent to-nexus-violet text-white font-bold py-4 rounded-xl shadow-xl shadow-nexus-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100"
          >
            <Download className="w-5 h-5" /> Download Optimized Image
          </button>
        </div>
      </div>

      <ToolHistory toolId="image-optimizer" />
    </div>
  );
};

export default ImageOptimizer;
