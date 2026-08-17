import { useCallback } from "react";
import { usePaymentStore } from "@/store/payment.store";
import { paymentService } from "@/services/payment";
import {
  ProcessPaymentInput,
  SplitPaymentInput,
  PaymentStatusData,
} from "@/types/payment";

export function usePayment() {
  const store = usePaymentStore();

  const processPayment = useCallback(
    async (
      saleId: number,
      data: ProcessPaymentInput,
      companyId = 1,
      showReceipt = true
    ): Promise<PaymentStatusData> => {
      store.setIsLoading(true);
      try {
        const result = await paymentService.processPayment(saleId, data, companyId);
        store.setCurrentPayment(result);
        store.setRecentReceipt(result);
        if (showReceipt) {
          store.setIsReceiptModalOpen(true);
        }
        return result;
      } catch (err) {
        console.error("Erro ao processar pagamento:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [store]
  );

  const splitPayment = useCallback(
    async (
      saleId: number,
      data: SplitPaymentInput,
      companyId = 1,
      showReceipt = true
    ): Promise<PaymentStatusData> => {
      store.setIsLoading(true);
      try {
        const result = await paymentService.splitPayment(saleId, data, companyId);
        store.setCurrentPayment(result);
        store.setRecentReceipt(result);
        store.setIsSplitPaymentOpen(false);
        if (showReceipt) {
          store.setIsReceiptModalOpen(true);
        }
        return result;
      } catch (err) {
        console.error("Erro ao dividir pagamento:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [store]
  );

  const getPaymentStatus = useCallback(
    async (
      saleId: number,
      moduleSource?: string,
      companyId = 1
    ): Promise<PaymentStatusData> => {
      store.setIsLoading(true);
      try {
        const result = await paymentService.getPaymentStatus(saleId, moduleSource, companyId);
        store.setCurrentPayment(result);
        return result;
      } catch (err) {
        console.error("Erro ao consultar status de pagamento:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [store]
  );

  const fetchOutstandingPayments = useCallback(
    async (companyId = 1, moduleSource?: string) => {
      store.setIsLoading(true);
      try {
        const result = await paymentService.getOutstandingPayments(companyId, moduleSource);
        store.setOutstandingPayments(result);
        return result;
      } catch (err) {
        console.error("Erro ao listar pagamentos pendentes:", err);
      } finally {
        store.setIsLoading(false);
      }
    },
    [store]
  );

  return {
    ...store,
    processPayment,
    splitPayment,
    getPaymentStatus,
    fetchOutstandingPayments,
  };
}
