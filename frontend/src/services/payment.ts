import { apiClient } from "@/services/auth";
import { PaymentStatusData, MpesaTransaction, PaymentStatus } from "@/types/payment";

export interface PriceCalculationResult {
  total: number;
  monthlyEquivalent: number;
  savings: number;
}

export const paymentService = {
  calculatePrice(baseMonthlyPrice: number, billingCycle: "monthly" | "annual"): PriceCalculationResult {
    if (billingCycle === "annual") {
      const annualFull = baseMonthlyPrice * 12;
      const total = annualFull * 0.9; // 10% de desconto
      const monthlyEquivalent = total / 12;
      const savings = annualFull - total;
      return { total, monthlyEquivalent, savings };
    }
    return {
      total: baseMonthlyPrice,
      monthlyEquivalent: baseMonthlyPrice,
      savings: 0,
    };
  },

  async processPayment(saleId: number, data: any): Promise<PaymentStatusData> {
    const res = await apiClient.post<PaymentStatusData>(`/payment/${saleId}`, data);
    return res.data;
  },

  async initiateMpesa(phone: string, amount: number): Promise<MpesaTransaction> {
    const res = await apiClient.post<MpesaTransaction>("/payment/mpesa/initiate", { phone, amount });
    return res.data;
  },

  async checkMpesaStatus(reference: string): Promise<PaymentStatus> {
    const res = await apiClient.get<{ status: PaymentStatus }>(`/payment/mpesa/status/${reference}`);
    return res.data.status;
  },

  async refundPayment(paymentId: number): Promise<void> {
    await apiClient.post(`/payment/${paymentId}/refund`);
  },
};
