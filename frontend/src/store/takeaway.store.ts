import { create } from 'zustand';
import {
  TakeawayOrder,
  TakeawayStatus,
  TakeawaySlot,
} from '../types/takeaway';

export interface TakeawayState {
  orders: TakeawayOrder[];
  selectedOrder: TakeawayOrder | null;
  pendingDeliveries: any[];
  trackingData: any;
  stats: any;
  activeTab: string;
  statusFilter: string;
  typeFilter: string;
  searchQuery: string;
  isNewOrderModalOpen: boolean;
  isAssignModalOpen: boolean;
  isTrackingModalOpen: boolean;
  orderForAction: TakeawayOrder | null;
  activeSlots: TakeawaySlot[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addOrderToState: (order: TakeawayOrder) => void;
  setSelectedOrder: (order: TakeawayOrder | null) => void;
  setOrders: (orders: TakeawayOrder[]) => void;
  updateOrderStatusInState: (id: string | number, status: TakeawayStatus) => void;
  advanceOrderStatusInState: (id: string | number, status: string) => void;
  setPendingDeliveries: (deliveries: any[]) => void;
  setTrackingData: (data: any) => void;
  setStats: (stats: any) => void;
  setActiveTab: (tab: string) => void;
  setStatusFilter: (status: string) => void;
  setTypeFilter: (type: string) => void;
  setSearchQuery: (query: string) => void;
  setIsNewOrderModalOpen: (open: boolean) => void;
  setIsAssignModalOpen: (open: boolean) => void;
  setIsTrackingModalOpen: (open: boolean) => void;
  setOrderForAction: (order: TakeawayOrder | null) => void;

  createOrder: (order: TakeawayOrder) => Promise<void>;
  updateStatus: (orderId: string | number, status: TakeawayStatus) => Promise<void>;
  fetchActiveOrders: () => Promise<void>;
  notifyCustomer: (orderId: string | number) => Promise<void>;
}

export const useTakeawayStore = create<TakeawayState>((set) => ({
  orders: [],
  selectedOrder: null,
  pendingDeliveries: [],
  trackingData: null,
  stats: null,
  activeTab: 'queue',
  statusFilter: 'all',
  typeFilter: 'all',
  searchQuery: '',
  isNewOrderModalOpen: false,
  isAssignModalOpen: false,
  isTrackingModalOpen: false,
  orderForAction: null,
  activeSlots: [],
  isLoading: false,
  error: null,

  addOrderToState: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),

  setSelectedOrder: (order) => set({ selectedOrder: order }),

  setOrders: (orders) => set({ orders }),

  updateOrderStatusInState: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      selectedOrder:
        state.selectedOrder?.id === id
          ? { ...state.selectedOrder, status }
          : state.selectedOrder,
    })),

  advanceOrderStatusInState: (id, status) =>
    set((state) => {
      const now = new Date().toISOString();
      return {
        orders: state.orders.map((o) => {
          if (o.id === id) {
            const updated: TakeawayOrder = { ...o, status: status as any };
            if (status === 'ready') {
              updated.ready_at = now;
            } else if (status === 'delivered' || status === 'collected') {
              updated.pickup_at = now;
              updated.delivered_at = now;
            }
            return updated;
          }
          return o;
        }),
        selectedOrder:
          state.selectedOrder?.id === id
            ? {
                ...state.selectedOrder,
                status: status as any,
                ready_at: status === 'ready' ? now : state.selectedOrder.ready_at,
                pickup_at:
                  status === 'delivered' || status === 'collected'
                    ? now
                    : state.selectedOrder.pickup_at,
              }
            : state.selectedOrder,
      };
    }),

  setPendingDeliveries: (deliveries) => set({ pendingDeliveries: deliveries }),
  setTrackingData: (trackingData) => set({ trackingData }),
  setStats: (stats) => set({ stats }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsNewOrderModalOpen: (isNewOrderModalOpen) => set({ isNewOrderModalOpen }),
  setIsAssignModalOpen: (isAssignModalOpen) => set({ isAssignModalOpen }),
  setIsTrackingModalOpen: (isTrackingModalOpen) => set({ isTrackingModalOpen }),
  setOrderForAction: (orderForAction) => set({ orderForAction }),

  createOrder: async (order) => {
    set((state) => ({ orders: [order, ...state.orders] }));
  },

  updateStatus: async (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
  },

  fetchActiveOrders: async () => {
    set({ isLoading: true });
    try {
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  notifyCustomer: async () => {},
}));
