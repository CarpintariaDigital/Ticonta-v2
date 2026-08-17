import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthTokens, authService, UserProfile } from "@/services/auth";

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, pin: string) => Promise<void>;
  register: (username: string, pin: string, role?: string, email?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, pin: string) => {
        set({ isLoading: true, error: null });
        try {
          const tokens = await authService.login(username, pin);
          const user = await authService.getMe(tokens.access_token);
          set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          const message = err.response?.data?.detail || "Falha na autenticação. Verifique os dados.";
          set({ error: message, isLoading: false, isAuthenticated: false });
          throw new Error(message);
        }
      },

      register: async (username: string, pin: string, role = "operator", email?: string) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(username, pin, role, email);
          set({ isLoading: false });
        } catch (err: any) {
          const message = err.response?.data?.detail || "Erro ao criar conta.";
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setTokens: (tokens) =>
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
        }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "ticonta_auth_storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
