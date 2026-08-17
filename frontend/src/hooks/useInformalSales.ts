import { useCallback, useEffect, useMemo } from "react";
import { useInformalSalesStore } from "@/store/informal_sales.store";
import { informalSalesService } from "@/services/informal_sales";
import {
  InformalCustomer,
  Debit,
  SaleWithDebitCreate,
  PartialPaymentCreate,
  SendReminderRequest,
} from "@/types/informal_sales";

export function useInformalSales() {
  const store = useInformalSalesStore();

  // ==========================================
  // API Actions
  // ==========================================
  const fetchCustomers = useCallback(
    async (search?: string, onlyWithDebt = false, companyId = 1) => {
      store.setIsLoading(true);
      try {
        const data = await informalSalesService.getCustomers(search, onlyWithDebt, companyId);
        store.setCustomers(data);
      } catch (err) {
        console.error("Erro ao buscar clientes informais:", err);
      } finally {
        store.setIsLoading(false);
      }
    },
    [store]
  );

  const fetchOverdueDebits = useCallback(
    async (companyId = 1) => {
      try {
        const data = await informalSalesService.getOverdueDebits(companyId);
        store.setOverdueDebits(data);
      } catch (err) {
        console.error("Erro ao buscar débitos vencidos:", err);
      }
    },
    [store]
  );

  const fetchCustomerDebits = useCallback(
    async (customerId: number, companyId = 1) => {
      store.setIsLoading(true);
      try {
        const summary = await informalSalesService.getCustomerDebits(customerId, companyId);
        store.setCustomerDebits(summary.active_debits);
        return summary;
      } catch (err) {
        console.error("Erro ao buscar fiados do cliente:", err);
        return null;
      } finally {
        store.setIsLoading(false);
      }
    },
    [store]
  );

  const createCustomerQuick = useCallback(
    async (data: {
      name: string;
      phone?: string;
      location?: string;
      trusted_credit_limit?: number;
      notes?: string;
      company_id?: number;
    }) => {
      store.setIsLoading(true);
      try {
        const created = await informalSalesService.quickCreateCustomer(data);
        store.addCustomerToState(created);
        store.setIsNewCustomerModalOpen(false);
        return created;
      } catch (err) {
        console.error("Erro ao criar cliente rápido:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [store]
  );

  const createSaleWithDebit = useCallback(
    async (data: SaleWithDebitCreate) => {
      store.setIsLoading(true);
      try {
        const res = await informalSalesService.createSaleWithDebit(data);
        store.setLastSaleReceipt(res);
        store.clearCart();
        
        // Refresh customer data and overdue list
        fetchCustomers(store.searchQuery, store.customerFilter === "with_debt");
        fetchOverdueDebits();
        return res;
      } catch (err) {
        console.error("Erro ao registrar venda informal:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [fetchCustomers, fetchOverdueDebits, store]
  );

  const recordPartialPayment = useCallback(
    async (debitId: number, data: PartialPaymentCreate, companyId = 1) => {
      store.setIsLoading(true);
      try {
        const result = await informalSalesService.recordPartialPayment(debitId, data, companyId);
        store.applyPartialPaymentToState(debitId, result.amount_paid_now, result.remaining_balance);
        
        // Refresh customer list
        fetchCustomers(store.searchQuery, store.customerFilter === "with_debt");
        fetchOverdueDebits();
        store.closeCollectionModal();
        return result;
      } catch (err) {
        console.error("Erro ao registrar pagamento parcial:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [fetchCustomers, fetchOverdueDebits, store]
  );

  const sendReminder = useCallback(
    async (debitId: number, data: SendReminderRequest = {}, companyId = 1) => {
      try {
        const res = await informalSalesService.sendPaymentReminder(debitId, data, companyId);
        fetchOverdueDebits();
        return res;
      } catch (err) {
        console.error("Erro ao enviar lembrete:", err);
        throw err;
      }
    },
    [fetchOverdueDebits]
  );

  const fetchReports = useCallback(async (companyId = 1) => {
    try {
      const [forecast, breakdown, risk] = await Promise.all([
        informalSalesService.getCashFlowForecast(companyId),
        informalSalesService.getRevenueBreakdown(companyId),
        informalSalesService.getCreditRiskReport(companyId),
      ]);
      store.setCashFlowForecast(forecast);
      store.setRevenueBreakdown(breakdown);
      store.setCreditRiskReport(risk);
    } catch (err) {
      console.error("Erro ao buscar relatórios:", err);
    }
  }, [store]);

  // ==========================================
  // Computed Cart Totals
  // ==========================================
  const cartSubtotal = useMemo(() => {
    return store.cartItems.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  }, [store.cartItems]);

  const amountOwed = useMemo(() => {
    return Math.max(0, cartSubtotal - store.amountPaidNow);
  }, [cartSubtotal, store.amountPaidNow]);

  const isCreditLimitExceeded = useMemo(() => {
    if (!store.selectedCustomer) return false;
    const futureDebt = store.selectedCustomer.total_owed + amountOwed;
    return futureDebt > store.selectedCustomer.trusted_credit_limit;
  }, [store.selectedCustomer, amountOwed]);

  // Initial load
  useEffect(() => {
    fetchCustomers();
    fetchOverdueDebits();
    fetchReports();
  }, [fetchCustomers, fetchOverdueDebits, fetchReports]);

  return {
    ...store,
    cartSubtotal,
    amountOwed,
    isCreditLimitExceeded,
    fetchCustomers,
    fetchOverdueDebits,
    fetchCustomerDebits,
    createCustomerQuick,
    createSaleWithDebit,
    recordPartialPayment,
    sendReminder,
    fetchReports,
  };
}
