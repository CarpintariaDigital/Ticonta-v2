export type LicensePlan = "basic" | "professional" | "complete" | "enterprise";

export interface License {
  id?: number;
  license_key: string;
  customer_name?: string;
  customer_id?: string;
  plan: LicensePlan;
  modules: string[];
  issued_at?: string;
  expires_at: string;
  status: "active" | "expired" | "revoked" | "unlicensed" | "licensed";
  days_remaining: number;
}

export interface LicenseStatus {
  status: "licensed" | "unlicensed" | "expired" | "revoked" | "active";
  plan: LicensePlan | null;
  modules: string[];
  license_key: string | null;
  expires_at: string | null;
  days_remaining: number;
  has_license?: boolean;
  is_active?: boolean;
  is_in_grace_period?: boolean;
  days_in_grace_period?: number;
  grace_period_expires_at?: string | null;
}

export interface ValidateKeyResponse {
  valid: boolean;
  customer_id?: string;
  plan?: LicensePlan;
  modules: string[];
  expires_at?: string;
  days_remaining: number;
  error?: string;
}

export interface ActivateLicenseResponse {
  message: string;
  company_id?: number;
  plan?: LicensePlan;
  modules?: string[];
  expires_at?: string;
  success?: boolean;
  license?: LicenseStatus;
}

export interface LicenseAdminItem {
  id: number;
  customer_name: string;
  customer_id: string;
  plan: LicensePlan;
  license_key: string;
  issued_at: string;
  expires_at: string;
  status: string;
  days_remaining: number;
}

export interface LicensingStats {
  total_licenses: number;
  active_licenses: number;
  expired_licenses: number;
  revoked_licenses: number;
  by_plan: Record<string, number>;
  estimated_revenue_mzn: string | number;
}
