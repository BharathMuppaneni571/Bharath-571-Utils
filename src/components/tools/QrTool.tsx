import React, { useState } from 'react';
import { QrCode, Save } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';
import QRCode from 'qrcode';

const QrTool: React.FC = () => {
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'qr',
    (values: any) => {
      if (values.text !== undefined) setText(values.text);
    },
    () => ({ text })
  );

  const generateQr = async () => {
    if (!text) return;
    try {
      const url = await QRCode.toDataURL(text, {
        width: 512,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      setQrUrl(url);
      recordAction();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadQr = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `nexus-qr-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <QrCode className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">QR Code Generator</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Visual Engine</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Content (URL or Text)</label>
              <textarea
                className="w-full h-32 bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-sans text-sm focus:outline-none focus:border-nexus-accent/50 transition-all resize-none shadow-inner text-white"
                placeholder="https://nexus-571.com"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <button
              onClick={generateQr}
              className="w-full py-4 bg-nexus-accent text-slate-900 font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              Generate QR Code
            </button>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
             {qrUrl ? (
               <div className="animate-in zoom-in-95 duration-300">
                 <div className="p-4 bg-white rounded-3xl shadow-2xl">
                   <img src={qrUrl} className="w-64 h-64" alt="Generated QR" />
                 </div>
                 <button
                   onClick={downloadQr}
                   className="mt-6 w-full py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-slate-300 hover:text-white transition-all text-sm font-bold"
                 >
                   <Save className="w-4 h-4" /> Download PNG
                 </button>
               </div>
             ) : (
               <div className="text-center space-y-4 text-slate-600 px-10">
                 <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto">
                    <QrCode className="w-10 h-10" />
                 </div>
                 <p className="text-sm">Enter text on the left to generate your QR code.</p>
               </div>
             )}
          </div>
        </div>

        <ToolHistory toolId="qr" />
      </div>
    </div>
  );
};

export default QrTool;
