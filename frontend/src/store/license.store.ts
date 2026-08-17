import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LicensePlan, LicenseStatus } from "@/types/license";
import { licensingService } from "@/services/licensing";

interface LicenseState {
  status: "licensed" | "unlicensed" | "expired" | "revoked";
  plan: LicensePlan | null;
  activeModules: string[];
  licenseKey: string | null;
  expiresAt: string | null;
  daysRemaining: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLicenseStatus: (company_id?: number) => Promise<void>;
  activateLicense: (key: string, company_id?: number) => Promise<void>;
  hasModule: (moduleName: string) => boolean;
  clearError: () => void;
}

export const useLicenseStore = create<LicenseState>()(
  persist(
    (set, get) => ({
      status: "unlicensed",
      plan: null,
      activeModules: [],
      licenseKey: null,
      expiresAt: null,
      daysRemaining: 0,
      isLoading: false,
      error: null,

      fetchLicenseStatus: async (company_id = 1) => {
        set({ isLoading: true, error: null });
        try {
          const res = await licensingService.getLicenseStatus(company_id);
          set({
            status: res.status,
            plan: res.plan,
            activeModules: res.modules || [],
            licenseKey: res.license_key,
            expiresAt: res.expires_at,
            daysRemaining: res.days_remaining || 0,
            isLoading: false,
          });
        } catch (err: any) {
          set({
            isLoading: false,
            error: err.response?.data?.detail || err.message || "Erro ao consultar licença",
          });
        }
      },

      activateLicense: async (key: string, company_id = 1) => {
        set({ isLoading: true, error: null });
        try {
          const res = await licensingService.activateLicense(key, company_id);
          set({
            status: "licensed",
            plan: res.plan,
            activeModules: res.modules || [],
            licenseKey: key.trim(),
            expiresAt: res.expires_at,
            isLoading: false,
          });
          await get().fetchLicenseStatus(company_id);
        } catch (err: any) {
          set({
            isLoading: false,
            error: err.response?.data?.detail || err.message || "Falha ao ativar chave de licença",
          });
          throw err;
        }
      },

      hasModule: (moduleName: string) => {
        const { activeModules, status } = get();
        if (status !== "licensed") return false;
        if (activeModules.includes("*")) return true;
        return activeModules.includes(moduleName.toLowerCase());
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "ticonta-license-storage",
    }
  )
);
