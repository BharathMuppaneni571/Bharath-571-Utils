import React from 'react';
import { 
  LayoutDashboard, 
  FileJson, 
  Binary, 
  Image as ImageIcon, 
  Hash, 
  Ruler, 
  Type, 
  CodeXml, 
  StickyNote,
  Menu,
  ChevronLeft,
  ShieldCheck,
  Link2,
  Calendar,
  Palette,
  Shield,
  Terminal,
  Clock
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const tools = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'json', name: 'JSON Formatter', icon: FileJson },
  { id: 'base64', name: 'Base64 Converter', icon: Binary },
  { id: 'imgopt', name: 'Image Optimizer', icon: ImageIcon },
  { id: 'hash', name: 'Hash Generator', icon: Hash },
  { id: 'unit', name: 'Unit Converter', icon: Ruler },
  { id: 'case', name: 'Text Case Converter', icon: Type },
  { id: 'entity', name: 'Entity Encoder', icon: CodeXml },
  { id: 'notepad', name: 'Notepad', icon: StickyNote },
  { id: 'password', name: 'Password Generator', icon: ShieldCheck },
  { id: 'url-shortener', name: 'URL Shortener', icon: Link2 },
  { id: 'datetime', name: 'Date-Time Formatter', icon: Calendar },
  { id: 'color', name: 'Color Picker', icon: Palette },
  { id: 'jwt', name: 'JWT Sandbox', icon: Shield },
  { id: 'curl', name: 'cURL Converter', icon: Terminal },
  { id: 'cron', name: 'Cron Generator', icon: Clock },
] as const;

const Sidebar: React.FC = () => {
  const { activeTool, setActiveTool, isSidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside 
      className={`glass h-screen sticky top-0 transition-all duration-300 flex flex-col z-50 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className={`p-4 border-b border-white/10 shrink-0 flex ${isSidebarOpen ? 'flex-row items-center gap-3' : 'flex-col items-center gap-4'}`}>
        {isSidebarOpen ? (
          <>
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-nexus-accent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveTool('dashboard')}
              className="flex items-center gap-3 overflow-hidden transition-transform active:scale-95"
            >
              <div className="w-8 h-8 bg-white rounded-lg p-1 shrink-0 shadow-lg">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-lg tracking-tight glow-text whitespace-nowrap">Nexus-571</span>
            </button>
          </>
        ) : (
          <>
            <div className="w-8 h-8 bg-white rounded-lg p-1 shrink-0 shadow-lg pointer-events-none">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-nexus-accent"
            >
              <Menu className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar min-h-0">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-nexus-accent text-slate-900 shadow-[0_0_20px_rgba(20,184,166,0.3)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
              {isSidebarOpen && (
                <span className="font-medium whitespace-nowrap">{tool.name}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
