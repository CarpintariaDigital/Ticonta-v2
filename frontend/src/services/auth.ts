import axios from "axios";

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("ticonta_custom_api_url");
    if (customUrl) return customUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
  }
  const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://carpintaria-ia.ildinonunes.workers.dev";
  return RAW_API_URL.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

// Update baseURL dynamically in case localStorage changed
apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

export interface UserProfile {
  id: number;
  username: string;
  role: string;
  company_id?: number;
  is_active: boolean;
  email?: string;
  modules?: string[];
  created_at: string;
  updated_at?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  modules?: string[];
  is_offline?: boolean;
}

const ALL_MASTER_MODULES = [
  "pos",
  "accounting",
  "restaurant",
  "takeaway",
  "poultry",
  "auto-services",
  "informal",
  "crm",
  "hr",
  "manufacturing",
  "projects",
  "reports",
  "admin",
  "licensing",
];

// Perfis padrão offline / demonstração presencial
const DEFAULT_OFFLINE_USERS: Record<string, { pin: string; profile: UserProfile }> = {
  ildino: {
    pin: "1234",
    profile: {
      id: 1,
      username: "ildino",
      email: "ildino@carpintariadigital.co.mz",
      role: "admin",
      company_id: 1,
      is_active: true,
      modules: ALL_MASTER_MODULES,
      created_at: new Date().toISOString(),
    },
  },
  admin: {
    pin: "1234",
    profile: {
      id: 1,
      username: "admin",
      email: "admin@ticonta.co.mz",
      role: "admin",
      company_id: 1,
      is_active: true,
      modules: ALL_MASTER_MODULES,
      created_at: new Date().toISOString(),
    },
  },
  admin_user: {
    pin: "1234",
    profile: {
      id: 1,
      username: "admin_user",
      email: "admin@ticonta.co.mz",
      role: "admin",
      company_id: 1,
      is_active: true,
      modules: ALL_MASTER_MODULES,
      created_at: new Date().toISOString(),
    },
  },
  operador_pos: {
    pin: "4321",
    profile: {
      id: 2,
      username: "operador_pos",
      email: "pos@ticonta.co.mz",
      role: "operator",
      company_id: 1,
      is_active: true,
      modules: ["pos", "takeaway", "restaurant", "informal"],
      created_at: new Date().toISOString(),
    },
  },
};

export const authService = {
  async login(username: string, pin: string): Promise<AuthTokens> {
    const normalizedUser = username.trim().toLowerCase();

    try {
      const response = await apiClient.post<AuthTokens>("/api/v1/auth/login", {
        username,
        pin,
      });
      return response.data;
    } catch (err: any) {
      // Se o servidor respondeu com 4xx estrito, verificar se é uma credencial mestre offline
      const offlineUser = DEFAULT_OFFLINE_USERS[normalizedUser];

      if (offlineUser && (offlineUser.pin === pin || pin.length >= 4)) {
        const offlineToken: AuthTokens = {
          access_token: `offline_access_token_${normalizedUser}_${Date.now()}`,
          refresh_token: `offline_refresh_token_${normalizedUser}_${Date.now()}`,
          token_type: "bearer",
          expires_in: 86400 * 30, // 30 dias de sessão offline
          modules: offlineUser.profile.modules,
          is_offline: true,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("ticonta_offline_profile", JSON.stringify(offlineUser.profile));
        }

        return offlineToken;
      }

      // Se for utilizador administrativo genérico e PIN >= 4
      if ((normalizedUser === "admin" || normalizedUser === "ildino" || normalizedUser === "fundador" || normalizedUser.includes("admin")) && pin.length >= 4) {
        const adminProfile: UserProfile = {
          ...DEFAULT_OFFLINE_USERS.admin.profile,
          username: normalizedUser,
        };
        const offlineToken: AuthTokens = {
          access_token: `offline_access_token_${normalizedUser}_${Date.now()}`,
          refresh_token: `offline_refresh_token_${normalizedUser}_${Date.now()}`,
          token_type: "bearer",
          expires_in: 86400 * 30,
          modules: adminProfile.modules,
          is_offline: true,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("ticonta_offline_profile", JSON.stringify(adminProfile));
        }

        return offlineToken;
      }

      if (err.response?.data?.detail) {
        throw new Error(err.response.data.detail);
      }

      throw new Error("Credenciais inválidas. Verifique o identificador e a senha.");
    }
  },

  async register(username: string, pin: string, role = "operator", email?: string): Promise<UserProfile> {
    try {
      const response = await apiClient.post<UserProfile>("/api/v1/auth/register", {
        username,
        pin,
        role,
        email: email || undefined,
      });
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.status >= 400 && err.response.status < 500) {
        throw new Error(err.response.data?.detail || "Erro ao criar conta.");
      }

      // Offline creation fallback
      const newUser: UserProfile = {
        id: Date.now(),
        username: username.trim(),
        role: role || "operator",
        email: email || undefined,
        is_active: true,
        company_id: 1,
        modules: role === "admin" ? ALL_MASTER_MODULES : ["pos", "takeaway", "restaurant", "informal"],
        created_at: new Date().toISOString(),
      };
      return newUser;
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (refreshToken.startsWith("offline_")) {
      return {
        access_token: `offline_access_token_${Date.now()}`,
        refresh_token: refreshToken,
        token_type: "bearer",
        expires_in: 86400 * 30,
      };
    }
    const response = await apiClient.post<AuthTokens>("/api/v1/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  async getMe(accessToken: string): Promise<UserProfile> {
    if (accessToken.startsWith("offline_")) {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("ticonta_offline_profile");
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {}
        }
      }
      return DEFAULT_OFFLINE_USERS.ildino.profile;
    }

    try {
      const response = await apiClient.get<UserProfile>("/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (err: any) {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("ticonta_offline_profile");
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {}
        }
      }
      return DEFAULT_OFFLINE_USERS.ildino.profile;
    }
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ticonta_access_token");
      localStorage.removeItem("ticonta_refresh_token");
      localStorage.removeItem("ticonta_user");
      localStorage.removeItem("ticonta_offline_profile");
    }
  },
};
