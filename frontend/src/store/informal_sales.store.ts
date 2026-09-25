import { create } from 'zustand';
import { api } from '../lib/api';
import {
  InformalCustomer,
  Debit,
  InformalCartItem,
  InformalSale,
  FiadoEntry,
} from '../types/informal_sales';

export interface InformalSalesState {
  customers: InformalCustomer[];
  selectedCustomer: InformalCustomer | null;
  customerDebits: Debit[];
  overdueDebits: Debit[];
  cartItems: InformalCartItem[];
  amountPaidNow: number;
  dueDate: string | null;
  paymentMethod: string;
  saleNotes: string;
  activeTab: string;
  searchQuery: string;
  customerFilter: string;
  isCollectionModalOpen: boolean;
  selectedDebitForCollection: Debit | null;
  isHistoryModalOpen: boolean;
  isNewCustomerModalOpen: boolean;
  isReceiptModalOpen: boolean;
  lastSaleReceipt: any;
  cashFlowForecast: any;
  revenueBreakdown: any;
  creditRiskReport: any;
  isLoading: boolean;
  error: string | null;
  sales: InformalSale[];
  pendingDebts: FiadoEntry[];

  // Actions
  addItemToCart: (item: Partial<InformalCartItem> & { name: string; unit_price: number; quantity: number }) => void;
  updateCartItemQuantity: (id: string | number | undefined, deltaOrQty: number) => void;
  clearCart: () => void;
  setAmountPaidNow: (amount: number) => void;
  setDueDate: (date: string | null) => void;
  setPaymentMethod: (method: string) => void;
  setSaleNotes: (notes: string) => void;
  setSelectedCustomer: (customer: InformalCustomer | null) => void;
  addCustomerToState: (customer: InformalCustomer) => void;
  updateCustomerInState: (id: string | number, partial: Partial<InformalCustomer>) => void;
  setOverdueDebits: (debits: Debit[]) => void;
  applyPartialPaymentToState: (debitId: string | number, paidAmount: number, remainingOwed: number) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setCustomerFilter: (filter: string) => void;
  setIsCollectionModalOpen: (open: boolean) => void;
  setSelectedDebitForCollection: (debit: Debit | null) => void;
  setIsHistoryModalOpen: (open: boolean) => void;
  setIsNewCustomerModalOpen: (open: boolean) => void;
  setIsReceiptModalOpen: (open: boolean) => void;
  setLastSaleReceipt: (receipt: any) => void;
  setCashFlowForecast: (forecast: any) => void;
  setRevenueBreakdown: (breakdown: any) => void;
  setCreditRiskReport: (report: any) => void;

  // Async actions
  fetchCustomers: (search?: string) => Promise<void>;
  fetchCustomerDebits: (customerId: number | string) => Promise<void>;
  fetchOverdueDebits: () => Promise<void>;
  fetchCashFlowForecast: () => Promise<void>;
  fetchCreditRiskReport: () => Promise<void>;
  fetchRevenueBreakdown: () => Promise<void>;
  createSaleWithDebit: (data: {
    customer_id?: number | string | null;
    customer_name?: string;
    customer_phone?: string;
    items: Array<{ name: string; unit_price: number; quantity: number }>;
    total_amount: number;
    initial_paid: number;
    payment_method: string;
    due_date?: string | null;
    notes?: string;
  }) => Promise<any>;
  quickCreateCustomer: (data: { name: string; phone: string; location?: string; trusted_credit_limit?: number; notes?: string }) => Promise<InformalCustomer>;
  recordPartialPayment: (debitId: number | string, amount: number, paymentMethod: string, notes?: string) => Promise<any>;
  sendPaymentReminder: (debitId: number | string, channel: 'WHATSAPP' | 'SMS' | 'whatsapp' | 'sms', customMessage?: string) => Promise<any>;

  createSale: (sale: Partial<InformalSale>) => Promise<void>;
  addFiado: (customerId: string | number, amount: number) => Promise<void>;
  collectDebt: (debtId: string | number, channel: string) => Promise<void>;
  fetchPendingDebts: () => Promise<void>;
}

