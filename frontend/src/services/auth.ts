import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
}

export const authService = {
  async login(username: string, pin: string): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>("/api/v1/auth/login", {
      username,
      pin,
    });
    return response.data;
  },

  async register(username: string, pin: string, role = "operator", email?: string): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>("/api/v1/auth/register", {
      username,
      pin,
      role,
      email: email || undefined,
    });
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>("/api/v1/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  async getMe(accessToken: string): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>("/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ticonta_access_token");
      localStorage.removeItem("ticonta_refresh_token");
      localStorage.removeItem("ticonta_user");
    }
  },
};
