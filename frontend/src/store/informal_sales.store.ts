import { create } from "zustand";
import {
  InformalCustomer,
  Debit,
  DebitStatus,
  SaleWithDebitResponse,
  CashFlowForecastResponse,
  RevenueBreakdownResponse,
  CreditRiskReportResponse,
} from "@/types/informal_sales";

export interface FastCartItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

interface InformalSalesState {
  customers: InformalCustomer[];
  selectedCustomer: InformalCustomer | null;
  customerDebits: Debit[];
  overdueDebits: Debit[];
  
  // Checkout State
  cartItems: FastCartItem[];
  amountPaidNow: number;
  dueDate: string | null;
  paymentMethod: string;
  saleNotes: string;
  
  // Navigation & Filters
  activeTab: "checkout" | "customers" | "overdue" | "cashflow";
  searchQuery: string;
  customerFilter: "all" | "with_debt" | "clean" | "overdue";
  
  // Modals
  isCollectionModalOpen: boolean;
  selectedDebitForCollection: Debit | null;
  isHistoryModalOpen: boolean;
  isNewCustomerModalOpen: boolean;
  isReceiptModalOpen: boolean;
  lastSaleReceipt: SaleWithDebitResponse | null;
  
  // Reports
  cashFlowForecast: CashFlowForecastResponse | null;
  revenueBreakdown: RevenueBreakdownResponse | null;
  creditRiskReport: CreditRiskReportResponse | null;
  isLoading: boolean;

  // Actions
  setCustomers: (customers: InformalCustomer[]) => void;
  addCustomerToState: (customer: InformalCustomer) => void;
  updateCustomerInState: (id: number, updates: Partial<InformalCustomer>) => void;
  setSelectedCustomer: (customer: InformalCustomer | null) => void;
  setCustomerDebits: (debits: Debit[]) => void;
  setOverdueDebits: (debits: Debit[]) => void;
  
  // Cart Actions
  addItemToCart: (item: { name: string; unit_price: number; quantity?: number }) => void;
  removeItemFromCart: (id: string) => void;
  updateCartItemQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  setAmountPaidNow: (amount: number) => void;
  setDueDate: (date: string | null) => void;
  setPaymentMethod: (method: string) => void;
  setSaleNotes: (notes: string) => void;
  
  // UI & Modals
  setActiveTab: (tab: "checkout" | "customers" | "overdue" | "cashflow") => void;
  setSearchQuery: (query: string) => void;
  setCustomerFilter: (filter: "all" | "with_debt" | "clean" | "overdue") => void;
  openCollectionModal: (debit: Debit) => void;
  closeCollectionModal: () => void;
  setIsHistoryModalOpen: (open: boolean) => void;
  setIsNewCustomerModalOpen: (open: boolean) => void;
  setIsReceiptModalOpen: (open: boolean) => void;
  setLastSaleReceipt: (receipt: SaleWithDebitResponse | null) => void;
  setCashFlowForecast: (forecast: CashFlowForecastResponse | null) => void;
  setRevenueBreakdown: (breakdown: RevenueBreakdownResponse | null) => void;
  setCreditRiskReport: (report: CreditRiskReportResponse | null) => void;
  setIsLoading: (loading: boolean) => void;
  
  // In-state Debit update
  applyPartialPaymentToState: (debitId: number, amountPaid: number, remainingBalance: number) => void;
}

export const useInformalSalesStore = create<InformalSalesState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  customerDebits: [],
  overdueDebits: [],
  cartItems: [],
  amountPaidNow: 0,
  dueDate: null,
  paymentMethod: "cash",
  saleNotes: "",
  activeTab: "checkout",
  searchQuery: "",
  customerFilter: "all",
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

  setCustomers: (customers) => set({ customers }),
  addCustomerToState: (customer) => set((s) => ({ customers: [customer, ...s.customers], selectedCustomer: customer })),
  updateCustomerInState: (id, updates) =>
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      selectedCustomer: s.selectedCustomer?.id === id ? { ...s.selectedCustomer, ...updates } : s.selectedCustomer,
    })),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setCustomerDebits: (customerDebits) => set({ customerDebits }),
  setOverdueDebits: (overdueDebits) => set({ overdueDebits }),

  addItemToCart: (item) => {
    const s = get();
    const existing = s.cartItems.find((i) => i.name.toLowerCase() === item.name.toLowerCase() && i.unit_price === item.unit_price);
    if (existing) {
      set({
        cartItems: s.cartItems.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
        ),
      });
    } else {
      const newItem: FastCartItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: item.name,
        unit_price: item.unit_price,
        quantity: item.quantity || 1,
      };
      set({ cartItems: [...s.cartItems, newItem] });
    }
  },

  removeItemFromCart: (id) => set((s) => ({ cartItems: s.cartItems.filter((i) => i.id !== id) })),
  updateCartItemQuantity: (id, delta) =>
    set((s) => ({
      cartItems: s.cartItems
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0),
    })),
  clearCart: () => set({ cartItems: [], amountPaidNow: 0, dueDate: null, saleNotes: "" }),
  setAmountPaidNow: (amountPaidNow) => set({ amountPaidNow }),
  setDueDate: (dueDate) => set({ dueDate }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setSaleNotes: (saleNotes) => set({ saleNotes }),

  setActiveTab: (activeTab) => set({ activeTab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCustomerFilter: (customerFilter) => set({ customerFilter }),
  openCollectionModal: (debit) => set({ isCollectionModalOpen: true, selectedDebitForCollection: debit }),
  closeCollectionModal: () => set({ isCollectionModalOpen: false, selectedDebitForCollection: null }),
  setIsHistoryModalOpen: (isHistoryModalOpen) => set({ isHistoryModalOpen }),
  setIsNewCustomerModalOpen: (isNewCustomerModalOpen) => set({ isNewCustomerModalOpen }),
  setIsReceiptModalOpen: (isReceiptModalOpen) => set({ isReceiptModalOpen }),
  setLastSaleReceipt: (lastSaleReceipt) => set({ lastSaleReceipt, isReceiptModalOpen: true }),
  setCashFlowForecast: (cashFlowForecast) => set({ cashFlowForecast }),
  setRevenueBreakdown: (revenueBreakdown) => set({ revenueBreakdown }),
  setCreditRiskReport: (creditRiskReport) => set({ creditRiskReport }),
  setIsLoading: (isLoading) => set({ isLoading }),

  applyPartialPaymentToState: (debitId, amountPaid, remainingBalance) => {
    const s = get();
    const updatedOverdue = s.overdueDebits
      .map((d) => {
        if (d.id === debitId) {
          return {
            ...d,
            amount_paid: d.amount_paid + amountPaid,
            amount_owed: remainingBalance,
            status: (remainingBalance === 0 ? "paid" : "partially_paid") as DebitStatus,
          };
        }
        return d;
      })
      .filter((d) => d.status !== "paid");

    const updatedDebits: Debit[] = s.customerDebits.map((d) => {
      if (d.id === debitId) {
        return {
          ...d,
          amount_paid: d.amount_paid + amountPaid,
          amount_owed: remainingBalance,
          status: (remainingBalance === 0 ? "paid" : "partially_paid") as DebitStatus,
        };
      }
      return d;
    });

    set({ overdueDebits: updatedOverdue, customerDebits: updatedDebits });
  },
}));
