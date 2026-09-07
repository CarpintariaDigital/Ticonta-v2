"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, ReactNode } from "react";
import AuthProvider from "@/components/AuthProvider";
import PWAManifestManager from "@/components/common/PWAManifestManager";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  // Auto-desregistra Service Workers antigos e limpa caches em ambiente local
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Se estivermos em dev ou se houver SW preso
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => {});
        }
      });
      if ("caches" in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name).catch(() => {});
          }
        });
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PWAManifestManager />
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

