import { create } from 'zustand';
import { Plan, PRICING_PLANS, getPlanByCode } from '../lib/pricing-data';

export interface PremiumFeatureItem {
  name: string;
  enabled: boolean;
  cost_mzn?: number;
  description?: string;
}

export interface CostBreakdown {
  base_plan: string;
  base_plan_cost_mzn: number;
  enabled_features: PremiumFeatureItem[];
  premium_addons_total_mzn: number;
  grand_total_monthly_mzn: number;
  next_billing_date: string;
}

export interface PremiumState {
  features: PremiumFeatureItem[];
  enabledFeatures: string[];
  currentPlan: Plan | null;
  costBreakdown: CostBreakdown | null;
  isLoading: boolean;
  error: string | null;

  // Actions & Selectors
  hasFeature: (featureName: string) => boolean;
  isEnabled: (feature: string) => boolean;
  setFeatures: (features: PremiumFeatureItem[]) => void;
  setCostBreakdown: (breakdown: CostBreakdown | null) => void;
  loadPlanFeatures: () => Promise<void>;
  upgradePlan: (planCode: string) => Promise<boolean>;
}

export const usePremiumStore = create<PremiumState>((set, get) => ({
  features: [],
  enabledFeatures: [],
  currentPlan: PRICING_PLANS[0] || null,
  costBreakdown: null,
  isLoading: false,
  error: null,

  hasFeature: (featureName: string) => {
    const { features, enabledFeatures } = get();
    if (enabledFeatures.includes('*') || enabledFeatures.includes(featureName)) {
      return true;
    }
    return features.some((f) => f.name === featureName && f.enabled);
  },

  isEnabled: (feature: string) => get().hasFeature(feature),

  setFeatures: (features) =>
    set({
      features,
      enabledFeatures: features.filter((f) => f.enabled).map((f) => f.name),
    }),

  setCostBreakdown: (costBreakdown) => set({ costBreakdown }),

  loadPlanFeatures: async () => {
    set({ isLoading: true, error: null });
    try {
      const plan = get().currentPlan || PRICING_PLANS[0];
      const enabledFeatures = plan ? plan.features : [];
      const features: PremiumFeatureItem[] = enabledFeatures.map((name) => ({
        name,
        enabled: true,
      }));
      set({
        features,
        enabledFeatures,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  upgradePlan: async (planCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const plan = getPlanByCode(planCode);
      if (plan) {
        set({
          currentPlan: plan,
          enabledFeatures: plan.features,
          features: plan.features.map((name) => ({ name, enabled: true })),
          isLoading: false,
        });
        return true;
      }
      set({ error: 'Plano não encontrado', isLoading: false });
      return false;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },
}));
