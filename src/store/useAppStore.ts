import { create } from 'zustand';
import { Storage, authenticatedFetch } from '../lib/api';

export type ToolId = 'dashboard' | 'json' | 'base64' | 'imgopt' | 'hash' | 'unit' | 'case' | 'entity' | 'notepad' | 'password' | 'url-shortener' | 'datetime' | 'color' | 'jwt' | 'curl' | 'cron' | 'imagegen' | 'epoch' | 'jsonyaml' | 'regex' | 'markdown' | 'mockdata' | 'csvjson' | 'binhex' | 'filedetector' | 'mimelookup' | 'img2pdf' | 'qr' | 'xmljson' | 'minify' | 'jsonpath' | 'handlebars' | 'odata' | 'qrpdf' | 'restapi' | 'cropresize' | 'url' | 'settings';

interface AppState {
  activeTool: ToolId;
  setActiveTool: (tool: ToolId) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isCommandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  pinnedTools: string[];
  loadPinnedTools: () => Promise<void>;
  togglePin: (toolId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTool: 'dashboard',
  setActiveTool: (tool) => set({ activeTool: tool }),
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isCommandPaletteOpen: false,
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  pinnedTools: [],

  loadPinnedTools: async () => {
    try {
      const res = await authenticatedFetch('/api/prefs?key=pinnedTools');
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          set({ pinnedTools: JSON.parse(data.value) });
          return;
        }
      }
    } catch (e) {}
    
    const local = await Storage.get('pinnedTools');
    if (local) {
      set({ pinnedTools: JSON.parse(local) });
    }
  },

  togglePin: async (toolId) => {
    const current = get().pinnedTools;
    const next = current.includes(toolId) 
      ? current.filter(id => id !== toolId) 
      : [...current, toolId];
    
    set({ pinnedTools: next });
    
    await Storage.set('pinnedTools', JSON.stringify(next));
    await authenticatedFetch('/api/prefs', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ key: 'pinnedTools', value: JSON.stringify(next) }) 
    }).catch(() => {});
  }
}));
