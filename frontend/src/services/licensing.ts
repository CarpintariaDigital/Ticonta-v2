import { apiClient } from "@/services/auth";
import {
  ActivateLicenseResponse,
  LicenseAdminItem,
  LicensingStats,
  LicenseStatus,
  ValidateKeyResponse,
} from "@/types/license";

export const licensingService = {
  /**
   * Validação de formato da chave no formato: TIC-XXXXX-PLAN-YYMMDD-SIGNATURE
   */
  validateLicenseFormat(key: string): boolean {
    if (!key || typeof key !== "string") return false;
    const parts = key.trim().split("-");
    return parts.length === 5 && parts[0].toUpperCase() === "TIC";
  },

  /**
   * Valida publicamente a chave no backend
   */
  async validateLicenseKey(license_key: string): Promise<ValidateKeyResponse> {
    const response = await apiClient.post<ValidateKeyResponse>("/api/v1/licensing/validate-key", {
      license_key: license_key.trim(),
    });
    return response.data;
  },

  /**
   * Ativa a licença para uma empresa específica
   */
  async activateLicense(license_key: string, company_id: number = 1): Promise<ActivateLicenseResponse> {
    const response = await apiClient.post<ActivateLicenseResponse>("/api/v1/licensing/activate-license", {
      license_key: license_key.trim(),
      company_id,
    });
    return response.data;
  },

  /**
   * Obtém o estado atual da licença
   */
  async getLicenseStatus(company_id: number = 1): Promise<LicenseStatus> {
    const response = await apiClient.get<LicenseStatus>(`/api/v1/licensing/status?company_id=${company_id}`);
    return response.data;
  },

  /**
   * Obtém listagem de todas as licenças (Admin)
   */
  async fetchAdminLicenses(): Promise<LicenseAdminItem[]> {
    const response = await apiClient.get<LicenseAdminItem[]>("/api/v1/licensing/admin/licenses");
    return response.data;
  },

  /**
   * Renova uma licença estendendo os dias (Admin)
   */
  async renewLicense(license_id: number, days: number = 365): Promise<any> {
    const response = await apiClient.put(`/api/v1/licensing/admin/licenses/${license_id}/renew`, { days });
    return response.data;
  },

  /**
   * Obtém estatísticas de licenças e faturação (Admin)
   */
  async fetchAdminStats(): Promise<LicensingStats> {
    const response = await apiClient.get<LicensingStats>("/api/v1/licensing/admin/stats");
    return response.data;
  },
};
