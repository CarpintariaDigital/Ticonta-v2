import { create } from "zustand";
import {
  Table,
  MenuItem,
  RestaurantOrder,
  KitchenDisplayItem,
  TableBillResponse,
  SplitBillResponse,
  RestaurantReportsResponse,
  RestaurantSettings,
  MenuCategory,
  TableLocation,
  OrderItem,
  ItemPrepStatus,
} from "@/types/restaurant";

export type RestaurantView = "map" | "kds" | "reports" | "settings";

interface RestaurantState {
  tables: Table[];
  selectedTable: Table | null;
  menuItems: MenuItem[];
  activeCategory: MenuCategory | "all";
  currentOrder: RestaurantOrder | null;
  orders: RestaurantOrder[];
  kdsItems: KitchenDisplayItem[];
  kdsStats: {
    totalPending: number;
    totalPreparing: number;
    totalReady: number;
    averageWaitTime: number;
  };
  billData: TableBillResponse | null;
  splitData: SplitBillResponse | null;
  reports: RestaurantReportsResponse | null;
  settings: RestaurantSettings | null;

  activeView: RestaurantView;
  filterLocation: TableLocation | "all";
  searchQuery: string;
  isLoading: boolean;
  isOnline: boolean;
  wsConnected: boolean;

  // Modals & Panels
  isAddOrderModalOpen: boolean;
  isBillModalOpen: boolean;
  isSplitModalOpen: boolean;
  isReservationModalOpen: boolean;
  isSettingsModalOpen: boolean;

  // Actions
  setTables: (tables: Table[]) => void;
  setSelectedTable: (table: Table | null) => void;
  setMenuItems: (items: MenuItem[]) => void;
  setActiveCategory: (category: MenuCategory | "all") => void;
  setCurrentOrder: (order: RestaurantOrder | null) => void;
  setOrders: (orders: RestaurantOrder[]) => void;
  setKDSItems: (items: KitchenDisplayItem[]) => void;
  setKDSStats: (stats: { totalPending: number; totalPreparing: number; totalReady: number; averageWaitTime: number }) => void;
  setBillData: (bill: TableBillResponse | null) => void;
  setSplitData: (split: SplitBillResponse | null) => void;
  setReports: (reports: RestaurantReportsResponse | null) => void;
  setSettings: (settings: RestaurantSettings | null) => void;

  setActiveView: (view: RestaurantView) => void;
  setFilterLocation: (loc: TableLocation | "all") => void;
  setSearchQuery: (query: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsOnline: (online: boolean) => void;
  setWsConnected: (connected: boolean) => void;

  setIsAddOrderModalOpen: (open: boolean) => void;
  setIsBillModalOpen: (open: boolean) => void;
  setIsSplitModalOpen: (open: boolean) => void;
  setIsReservationModalOpen: (open: boolean) => void;
  setIsSettingsModalOpen: (open: boolean) => void;

  // Complex In-State mutators for WebSocket live updates
  updateTableInState: (tableId: number, patch: Partial<Table>) => void;
  updateKDSItemInState: (itemId: number, patch: Partial<KitchenDisplayItem>) => void;
  addOrderItemToState: (orderItem: OrderItem) => void;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  tables: [],
  selectedTable: null,
  menuItems: [],
  activeCategory: "all",
  currentOrder: null,
  orders: [],
  kdsItems: [],
  kdsStats: {
    totalPending: 0,
    totalPreparing: 0,
    totalReady: 0,
    averageWaitTime: 0,
  },
  billData: null,
  splitData: null,
  reports: null,
  settings: null,

  activeView: "map",
  filterLocation: "all",
  searchQuery: "",
  isLoading: false,
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  wsConnected: false,

  isAddOrderModalOpen: false,
  isBillModalOpen: false,
  isSplitModalOpen: false,
  isReservationModalOpen: false,
  isSettingsModalOpen: false,

  setTables: (tables) => set({ tables }),
  setSelectedTable: (table) => set({ selectedTable: table }),
  setMenuItems: (items) => set({ menuItems: items }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setOrders: (orders) => set({ orders }),
  setKDSItems: (items) => set({ kdsItems: items }),
  setKDSStats: (stats) => set({ kdsStats: stats }),
  setBillData: (bill) => set({ billData: bill }),
  setSplitData: (split) => set({ splitData: split }),
  setReports: (reports) => set({ reports }),
  setSettings: (settings) => set({ settings }),

  setActiveView: (view) => set({ activeView: view }),
  setFilterLocation: (loc) => set({ filterLocation: loc }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsOnline: (online) => set({ isOnline: online }),
  setWsConnected: (connected) => set({ wsConnected: connected }),

  setIsAddOrderModalOpen: (open) => set({ isAddOrderModalOpen: open }),
  setIsBillModalOpen: (open) => set({ isBillModalOpen: open }),
  setIsSplitModalOpen: (open) => set({ isSplitModalOpen: open }),
  setIsReservationModalOpen: (open) => set({ isReservationModalOpen: open }),
  setIsSettingsModalOpen: (open) => set({ isSettingsModalOpen: open }),

  updateTableInState: (tableId, patch) => {
    const { tables, selectedTable } = get();
    const updated = tables.map((t) => (t.id === tableId ? { ...t, ...patch } : t));
    const updatedSelected = selectedTable?.id === tableId ? { ...selectedTable, ...patch } : selectedTable;
    set({ tables: updated, selectedTable: updatedSelected });
  },

  updateKDSItemInState: (itemId, patch) => {
    const { kdsItems } = get();
    const updated = kdsItems.map((k) => (k.order_item_id === itemId ? { ...k, ...patch } : k));
    set({ kdsItems: updated });
  },

  addOrderItemToState: (orderItem) => {
    const { currentOrder } = get();
    if (currentOrder && currentOrder.id === orderItem.order_id) {
      const updatedItems = [...currentOrder.items, orderItem];
      const newSubtotal = updatedItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
      const tax = newSubtotal * 0.16;
      const service = newSubtotal * 0.10;
      set({
        currentOrder: {
          ...currentOrder,
          items: updatedItems,
          subtotal: newSubtotal,
          tax: tax,
          service_charge: service,
          total: newSubtotal + tax + service,
        },
      });
    }
  },
}));
