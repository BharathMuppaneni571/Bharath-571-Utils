import React, { useEffect } from 'react';
import { 
  FileJson, 
  Binary, 
  Image as ImageIcon, 
  Hash, 
  Ruler, 
  Type, 
  CodeXml, 
  StickyNote,
  ArrowUpRight,
  ShieldCheck,
  Link2,
  Calendar,
  Palette,
  Shield,
  Terminal,
  Clock,
  Pin,
  FileCode,
  Search,
  Edit3,
  Database,
  Table,
  FileQuestion,
  Globe,
  Minimize2,
  Maximize,
  FileText,
  QrCode
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface Tool {
  id: string;
  name: string;
  desc: string;
  icon: any;
  color: string;
}

const tools: Tool[] = [
  { id: 'json', name: 'JSON Formatter', desc: 'Prettify and validate JSON data.', icon: FileJson, color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'base64', name: 'Base64 Converter', desc: 'Encode and decode Base64 data.', icon: Binary, color: 'from-purple-500/20 to-pink-500/20' },
  { id: 'imgopt', name: 'Image Optimizer', desc: 'Compress images for the web.', icon: ImageIcon, color: 'from-emerald-500/20 to-teal-500/20' },
  { id: 'hash', name: 'Hash Generator', desc: 'Generate secure hashes easily.', icon: Hash, color: 'from-orange-500/20 to-red-500/20' },
  { id: 'unit', name: 'Unit Converter', desc: 'Convert measurement units.', icon: Ruler, color: 'from-indigo-500/20 to-blue-500/20' },
  { id: 'case', name: 'Text Case Converter', desc: 'Change text case styles.', icon: Type, color: 'from-yellow-500/20 to-orange-500/20' },
  { id: 'entity', name: 'Entity Encoder', desc: 'Safe HTML/URL encoding.', icon: CodeXml, color: 'from-pink-500/20 to-rose-500/20' },
  { id: 'notepad', name: 'Notepad', desc: 'Quick snippets & cloud notes.', icon: StickyNote, color: 'from-blue-500/20 to-indigo-500/20' },
  { id: 'password', name: 'Password Generator', desc: 'Create secure passwords.', icon: ShieldCheck, color: 'from-blue-500/20 to-indigo-500/20' },
  { id: 'url-shortener', name: 'URL Shortener', desc: 'Shorten links with TinyURL.', icon: Link2, color: 'from-cyan-500/20 to-blue-500/20' },
  { id: 'datetime', name: 'Date-Time Formatter', desc: 'Format cosmic timestamps.', icon: Calendar, color: 'from-orange-500/20 to-amber-500/20' },
  { id: 'color', name: 'Color Picker', desc: 'Convert HEX/RGB/HSL.', icon: Palette, color: 'from-rose-500/20 to-pink-500/20' },
  { id: 'jwt', name: 'JWT Sandbox', desc: 'Inspect JWT tokens.', icon: Shield, color: 'from-violet-500/20 to-purple-500/20' },
  { id: 'curl', name: 'cURL Converter', desc: 'cURL to Fetch JS.', icon: Terminal, color: 'from-slate-500/20 to-slate-400/20' },
  { id: 'cron', name: 'Cron Generator', desc: 'Build cron expressions.', icon: Clock, color: 'from-emerald-500/20 to-green-500/20' },
  { id: 'imagegen', name: 'AI Image Gen', desc: 'Generate images via AI prompts.', icon: ImageIcon, color: 'from-fuchsia-500/20 to-purple-500/20' },
  { id: 'epoch', name: 'Epoch Converter', icon: Clock, desc: 'Unix timestamp conversion.', color: 'from-amber-500/20 to-orange-500/20' },
  { id: 'jsonyaml', name: 'JSON ↔ YAML', icon: FileCode, desc: 'Convert between JSON and YAML.', color: 'from-blue-500/20 to-indigo-500/20' },
  { id: 'regex', name: 'RegEx Tester', icon: Search, desc: 'Test Regular Expressions.', color: 'from-red-500/20 to-rose-500/20' },
  { id: 'markdown', name: 'Markdown Editor', icon: Edit3, desc: 'Live Markdown preview.', color: 'from-slate-500/20 to-slate-400/20' },
  { id: 'mockdata', name: 'Mock Data Gen', icon: Database, desc: 'Generate dummy data sets.', color: 'from-emerald-500/20 to-teal-500/20' },
  { id: 'csvjson', name: 'CSV ↔ JSON', icon: Table, desc: 'Convert CSV to/from JSON.', color: 'from-cyan-500/20 to-blue-500/20' },
  { id: 'binhex', name: 'Binary ↔ Hex', icon: Binary, desc: 'Bitwise data conversion.', color: 'from-slate-500/20 to-indigo-500/20' },
  { id: 'filedetector', name: 'File Detector', icon: FileQuestion, desc: 'Identify file via magic bytes.', color: 'from-orange-500/20 to-rose-500/20' },
  { id: 'mimelookup', name: 'MIME Lookup', icon: FileCode, desc: 'Registry extension search.', color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'img2pdf', name: 'Images to PDF', icon: FileText, desc: 'Batch convert images.', color: 'from-orange-500/20 to-red-500/20' },
  { id: 'qr', name: 'QR Generator', icon: QrCode, desc: 'Create custom QR codes.', color: 'from-emerald-500/20 to-green-500/20' },
  { id: 'xmljson', name: 'XML ↔ JSON', icon: CodeXml, desc: 'Convert XML to/from JSON.', color: 'from-orange-500/20 to-yellow-500/20' },
  { id: 'minify', name: 'Code Minifier', icon: Minimize2, desc: 'Compress JS/CSS/HTML.', color: 'from-slate-500/20 to-slate-400/20' },
  { id: 'jsonpath', name: 'JSONPath Extractor', icon: Search, desc: 'Query JSON with paths.', color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'handlebars', name: 'Handlebars Binder', icon: FileCode, desc: 'Template data binding.', color: 'from-orange-500/20 to-rose-500/20' },
  { id: 'odata', name: 'OData Builder', icon: Database, desc: 'Build OData query URLs.', color: 'from-blue-500/20 to-indigo-500/20' },
  { id: 'qrpdf', name: 'QR Batch Export', icon: FileText, desc: 'Export QR batch as PDF.', color: 'from-emerald-500/20 to-teal-500/20' },
  { id: 'restapi', name: 'REST Client', icon: Globe, desc: 'Lightweight API testing.', color: 'from-fuchsia-500/20 to-purple-500/20' },
  { id: 'cropresize', name: 'Image Resize', icon: Maximize, desc: 'Scale images to pixels.', color: 'from-slate-500/20 to-blue-500/20' },
];

const Dashboard: React.FC = () => {
  const { setActiveTool, pinnedTools, togglePin, loadPinnedTools } = useAppStore();

  useEffect(() => {
    loadPinnedTools();
  }, [loadPinnedTools]);

  const pinnedList = tools.filter(t => pinnedTools.includes(t.id));
  const otherList = tools.filter(t => !pinnedTools.includes(t.id));

  const renderGrid = (items: Tool[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((tool) => {
        const Icon = tool.icon;
        const isPinned = pinnedTools.includes(tool.id);
        return (
          <div
            key={tool.id}
            className="glass p-4 rounded-xl text-left group hover:scale-[1.02] hover:bg-white/10 transition-all duration-200 relative overflow-hidden cursor-pointer border border-white/5"
            onClick={() => setActiveTool(tool.id as any)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                togglePin(tool.id);
              }}
              className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all z-20 ${
                isPinned ? 'bg-nexus-accent text-slate-900 opacity-100' : 'bg-white/5 text-slate-500 opacity-0 group-hover:opacity-100'
              }`}
            >
              <Pin className={`w-3 h-3 ${isPinned ? 'fill-current' : ''}`} />
            </button>

            <div className="relative z-10">
              <div className="bg-white/5 w-9 h-9 rounded-lg flex items-center justify-center mb-3 group-hover:bg-nexus-accent/20 group-hover:text-nexus-accent transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-1 flex items-center justify-between">
                {tool.name}
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-y-0.5 translate-x-0.5 transition-all" />
              </h3>
              <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">
                {tool.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 mt-0">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold glow-text mb-1">Nexus-571</h1>
        <p className="text-slate-400 text-xs md:text-sm">Universal Developer Utility Dashboard</p>
      </div>

      {pinnedList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="w-3.5 h-3.5 text-nexus-accent" />
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Pinned</h2>
          </div>
          {renderGrid(pinnedList)}
        </div>
      )}

      <div className="space-y-3">
        {pinnedList.length > 0 && (
          <div className="pt-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">All Tools</h2>
          </div>
        )}
        {renderGrid(otherList)}
      </div>
    </div>
  );
};

export default Dashboard;
