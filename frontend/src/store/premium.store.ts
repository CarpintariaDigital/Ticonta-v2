import { create } from "zustand";
import { CostBreakdown, FeatureName, PremiumFeature } from "@/types/premium";
import { premiumService } from "@/services/premium";

interface PremiumState {
  features: PremiumFeature[];
  costBreakdown: CostBreakdown | null;
  isLoading: boolean;
  actionLoading: string | null;
  error: string | null;

  // Actions
  fetchFeaturesAndCost: (companyId?: number) => Promise<void>;
  enableFeature: (featureName: string, companyId?: number) => Promise<void>;
  disableFeature: (featureName: string, companyId?: number) => Promise<void>;
  hasFeature: (featureName: FeatureName | string) => boolean;
  clearError: () => void;
}

export const usePremiumStore = create<PremiumState>((set, get) => ({
  features: [],
  costBreakdown: null,
  isLoading: false,
  actionLoading: null,
  error: null,

  fetchFeaturesAndCost: async (companyId = 1) => {
    set({ isLoading: true, error: null });
    try {
      const [featList, costData] = await Promise.all([
        premiumService.getAvailableFeatures(companyId),
        premiumService.getCostBreakdown(companyId),
      ]);
      set({
        features: featList,
        costBreakdown: costData,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.detail || err.message || "Erro ao carregar funcionalidades premium.",
      });
    }
  },

  enableFeature: async (featureName, companyId = 1) => {
    set({ actionLoading: featureName, error: null });
    try {
      const res = await premiumService.enableFeature(featureName, companyId);
      set((state) => ({
        features: state.features.map((f) => (f.name === featureName ? { ...f, enabled: true } : f)),
        costBreakdown: res.cost_breakdown,
        actionLoading: null,
      }));
    } catch (err: any) {
      set({
        actionLoading: null,
        error: err.response?.data?.detail || err.message || `Falha ao ativar '${featureName}'.`,
      });
      throw err;
    }
  },

  disableFeature: async (featureName, companyId = 1) => {
    set({ actionLoading: featureName, error: null });
    try {
      const res = await premiumService.disableFeature(featureName, companyId);
      set((state) => ({
        features: state.features.map((f) => (f.name === featureName ? { ...f, enabled: false } : f)),
        costBreakdown: res.cost_breakdown,
        actionLoading: null,
      }));
    } catch (err: any) {
      set({
        actionLoading: null,
        error: err.response?.data?.detail || err.message || `Falha ao desativar '${featureName}'.`,
      });
      throw err;
    }
  },

  hasFeature: (featureName) => {
    const f = get().features.find((item) => item.name === featureName);
    return f ? f.enabled : false;
  },

  clearError: () => set({ error: null }),
}));
