import { create } from 'zustand';
import { authenticatedFetch } from '../lib/api';

export interface HistoryRecord {
  id: number;
  toolId: string;
  payload: string;
  created_at: string;
}

interface HistoryState {
  records: HistoryRecord[];
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  fetchHistory: (toolId: string) => Promise<void>;
  saveHistory: (toolId: string, payload: any) => Promise<void>;
  clearHistory: (toolId: string) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  records: [],
  isLoading: false,
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  
  fetchHistory: async (toolId) => {
    set({ isLoading: true });
    try {
      const res = await authenticatedFetch(`/api/history?tool=${encodeURIComponent(toolId)}`);
      if (res.ok) {
        const data = await res.json();
        set({ records: data, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to fetch history', error);
      set({ isLoading: false });
    }
  },

  saveHistory: async (toolId, payload) => {
    try {
      await authenticatedFetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, payload })
      });
      get().fetchHistory(toolId);
    } catch (error) {
      console.error('Failed to save history', error);
    }
  },

  clearHistory: async (toolId) => {
    try {
      await authenticatedFetch(`/api/history?tool=${encodeURIComponent(toolId)}`, {
        method: 'DELETE'
      });
      set({ records: [] });
    } catch (error) {
      console.error('Failed to clear history', error);
    }
  }
}));