export const useInformalSalesStore = create<InformalSalesState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  customerDebits: [],
  overdueDebits: [],
  cartItems: [],
  amountPaidNow: 0,
  dueDate: null,
  paymentMethod: 'cash',
  saleNotes: '',
  activeTab: 'checkout',
  searchQuery: '',
  customerFilter: 'all',
  isCollectionModalOpen: false,
  selectedDebitForCollection: null,
  isHistoryModalOpen: false,
  isNewCustomerModalOpen: false,
  isReceiptModalOpen: false,
  lastSaleReceipt: null,
  cashFlowForecast: null,
  revenueBreakdown: null,
  creditRiskReport: null,
  isLoading: false,
  error: null,
  sales: [],
  pendingDebts: [],

  addItemToCart: (item) =>
    set((state) => {
      const itemId = item.id || `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const cartItem: InformalCartItem = {
        id: itemId,
        name: item.name,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total: item.unit_price * item.quantity,
      };
      return { cartItems: [...state.cartItems, cartItem] };
    }),

  updateCartItemQuantity: (id, deltaOrQty) =>
    set((state) => ({
      cartItems: state.cartItems
        .map((i) => {
          if (String(i.id) === String(id)) {
            const newQty = i.quantity + deltaOrQty;
            return { ...i, quantity: newQty, total: i.unit_price * newQty };
          }
          return i;
        })
        .filter((i) => i.quantity > 0),
    })),

  clearCart: () =>
    set({
      cartItems: [],
      amountPaidNow: 0,
      dueDate: null,
      saleNotes: '',
    }),

  setAmountPaidNow: (amount) => set({ amountPaidNow: amount }),
  setDueDate: (date) => set({ dueDate: date }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setSaleNotes: (notes) => set({ saleNotes: notes }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

  addCustomerToState: (customer) =>
    set((state) => ({
      customers: [customer, ...state.customers],
      selectedCustomer: customer,
    })),

  updateCustomerInState: (id, partial) =>
    set((state) => ({
      customers: state.customers.map((c) => (String(c.id) === String(id) ? { ...c, ...partial } : c)),
      selectedCustomer:
        state.selectedCustomer && String(state.selectedCustomer.id) === String(id)
          ? { ...state.selectedCustomer, ...partial }
          : state.selectedCustomer,
    })),

  setOverdueDebits: (debits) => set({ overdueDebits: debits }),

  applyPartialPaymentToState: (debitId, paidAmount, remainingOwed) =>
    set((state) => ({
      overdueDebits:
        remainingOwed <= 0
          ? state.overdueDebits.filter((d) => String(d.id) !== String(debitId))
          : state.overdueDebits.map((d) =>
              String(d.id) === String(debitId)
                ? {
                    ...d,
                    amount_owed: remainingOwed,
                    amount_paid: (d.amount_paid || 0) + paidAmount,
                  }
                : d
            ),
      customerDebits:
        remainingOwed <= 0
          ? state.customerDebits.filter((d) => String(d.id) !== String(debitId))
          : state.customerDebits.map((d) =>
              String(d.id) === String(debitId)
                ? {
                    ...d,
                    amount_owed: remainingOwed,
                    amount_paid: (d.amount_paid || 0) + paidAmount,
                  }
                : d
            ),
    })),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCustomerFilter: (filter) => set({ customerFilter: filter }),
  setIsCollectionModalOpen: (open) => set({ isCollectionModalOpen: open }),
  setSelectedDebitForCollection: (debit) => set({ selectedDebitForCollection: debit }),
  setIsHistoryModalOpen: (open) => set({ isHistoryModalOpen: open }),
  setIsNewCustomerModalOpen: (open) => set({ isNewCustomerModalOpen: open }),
  setIsReceiptModalOpen: (open) => set({ isReceiptModalOpen: open }),
  setLastSaleReceipt: (receipt) => set({ lastSaleReceipt: receipt }),
  setCashFlowForecast: (forecast) => set({ cashFlowForecast: forecast }),
  setRevenueBreakdown: (breakdown) => set({ revenueBreakdown: breakdown }),
  setCreditRiskReport: (report) => set({ creditRiskReport: report }),

  fetchCustomers: async (search) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/informal/customers', {
        params: { search: search || undefined },
      });
      set({ customers: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar clientes', isLoading: false });
    }
  },

  fetchCustomerDebits: async (customerId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/v1/informal/customers/${customerId}/debit`);
      set({ customerDebits: res.data.debits || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar fiados do cliente', isLoading: false });
    }
  },

  fetchOverdueDebits: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/informal/debits/overdue');
      set({ overdueDebits: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar débitos vencidos', isLoading: false });
    }
  },

  fetchCashFlowForecast: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/informal/reports/cash-flow');
      set({ cashFlowForecast: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar previsão de caixa', isLoading: false });
    }
  },

  fetchCreditRiskReport: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/informal/reports/credit-risk');
      set({ creditRiskReport: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar relatório de risco', isLoading: false });
    }
  },

  fetchRevenueBreakdown: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/informal/reports/revenue-breakdown');
      set({ revenueBreakdown: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar divisão de receita', isLoading: false });
    }
  },

  createSaleWithDebit: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/v1/informal/sales/with-debit', data);
      await get().fetchCustomers();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao criar venda com débito', isLoading: false });
      throw err;
    }
  },

  quickCreateCustomer: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/v1/informal/customers/quick', data);
      get().addCustomerToState(res.data);
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao registar cliente', isLoading: false });
      throw err;
    }
  },

  recordPartialPayment: async (debitId, amount, paymentMethod, notes) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post(`/api/v1/informal/debits/${debitId}/pay`, {
        amount,
        payment_method: paymentMethod,
        notes,
      });
      get().applyPartialPaymentToState(debitId, amount, res.data.remaining_balance || 0);
      await get().fetchCustomers();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao amortizar débito', isLoading: false });
      throw err;
    }
  },

  sendPaymentReminder: async (debitId, channel, customMessage) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post(`/api/v1/informal/debits/${debitId}/send-reminder`, {
        channel: channel.toUpperCase(),
        custom_message: customMessage,
      });
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao enviar lembrete', isLoading: false });
      throw err;
    }
  },

  createSale: async (sale) => {
    set({ isLoading: true });
    try {
      set((state) => ({
        sales: [sale as InformalSale, ...state.sales],
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addFiado: async (customerId, amount) => {
    set({ isLoading: true });
    try {
      const customer = get().customers.find((c) => String(c.id) === String(customerId));
      const entry: FiadoEntry = {
        id: `fiado-${Date.now()}`,
        company_id: 1,
        customer_id: customerId,
        customer_name: customer?.name || 'Cliente',
        total_amount: amount,
        initial_paid: 0,
        amount_owed: amount,
        amount_paid: 0,
        due_date: new Date(Date.now() + 30 * 86400000).toISOString(),
        status: 'pending',
        reminder_count: 0,
        is_overdue: false,
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        pendingDebts: [entry, ...state.pendingDebts],
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  collectDebt: async () => {},

  fetchPendingDebts: async () => {
    set({ isLoading: true });
    try {
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
