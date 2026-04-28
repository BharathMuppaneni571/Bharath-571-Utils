import { create } from 'zustand';
import { Storage, authenticatedFetch } from '../lib/api';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  isLoading: boolean;
  error: string | null;
  login: (u: string, p: string, silent?: boolean) => Promise<boolean>;
  loginGuest: () => Promise<boolean>;
  register: (u: string, p: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setAuthenticated: (status: boolean, username?: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  username: null,
  isLoading: true,
  error: null,

  setAuthenticated: (status, username) => {
    set({ isAuthenticated: status, username: username || null });
  },

  checkAuth: async () => {
    try {
      const token = await Storage.get('bharath_utils_auth_token');
      const username = await Storage.get('bharath_utils_username');
      if (token && username) {
        set({ isAuthenticated: true, username, isLoading: false });
      } else {
        set({ isAuthenticated: false, username: null, isLoading: false });
      }
    } catch (error) {
      set({ isAuthenticated: false, username: null, isLoading: false });
    }
  },

  login: async (username, password, silent = false) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authenticatedFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (res.ok && data.token) {
        await Storage.set('bharath_utils_auth_token', data.token);
        await Storage.set('bharath_utils_username', username);
        if (!silent) {
          set({ isAuthenticated: true, username, isLoading: false, error: null });
        } else {
          set({ isLoading: false, error: null });
        }
        return true;
      } else {
        set({ error: data.error || 'Login failed', isLoading: false });
        return false;
      }
    } catch (e: any) {
      set({ error: e.message || 'Network error', isLoading: false });
      return false;
    }
  },

  loginGuest: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    await Storage.set('bharath_utils_auth_token', 'guest-local-token');
    await Storage.set('bharath_utils_username', 'Guest');
    set({ isAuthenticated: true, username: 'Guest', isLoading: false, error: null });
    return true;
  },

  register: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authenticatedFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        set({ isLoading: false, error: null });
        return true;
      } else {
        set({ error: data.error || 'Registration failed', isLoading: false });
        return false;
      }
    } catch (e: any) {
      set({ error: e.message || 'Network error', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await Storage.remove('bharath_utils_auth_token');
    await Storage.remove('bharath_utils_username');
    set({ isAuthenticated: false, username: null });
  }
}));

if (typeof window !== 'undefined') {
  window.addEventListener('nexus-unauthorized', () => {
    useAuthStore.getState().logout();
  });
}
