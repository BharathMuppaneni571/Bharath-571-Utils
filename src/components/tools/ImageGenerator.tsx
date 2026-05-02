import React, { useState } from 'react';
import { Image as ImageIcon, Wand2, Download, AlertCircle, Loader2 } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [source, setSource] = useState('pollinations');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'imagegen',
    (values: any) => {
      if (values.prompt !== undefined) setPrompt(values.prompt);
      if (values.source !== undefined) setSource(values.source);
      if (values.imageUrl !== undefined) setImageUrl(values.imageUrl);
    },
    () => ({ prompt, source, imageUrl })
  );

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for the image.');
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      let url = '';
      const timestamp = Date.now();
      const encodedPrompt = encodeURIComponent(prompt.trim());

      switch (source) {
        case 'pollinations':
          url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${timestamp}`;
          break;
        case 'dicebear':
          url = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodedPrompt}&size=1024&backgroundColor=0f172a`;
          break;
        case 'robohash':
          url = `https://robohash.org/${encodedPrompt}?size=1024x1024&set=set4`;
          break;
        case 'picsum':
          url = `https://picsum.photos/seed/${encodedPrompt}/1024/1024`;
          break;
        default:
          url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${timestamp}`;
      }

      // Pre-load image to handle errors and show loading state accurately
      const img = new Image();
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image from service.'));
      });

      setImageUrl(url);
      recordAction();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nexus-gen-${Date.now()}.${source === 'dicebear' ? 'svg' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <Wand2 className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">AI Image Generator</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Creative</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Prompt / Description</label>
              <textarea
                className="w-full h-40 bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-sans text-sm focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner text-white"
                placeholder="Describe the image you want to generate... (e.g., 'A futuristic cyberpunk city at sunset with neon lights')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">AI Engine Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-nexus-accent/50 transition-all text-white appearance-none cursor-pointer"
              >
                <option value="pollinations">Pollinations.ai (Stable Diffusion)</option>
                <option value="dicebear">DiceBear (Abstract Shapes)</option>
                <option value="robohash">Robohash (Robot/Avatar Gen)</option>
                <option value="picsum">Picsum (Unsplash Photos)</option>
              </select>
            </div>

            <button
              onClick={generateImage}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                loading 
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-nexus-accent to-emerald-400 text-slate-900 hover:scale-[1.02] active:scale-[0.98] shadow-nexus-accent/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="space-y-4 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Result Preview</label>
              {imageUrl && !loading && (
                <button
                  onClick={downloadImage}
                  className="text-[10px] font-bold flex items-center gap-1.5 text-nexus-accent hover:text-white transition-all uppercase tracking-widest px-3 py-1 bg-nexus-accent/10 rounded-full"
                >
                  <Download className="w-3 h-3" /> Save Image
                </button>
              )}
            </div>
            
            <div className="flex-1 glass bg-slate-950/30 rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center relative group min-h-[400px]">
              {loading ? (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 border-4 border-nexus-accent/30 border-t-nexus-accent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-500 text-sm animate-pulse">Rendering pixels...</p>
                </div>
              ) : imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={prompt}
                  className="w-full h-full object-contain animate-in zoom-in-95 duration-500"
                />
              ) : (
                <div className="text-center px-10">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-slate-700" />
                  </div>
                  <p className="text-slate-600 text-sm">Your AI masterpiece will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <ToolHistory toolId="imagegen" />
      </div>
    </div>
  );
};

export default ImageGenerator;
