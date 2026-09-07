"use client";

import { useEffect, ReactNode } from "react";
import { apiClient } from "@/services/auth";
import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { accessToken, logout, setTokens } = useAuthStore();

  useEffect(() => {
    // Request interceptor: add Bearer token
    const reqInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: auto refresh on 401
    const resInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const currentRefreshToken = useAuthStore.getState().refreshToken;

          if (currentRefreshToken) {
            try {
              const res = await fetch("/api/auth/refresh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: currentRefreshToken }),
              });

              if (res.ok) {
                const data = await res.json();
                setTokens(data);
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                return apiClient(originalRequest);
              }
            } catch (refreshErr) {
              logout();
              if (typeof window !== "undefined") {
                window.location.href = "/login";
              }
            }
          }

          logout();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(reqInterceptor);
      apiClient.interceptors.response.eject(resInterceptor);
    };
  }, [logout, setTokens]);

  return <>{children}</>;
}
