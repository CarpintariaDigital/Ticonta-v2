"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/store/auth.store";

export interface LicensedModulesHook {
  modules: string[];
  hasModule: (requiredModule: string) => boolean;
  isAdmin: boolean;
}

export function useLicensedModules(): LicensedModulesHook {
  const { user, accessToken } = useAuthStore();

  const { modules, isAdmin } = useMemo(() => {
    let extractedModules: string[] = user?.modules || [];
    const role = user?.role?.toLowerCase() || "";
    const admin = role === "admin" || role === "superuser";

    // Extrair módulos do token JWT se disponível
    if (accessToken && extractedModules.length === 0) {
      try {
        const parts = accessToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (Array.isArray(payload.modules)) {
            extractedModules = payload.modules;
          }
          if (payload.roles && (payload.roles.includes("admin") || payload.roles.includes("superuser"))) {
            return { modules: ["*"], isAdmin: true };
          }
        }
      } catch (err) {
        console.debug("Falha ao decodificar módulos do token:", err);
      }
    }

    if (admin) {
      return { modules: ["*"], isAdmin: true };
    }

    if (extractedModules.length === 0) {
      // Por padrão em demonstração/instalação inicial, todos os módulos ativos
      extractedModules = ["*"];
    }

    return { modules: extractedModules, isAdmin: false };
  }, [user, accessToken]);

  const hasModule = (requiredModule: string): boolean => {
    if (isAdmin) return true;
    if (modules.includes("*")) return true;

    const modKey = requiredModule.toLowerCase().trim();
    return modules.includes(modKey);
  };

  return {
    modules,
    hasModule,
    isAdmin,
  };
}
