import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  loadStoredAuth: () => Promise<boolean>;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sehatica_access_token',
  REFRESH_TOKEN: 'sehatica_refresh_token',
  USER: 'sehatica_user',
};

// Helper to handle storage across native and web
const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      try { localStorage.setItem(key, value); } catch (e) {}
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async deleteItem(key: string) {
    if (Platform.OS === 'web') {
      try { localStorage.removeItem(key); } catch (e) {}
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: async (user, accessToken, refreshToken) => {
    try {
      await Promise.all([
        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      ]);
      set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
    } catch (err) {
      console.error('Failed to store auth:', err);
      set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
    }
  },

  clearAuth: async () => {
    try {
      await Promise.all([
        storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN),
        storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
        storage.deleteItem(STORAGE_KEYS.USER),
      ]);
    } catch (err) {
      console.error('Failed to clear auth storage:', err);
    }
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  setAccessToken: (token) => set({ accessToken: token }),

  setUser: (user) => {
    set({ user });
    storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)).catch(console.error);
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });
    try {
      const [accessToken, refreshToken, userJson] = await Promise.all([
        storage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        storage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        storage.getItem(STORAGE_KEYS.USER),
      ]);

      if (accessToken && refreshToken && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
        return true;
      }
    } catch (err) {
      console.error('Failed to load stored auth:', err);
    }
    set({ isLoading: false });
    return false;
  },
}));
