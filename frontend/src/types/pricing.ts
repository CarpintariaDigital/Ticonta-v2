export type BillingCycle = "monthly" | "annual";

export interface PricingFeature {
  name: string;
  included: boolean;
  tooltip?: string;
}

export interface PricingPlan {
  id: string; // basic, professional, complete, enterprise
  name: string;
  tagline: string;
  monthlyPrice: number; // in MZN
  popular?: boolean;
  ctaText: string;
  ctaHref?: string;
  modules: string[];
  features: PricingFeature[];
}

export interface FeatureCategoryComparison {
  category: string;
  features: {
    name: string;
    description?: string;
    basic: boolean | string;
    professional: boolean | string;
    complete: boolean | string;
    enterprise: boolean | string;
  }[];
}

export interface CheckoutPayload {
  planId: string;
  billingCycle: BillingCycle;
  customerName: string;
  customerEmail: string;
  companyNuit?: string;
  paymentMethod: "card" | "mpesa" | "emola";
}

export interface CheckoutResult {
  success: boolean;
  licenseKey?: string;
  sessionId?: string;
  redirectUrl?: string;
  message?: string;
}
