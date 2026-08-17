export type FeatureName =
  | "whatsapp_delivery"
  | "sms_delivery"
  | "email_delivery"
  | "barcode_scanner"
  | "advanced_analytics"
  | "api_access"
  | "custom_integrations"
  | "phone_support"
  | "unlimited_export";

export interface PremiumFeature {
  id: number;
  name: FeatureName | string;
  description: string;
  monthly_cost_mzn: number;
  category: "communication" | "pos" | "automation" | "support" | string;
  enabled: boolean;
  activated_at?: string | null;
  popular?: boolean;
}

export interface FeatureCostItem {
  name: string;
  cost_mzn: number;
}

export interface CostBreakdown {
  base_plan: string;
  base_plan_cost_mzn: number;
  enabled_features: FeatureCostItem[];
  premium_addons_total_mzn: number;
  grand_total_monthly_mzn: number;
  next_billing_date: string;
}
