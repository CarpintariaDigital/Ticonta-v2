const ACCESS_TOKEN_KEY = "ticonta_access_token";

export const api = {
  defaults: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    headers: {
      "Content-Type": "application/json",
    },
  },
  async request<T = any>(method: string, url: string, data?: any, config?: any): Promise<{ data: T }> {
    let fullUrl = url.startsWith("http") ? url : `${this.defaults.baseURL}${url.startsWith("/") ? "" : "/"}${url}`;
    if (config?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        fullUrl += (fullUrl.includes("?") ? "&" : "?") + qs;
      }
    }
    const token = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    const headers = {
      ...this.defaults.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(config?.headers || {}),
    };
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const err: any = new Error(errorData.detail || `HTTP Error ${res.status}`);
      err.response = { data: errorData, status: res.status };
      throw err;
    }
    const json = await res.json();
    return { data: json };
  },
  get<T = any>(url: string, config?: any): Promise<{ data: T }> {
    return this.request<T>("GET", url, undefined, config);
  },
  post<T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> {
    return this.request<T>("POST", url, data, config);
  },
  put<T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> {
    return this.request<T>("PUT", url, data, config);
  },
  patch<T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> {
    return this.request<T>("PATCH", url, data, config);
  },
  delete<T = any>(url: string, config?: any): Promise<{ data: T }> {
    return this.request<T>("DELETE", url, undefined, config);
  },
};

export const apiClient = api;
