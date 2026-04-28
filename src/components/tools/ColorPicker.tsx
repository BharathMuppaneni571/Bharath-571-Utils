import React, { useState, useEffect } from 'react';
import { Copy, Palette, Pipette } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const ColorPicker: React.FC = () => {
  const [color, setColor] = useState('#009688');
  const [formats, setFormats] = useState<{ hex: string; rgb: string; hsl: string } | null>(null);

  const { recordAction } = useToolState(
    'color-picker',
    (values: any) => {
      if (values.color !== undefined) setColor(values.color);
      if (values.formats !== undefined) setFormats(values.formats);
    },
    () => ({ color, formats })
  );

  const convertColor = (hex: string) => {
    // HEX to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // RGB to HSL
    const rN = r / 255, gN = g / 255, bN = b / 255;
    const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rN: h = (gN - bN) / d + (gN < bN ? 6 : 0); break;
        case gN: h = (bN - rN) / d + 2; break;
        case bN: h = (rN - gN) / d + 4; break;
      }
      h = Math.round(h * 60);
    }

    const newFormats = {
      hex: hex.toUpperCase(),
      rgb: `${r}, ${g}, ${b}`,
      hsl: `${h}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`
    };
    setFormats(newFormats);
  };

  useEffect(() => {
    convertColor(color);
  }, [color]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    recordAction();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="w-8 h-8 text-nexus-accent" />
        <h2 className="text-2xl font-bold glow-text">Color Picker & Converter</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Select Color</label>
            <div className="flex gap-4 items-center bg-slate-950/50 border border-white/10 p-4 rounded-xl">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-20 h-20 bg-transparent rounded-lg cursor-pointer border-none p-0 overflow-hidden"
              />
              <div className="flex-1 space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">#</span>
                  <input
                    type="text"
                    value={color.replace('#', '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                        setColor(val.length === 6 ? `#${val}` : color);
                      }
                    }}
                    className="w-full bg-slate-900 border border-white/5 rounded-lg py-2 pl-7 pr-3 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors uppercase"
                  />
                </div>
                <p className="text-[10px] text-slate-500 italic">Enter hex or use the picker</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center min-h-[160px]" style={{ backgroundColor: color }}>
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }} />
            <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold shadow-xl border border-white/10 flex items-center gap-2">
               <Pipette className="w-4 h-4" /> Preview
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Formats</label>
          
          <div className="space-y-4">
            <div className="group relative">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">HEX</span>
                <button onClick={() => copyToClipboard(formats?.hex || '')} className="text-nexus-accent hover:text-white transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-4 bg-slate-950/50 border border-white/10 rounded-xl font-mono text-lg text-slate-200">
                {formats?.hex}
              </div>
            </div>

            <div className="group relative">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">RGB</span>
                <button onClick={() => copyToClipboard(`rgb(${formats?.rgb})` || '')} className="text-nexus-accent hover:text-white transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-4 bg-slate-950/50 border border-white/10 rounded-xl font-mono text-lg text-slate-200">
                {formats?.rgb}
              </div>
            </div>

            <div className="group relative">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">HSL</span>
                <button onClick={() => copyToClipboard(`hsl(${formats?.hsl.replace('°', '')})` || '')} className="text-nexus-accent hover:text-white transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-4 bg-slate-950/50 border border-white/10 rounded-xl font-mono text-lg text-slate-200">
                {formats?.hsl}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToolHistory toolId="color-picker" />
    </div>
  );
};

export default ColorPicker;
