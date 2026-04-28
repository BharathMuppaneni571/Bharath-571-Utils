import { create } from 'zustand';
import { Storage, authenticatedFetch } from '../lib/api';

export type AppTheme = 'dark' | 'light';

interface ThemeState {
  theme: AppTheme;
  accentColor: string;
  setTheme: (theme: AppTheme) => void;
  setAccentColor: (color: string) => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  accentColor: '#14b8a6', // default nexus-accent
  setTheme: async (theme) => {
    await Storage.set('appMode', theme);
    set({ theme });
    document.body.className = theme === 'dark' ? '' : 'light-mode';
    await authenticatedFetch('/api/prefs', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ key: 'appMode', value: theme }) 
    }).catch(() => {});
  },
  setAccentColor: async (color) => {
    await Storage.set('appAccentColor', color);
    set({ accentColor: color });
    document.documentElement.style.setProperty('--color-nexus-accent', color);
    await authenticatedFetch('/api/prefs', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ key: 'appAccentColor', value: color }) 
    }).catch(() => {});
  },
  loadTheme: async () => {
    // Try to load from cloud first
    try {
      const resMode = await authenticatedFetch('/api/prefs?key=appMode');
      if (resMode.ok) {
        const dataMode = await resMode.json();
        if (dataMode.value === 'dark' || dataMode.value === 'light') {
          set({ theme: dataMode.value });
          document.body.className = dataMode.value === 'dark' ? '' : 'light-mode';
        }
      }
      
      const resColor = await authenticatedFetch('/api/prefs?key=appAccentColor');
      if (resColor.ok) {
        const dataColor = await resColor.json();
        if (dataColor.value) {
          set({ accentColor: dataColor.value });
          document.documentElement.style.setProperty('--color-nexus-accent', dataColor.value);
        }
      }
    } catch (e) {
      // Fallback to local storage
      const savedTheme = await Storage.get('appMode') as AppTheme;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        set({ theme: savedTheme });
        document.body.className = savedTheme === 'dark' ? '' : 'light-mode';
      }
      
      const savedColor = await Storage.get('appAccentColor');
      if (savedColor) {
        set({ accentColor: savedColor });
        document.documentElement.style.setProperty('--color-nexus-accent', savedColor);
      }
    }
  }
}));
