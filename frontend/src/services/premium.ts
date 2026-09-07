import { apiClient } from "@/services/auth";
import { CostBreakdown, PremiumFeature } from "@/types/premium";

export const premiumService = {
  /**
   * Lista todas as funcionalidades premium disponíveis e o status da empresa
   */
  async getAvailableFeatures(companyId: number = 1): Promise<PremiumFeature[]> {
    const response = await apiClient.get<PremiumFeature[]>(
      `/api/v1/premium/available-features?company_id=${companyId}`
    );
    return response.data;
  },

  /**
   * Ativa uma funcionalidade premium
   */
  async enableFeature(
    featureName: string,
    companyId: number = 1
  ): Promise<{ message: string; feature: string; enabled: boolean; cost_breakdown: CostBreakdown }> {
    const response = await apiClient.post(
      `/api/v1/premium/features/${featureName}/enable?company_id=${companyId}`
    );
    return response.data;
  },

  /**
   * Desativa uma funcionalidade premium
   */
  async disableFeature(
    featureName: string,
    companyId: number = 1
  ): Promise<{ message: string; feature: string; enabled: boolean; cost_breakdown: CostBreakdown }> {
    const response = await apiClient.post(
      `/api/v1/premium/features/${featureName}/disable?company_id=${companyId}`
    );
    return response.data;
  },

  /**
   * Retorna o discriminativo completo de custos da subscrição
   */
  async getCostBreakdown(companyId: number = 1): Promise<CostBreakdown> {
    const response = await apiClient.get<CostBreakdown>(
      `/api/v1/premium/cost-breakdown?company_id=${companyId}`
    );
    return response.data;
  },
};
