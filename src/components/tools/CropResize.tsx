import React, { useState, useRef } from 'react';
import { Maximize, Download, Image as ImageIcon } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const CropResize: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { recordAction } = useToolState(
    'cropresize',
    () => {},
    () => ({})
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const img = new Image();
      img.onload = () => {
        setImage(event.target.result);
        setWidth(img.width);
        setHeight(img.height);
        setAspectRatio(img.width / img.height);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    recordAction();
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainAspect) setHeight(Math.round(val / aspectRatio));
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (maintainAspect) setWidth(Math.round(val * aspectRatio));
  };

  const downloadResized = () => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `nexus-resized-${Date.now()}.png`;
      link.click();
    };
    img.src = image;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <Maximize className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">Image Resize</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Visual Engine</p>
          </div>
        </div>

        <div className="space-y-8">
          {!image ? (
            <div className="relative">
              <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="border-2 border-dashed border-white/10 rounded-3xl p-16 text-center hover:border-nexus-accent/50 transition-all bg-white/5">
                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300 font-bold mb-1">Click to upload image</p>
                <p className="text-slate-500 text-xs">JPEG, PNG, WebP supported.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="aspect-square glass bg-slate-950/30 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
                     <img src={image} className="max-w-full max-h-full object-contain" alt="Original" />
                  </div>
                  <button onClick={() => setImage(null)} className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-all">
                     Remove Image
                  </button>
               </div>

               <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Width (px)</label>
                        <input
                          type="number"
                          className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-3 font-mono text-white focus:border-nexus-accent"
                          value={width}
                          onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Height (px)</label>
                        <input
                          type="number"
                          className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-3 font-mono text-white focus:border-nexus-accent"
                          value={height}
                          onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                        />
                     </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group">
                     <div className={`w-10 h-5 rounded-full transition-colors relative ${maintainAspect ? 'bg-nexus-accent' : 'bg-slate-700'}`}>
                        <input type="checkbox" className="sr-only" checked={maintainAspect} onChange={() => setMaintainAspect(!maintainAspect)} />
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${maintainAspect ? 'left-6' : 'left-1'}`} />
                     </div>
                     <span className="text-sm text-slate-300 font-medium">Maintain Aspect Ratio</span>
                  </label>

                  <button
                    onClick={downloadResized}
                    className="w-full py-4 bg-nexus-accent text-slate-900 font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-nexus-accent/20"
                  >
                    <Download className="w-5 h-5" /> Download Resized
                  </button>

                  <canvas ref={canvasRef} className="hidden" />
               </div>
            </div>
          )}
        </div>

        <ToolHistory toolId="cropresize" />
      </div>
    </div>
  );
};

export default CropResize;
