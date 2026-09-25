export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  company_id: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

const ACCESS_TOKEN_KEY = "ticonta_access_token";
const REFRESH_TOKEN_KEY = "ticonta_refresh_token";
const USER_KEY = "ticonta_user";

export const apiClient = {
  defaults: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    headers: {
      "Content-Type": "application/json",
    },
  },
  async post<T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> {
    const fullUrl = url.startsWith("http") ? url : `${this.defaults.baseURL}${url.startsWith("/") ? "" : "/"}${url}`;
    const token = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    const headers = {
      ...this.defaults.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(config?.headers || {}),
    };
    const res = await fetch(fullUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${res.status}`);
    }
    const json = await res.json();
    return { data: json };
  },
  async get<T = any>(url: string, config?: any): Promise<{ data: T }> {
    const fullUrl = url.startsWith("http") ? url : `${this.defaults.baseURL}${url.startsWith("/") ? "" : "/"}${url}`;
    const token = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    const headers = {
      ...this.defaults.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(config?.headers || {}),
    };
    const res = await fetch(fullUrl, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${res.status}`);
    }
    const json = await res.json();
    return { data: json };
  },
};

export const authService = {
  async login(pin: string, companyId?: number): Promise<AuthTokens> {
    const res = await apiClient.post<AuthTokens>("/auth/login", { pin, company_id: companyId });
    if (res.data?.access_token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, res.data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refresh_token);
    }
    return res.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const res = await apiClient.post<AuthTokens>("/auth/refresh", { refresh_token: refreshToken });
    if (res.data?.access_token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, res.data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refresh_token);
    }
    return res.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async getCurrentUser(): Promise<User> {
    const res = await apiClient.get<User>("/auth/me");
    if (res.data) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.data));
    }
    return res.data;
  },
};
