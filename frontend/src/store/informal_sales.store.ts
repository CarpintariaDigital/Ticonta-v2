import { create } from 'zustand';
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
