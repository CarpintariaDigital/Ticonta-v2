import { create } from "zustand";
import { authService, User, AuthTokens } from "@/services/auth";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens) => void;
  login: (pin: string, companyId?: number) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setTokens: (tokens) => {
    set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      isAuthenticated: true,
    });
  },

  login: async (pin, companyId) => {
    set({ isLoading: true });
    try {
      const tokens = await authService.login(pin, companyId);
      get().setTokens(tokens);
      const user = await authService.getCurrentUser();
      get().setUser(user);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  refreshSession: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return;
    try {
      const tokens = await authService.refreshToken(refreshToken);
      get().setTokens(tokens);
    } catch {
      get().logout();
    }
  },
}));
