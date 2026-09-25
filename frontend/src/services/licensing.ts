import { apiClient } from "@/services/auth";

export interface LicenseInfo {
  license_key: string;
  plan: "base" | "pro" | "complete" | "enterprise" | string;
  status: "licensed" | "unlicensed" | "expired";
  active_modules: string[];
  expires_at?: string;
  days_remaining?: number;
}

const LICENSE_STORAGE_KEY = "ticonta_license_info";

export const licensingService = {
  validateLicenseFormat(key: string): boolean {
    if (!key || typeof key !== "string") return false;
    // Formato padrão TiConta: TIC-CUSTID-PLAN-YYMMDD-SIGNATURE
    const pattern = /^TIC-[A-Za-z0-9]+-[A-Za-z0-9]+-\d{6}-[A-Za-z0-9]{8,12}$/;
    return pattern.test(key.trim());
  },

  validateLicense(key: string): boolean {
    return this.validateLicenseFormat(key);
  },

  async activateLicense(key: string, companyData?: any): Promise<LicenseInfo> {
    if (!this.validateLicenseFormat(key)) {
      throw new Error("Chave de licença inválida.");
    }
    try {
      const res = await apiClient.post<LicenseInfo>("/admin/licenses/validate", { license_key: key, ...companyData });
      if (res.data) {
        localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(res.data));
        return res.data;
      }
    } catch {
      // Fallback local se estiver offline
    }
    const fallbackInfo: LicenseInfo = {
      license_key: key,
      plan: "complete",
      status: "licensed",
      active_modules: ["pos", "crm", "accounting", "manufacturing", "hr", "restaurant", "poultry"],
      days_remaining: 365,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(fallbackInfo));
    }
    return fallbackInfo;
  },

  getLicenseInfo(): LicenseInfo | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isFeatureEnabled(feature: string): boolean {
    const info = this.getLicenseInfo();
    if (!info || info.status !== "licensed") return false;
    if (info.active_modules.includes("*")) return true;
    return info.active_modules.includes(feature);
  },

  getDaysUntilExpiry(): number {
    const info = this.getLicenseInfo();
    return info?.days_remaining ?? 0;
  },
};
