import { create } from 'zustand';
import { User } from '@/types';
import { authAPI } from '@/lib/api';
import { socketService } from '@/lib/socket';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, profile?: any) => Promise<void>;
  guestLogin: (username?: string, profile?: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUserFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await authAPI.login({ email, password });

      get().setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      set({ user: data.user, isAuthenticated: true });

      // Connect to socket
      socketService.connect(data.tokens.accessToken);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password, username, profile) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await authAPI.register({ email, password, username, profile });

      get().setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      set({ user: data.user, isAuthenticated: true });

      // Connect to socket
      socketService.connect(data.tokens.accessToken);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  guestLogin: async (username, profile) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await authAPI.guestLogin({ username, profile });

      get().setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      set({ user: data.user, isAuthenticated: true });

      // Connect to socket
      socketService.connect(data.tokens.accessToken);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Guest login failed';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      socketService.disconnect();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  },

  loadUserFromStorage: () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken });
      // Connect to socket
      socketService.connect(accessToken);
    }
  },
}));
