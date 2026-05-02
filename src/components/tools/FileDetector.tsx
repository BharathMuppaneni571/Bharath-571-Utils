import React, { useState } from 'react';
import { FileQuestion } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const MAGIC_BYTES: { [key: string]: string } = {
  'ffd8ffe0': 'image/jpeg',
  '89504e47': 'image/png',
  '47494638': 'image/gif',
  '25504446': 'application/pdf',
  '504b0304': 'application/zip (or Office doc)',
  '7b0a': 'application/json',
  '3c21646f': 'text/html',
  '49443303': 'audio/mpeg (MP3)'
};

const FileDetector: React.FC = () => {
  const [fileInfo, setFileInfo] = useState<any>(null);

  const { recordAction } = useToolState(
    'filedetector',
    () => {},
    () => ({})
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: any) => {
      const arr = new Uint8Array(event.target.result).subarray(0, 4);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16).padStart(2, '0');
      }

      setFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type || 'unknown',
        magic: header,
        detected: MAGIC_BYTES[header] || 'Unknown binary format'
      });
      recordAction();
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <FileQuestion className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">File Type Detector</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Inspector</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="relative">
            <input
              type="file"
              onChange={handleFile}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-nexus-accent/50 transition-all bg-white/5">
              <FileQuestion className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 font-bold mb-1">Click or drag a file to inspect</p>
              <p className="text-slate-500 text-xs">Analyzes magic bytes for accurate detection.</p>
            </div>
          </div>

          {fileInfo && (
            <div className="glass bg-slate-950/30 rounded-2xl border border-white/5 p-6 space-y-4 animate-in zoom-in-95">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow label="File Name" value={fileInfo.name} />
                <InfoRow label="File Size" value={fileInfo.size} />
                <InfoRow label="Browser Mime" value={fileInfo.type} />
                <InfoRow label="Magic Bytes" value={fileInfo.magic.toUpperCase()} />
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Detected Format</p>
                <p className="text-xl font-bold text-nexus-accent">{fileInfo.detected}</p>
              </div>
            </div>
          )}
        </div>

        <ToolHistory toolId="filedetector" />
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-mono text-slate-300 truncate">{value}</p>
  </div>
);

export default FileDetector;
