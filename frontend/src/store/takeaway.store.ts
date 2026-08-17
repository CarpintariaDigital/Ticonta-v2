import { create } from "zustand";
import {
  TakeawayOrder,
  OrderTrackingResponse,
  TakeawayStatsResponse,
  TakeawayStatus,
  DeliveryStatus,
} from "@/types/takeaway";

interface TakeawayState {
  orders: TakeawayOrder[];
  selectedOrder: TakeawayOrder | null;
  pendingDeliveries: TakeawayOrder[];
  trackingData: OrderTrackingResponse | null;
  stats: TakeawayStatsResponse | null;

  activeTab: "queue" | "deliveries" | "new_order" | "tracking";
  statusFilter: string;
  typeFilter: "all" | "takeaway" | "delivery";
  searchQuery: string;

  isNewOrderModalOpen: boolean;
  isAssignModalOpen: boolean;
  isTrackingModalOpen: boolean;
  orderForAction: TakeawayOrder | null;
  isLoading: boolean;

  // Actions
  setOrders: (orders: TakeawayOrder[]) => void;
  addOrderToState: (order: TakeawayOrder) => void;
  updateOrderInState: (id: number, updates: Partial<TakeawayOrder>) => void;
  setSelectedOrder: (order: TakeawayOrder | null) => void;
  setPendingDeliveries: (deliveries: TakeawayOrder[]) => void;
  setTrackingData: (tracking: OrderTrackingResponse | null) => void;
  setStats: (stats: TakeawayStatsResponse | null) => void;

  setActiveTab: (tab: "queue" | "deliveries" | "new_order" | "tracking") => void;
  setStatusFilter: (filter: string) => void;
  setTypeFilter: (type: "all" | "takeaway" | "delivery") => void;
  setSearchQuery: (query: string) => void;

  setIsNewOrderModalOpen: (open: boolean) => void;
  setIsAssignModalOpen: (open: boolean) => void;
  setIsTrackingModalOpen: (open: boolean) => void;
  setOrderForAction: (order: TakeawayOrder | null) => void;
  setIsLoading: (loading: boolean) => void;

  // Quick State Transitions
  advanceOrderStatusInState: (orderId: number, nextStatus: TakeawayStatus) => void;
}

export const useTakeawayStore = create<TakeawayState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  pendingDeliveries: [],
  trackingData: null,
  stats: null,

  activeTab: "queue",
  statusFilter: "all",
  typeFilter: "all",
  searchQuery: "",

  isNewOrderModalOpen: false,
  isAssignModalOpen: false,
  isTrackingModalOpen: false,
  orderForAction: null,
  isLoading: false,

  setOrders: (orders) => set({ orders }),
  addOrderToState: (order) => set((s) => ({ orders: [order, ...s.orders] })),
  updateOrderInState: (id, updates) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
      selectedOrder: s.selectedOrder?.id === id ? { ...s.selectedOrder, ...updates } : s.selectedOrder,
      pendingDeliveries: s.pendingDeliveries.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    })),
  setSelectedOrder: (selectedOrder) => set({ selectedOrder }),
  setPendingDeliveries: (pendingDeliveries) => set({ pendingDeliveries }),
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
  setIsLoading: (isLoading) => set({ isLoading }),

  advanceOrderStatusInState: (orderId, nextStatus) => {
    const s = get();
    const updated = s.orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: nextStatus,
          ready_at: nextStatus === "ready" ? new Date().toISOString() : o.ready_at,
          pickup_at: nextStatus === "delivered" || nextStatus === "picked_up" ? new Date().toISOString() : o.pickup_at,
        };
      }
      return o;
    });
    set({ orders: updated });
  },
}));
