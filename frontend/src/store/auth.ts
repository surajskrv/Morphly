import { create } from 'zustand';
import api from '@/services/api';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  // Keep initial state SSR-safe to avoid hydration mismatches.
  token: null,
  isAuthenticated: false,
  login: (token, user, refreshToken) => {
    localStorage.setItem('token', token);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    // Fire-and-forget: blacklist the token server-side
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    set({ token: null, user: null, isAuthenticated: false });
  },
  checkAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      set({ token: null, user: null, isAuthenticated: false });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      set({ token, user: res.data, isAuthenticated: true });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, isAuthenticated: false });
    }
  }
}));
