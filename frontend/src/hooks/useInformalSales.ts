import { useCallback, useEffect, useMemo, useRef } from "react";
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
  const isInitialLoadedRef = useRef(false);

  // ==========================================
  // API Actions
  // ==========================================
  const fetchCustomers = useCallback(
    async (search?: string, onlyWithDebt = false, companyId = 1) => {
      useInformalSalesStore.getState().setIsLoading(true);
      try {
        const data = await informalSalesService.getCustomers(search, onlyWithDebt, companyId);
        useInformalSalesStore.getState().setCustomers(data);
      } catch (err) {
        console.error("Erro ao buscar clientes informais:", err);
      } finally {
        useInformalSalesStore.getState().setIsLoading(false);
      }
    },
    []
  );

  const fetchOverdueDebits = useCallback(
    async (companyId = 1) => {
      try {
        const data = await informalSalesService.getOverdueDebits(companyId);
        useInformalSalesStore.getState().setOverdueDebits(data);
      } catch (err) {
        console.error("Erro ao buscar débitos vencidos:", err);
      }
    },
    []
  );

  const fetchCustomerDebits = useCallback(
    async (customerId: number, companyId = 1) => {
      useInformalSalesStore.getState().setIsLoading(true);
      try {
        const summary = await informalSalesService.getCustomerDebits(customerId, companyId);
        useInformalSalesStore.getState().setCustomerDebits(summary.active_debits);
        return summary;
      } catch (err) {
        console.error("Erro ao buscar fiados do cliente:", err);
        return null;
      } finally {
        useInformalSalesStore.getState().setIsLoading(false);
      }
    },
    []
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
      useInformalSalesStore.getState().setIsLoading(true);
      try {
        const created = await informalSalesService.quickCreateCustomer(data);
        useInformalSalesStore.getState().addCustomerToState(created);
        useInformalSalesStore.getState().setIsNewCustomerModalOpen(false);
        return created;
      } catch (err) {
        console.error("Erro ao criar cliente rápido:", err);
        throw err;
      } finally {
        useInformalSalesStore.getState().setIsLoading(false);
      }
    },
    []
  );

  const createSaleWithDebit = useCallback(
    async (data: SaleWithDebitCreate) => {
      useInformalSalesStore.getState().setIsLoading(true);
      try {
        const res = await informalSalesService.createSaleWithDebit(data);
        useInformalSalesStore.getState().setLastSaleReceipt(res);
        useInformalSalesStore.getState().clearCart();
        const sq = useInformalSalesStore.getState().searchQuery;
        const cf = useInformalSalesStore.getState().customerFilter;
        fetchCustomers(sq, cf === "with_debt");
        fetchOverdueDebits();
        return res;
      } catch (err) {
        console.error("Erro ao registrar venda informal:", err);
        throw err;
      } finally {
        useInformalSalesStore.getState().setIsLoading(false);
      }
    },
    [fetchCustomers, fetchOverdueDebits]
  );

  const recordPartialPayment = useCallback(
    async (debitId: number, data: PartialPaymentCreate, companyId = 1) => {
      useInformalSalesStore.getState().setIsLoading(true);
      try {
        const res = await informalSalesService.recordPartialPayment(debitId, data, companyId);
        useInformalSalesStore.getState().closeCollectionModal();
        const selected = useInformalSalesStore.getState().selectedCustomer;
        if (selected) {
          fetchCustomerDebits(selected.id);
        }
        const sq = useInformalSalesStore.getState().searchQuery;
        const cf = useInformalSalesStore.getState().customerFilter;
        fetchCustomers(sq, cf === "with_debt");
        fetchOverdueDebits();
        return res;
      } catch (err) {
        console.error("Erro ao abater fiado:", err);
        throw err;
      } finally {
        useInformalSalesStore.getState().setIsLoading(false);
      }
    },
    [fetchCustomerDebits, fetchCustomers, fetchOverdueDebits]
  );

  const sendReminder = useCallback(
    async (debitId: number, data: SendReminderRequest = {}, companyId = 1) => {
      useInformalSalesStore.getState().setIsLoading(true);
      try {
        const res = await informalSalesService.sendPaymentReminder(debitId, data, companyId);
        return res;
      } catch (err) {
        console.error("Erro ao enviar cobrança WhatsApp:", err);
        throw err;
      } finally {
        useInformalSalesStore.getState().setIsLoading(false);
      }
    },
    []
  );

  const fetchReports = useCallback(
    async (companyId = 1) => {
      try {
        const [forecast, breakdown, risk] = await Promise.all([
          informalSalesService.getCashFlowForecast(companyId),
          informalSalesService.getRevenueBreakdown(companyId),
          informalSalesService.getCreditRiskReport(companyId),
        ]);
        useInformalSalesStore.getState().setCashFlowForecast(forecast);
        useInformalSalesStore.getState().setRevenueBreakdown(breakdown);
        useInformalSalesStore.getState().setCreditRiskReport(risk);
      } catch (err) {
        console.error("Erro ao buscar relatórios:", err);
      }
    },
    []
  );

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

  // Initial load only once on mount
  useEffect(() => {
    if (!isInitialLoadedRef.current) {
      isInitialLoadedRef.current = true;
      fetchCustomers();
      fetchOverdueDebits();
      fetchReports();
    }
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
