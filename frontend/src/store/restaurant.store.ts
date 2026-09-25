import { create } from 'zustand';
import {
  Table,
  MenuItem,
  OrderItem,
  OrderStatus,
  RestaurantOrder,
} from '../types/restaurant';

export interface KDSItem {
  order_item_id?: number | string;
  id?: number | string;
  order_id: number | string;
  order_number: string;
  menu_item_id: number | string;
  menu_item_name: string;
  category?: string;
  quantity: number;
  preparation_status: string;
  elapsed_minutes?: number;
  urgency_color?: string;
  created_at?: string;
}

export interface RestaurantState {
  tables: Table[];
  selectedTable: Table | null;
  menuItems: MenuItem[];
  activeCategory: string;
  currentOrder: RestaurantOrder | null;
  orders: RestaurantOrder[];
  activeOrders: RestaurantOrder[];
  kdsItems: KDSItem[];
  kdsStats: {
    totalPending: number;
    totalPreparing: number;
    totalReady: number;
    averageWaitTime: number;
  };
  billData: any;
  splitData: any;
  reports: any;
  settings: any;
  activeView: string;
  filterLocation: string;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTables: (tables: Table[]) => void;
  setSelectedTable: (table: Table | null) => void;
  updateTableInState: (id: string | number, partial: Partial<Table>) => void;
  setMenuItems: (items: MenuItem[]) => void;
  setActiveCategory: (cat: string) => void;
  setCurrentOrder: (order: RestaurantOrder | null) => void;
  addOrderItemToState: (item: OrderItem) => void;
  setOrders: (orders: RestaurantOrder[]) => void;
  setKdsItems: (items: KDSItem[]) => void;
  setKDSItems: (items: KDSItem[]) => void;
  updateKDSItemInState: (id: number | string, partial: Partial<KDSItem>) => void;
  setKdsStats: (stats: any) => void;
  setBillData: (data: any) => void;
  setSplitData: (data: any) => void;
  setReports: (reports: any) => void;
  setSettings: (settings: any) => void;
  setActiveView: (view: string) => void;
  setFilterLocation: (loc: string) => void;
  setSearchQuery: (query: string) => void;
  updateOrderTotals: () => void;

  fetchTables: () => Promise<void>;
  openTable: (tableId: string | number, guestCount?: number) => Promise<void>;
  addOrderItem: (tableId: string | number, item: OrderItem) => Promise<void>;
  updateOrderStatus: (orderId: string | number, status: OrderStatus) => Promise<void>;
  closeTable: (tableId: string | number) => Promise<void>;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  tables: [],
  selectedTable: null,
  menuItems: [],
  activeCategory: 'all',
  currentOrder: null,
  orders: [],
  activeOrders: [],
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
  activeView: 'map',
  filterLocation: 'all',
  searchQuery: '',
  isLoading: false,
  error: null,

  setTables: (tables) => set({ tables }),
  setSelectedTable: (table) => set({ selectedTable: table }),
  updateTableInState: (id, partial) =>
    set((state) => ({
      tables: state.tables.map((t) => (t.id === id ? { ...t, ...partial } : t)),
      selectedTable:
        state.selectedTable?.id === id
          ? { ...state.selectedTable, ...partial }
          : state.selectedTable,
    })),
  setMenuItems: (menuItems) => set({ menuItems }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setCurrentOrder: (currentOrder) => set({ currentOrder }),

  addOrderItemToState: (item) =>
    set((state) => {
      if (!state.currentOrder) return state;
      const items = [...state.currentOrder.items, item];
      const subtotal = items.reduce(
        (sum, it) => sum + it.unit_price * it.quantity,
        0
      );
      const tax = subtotal * 0.16;
      const service_charge = subtotal * 0.10;
      const total = subtotal + tax + service_charge;

      return {
        currentOrder: {
          ...state.currentOrder,
          items,
          subtotal,
          tax,
          service_charge,
          total,
        },
      };
    }),

  setOrders: (orders) =>
    set({
      orders,
      activeOrders: orders.filter((o) => o.status !== 'paid' && o.status !== 'cancelled'),
    }),
  setKdsItems: (kdsItems) => set({ kdsItems }),
  setKDSItems: (kdsItems) => set({ kdsItems }),
  updateKDSItemInState: (id, partial) =>
    set((state) => ({
      kdsItems: state.kdsItems.map((item) =>
        (item.order_item_id ?? item.id) === id ? { ...item, ...partial } : item
      ),
    })),
  setKdsStats: (kdsStats) => set({ kdsStats }),
  setBillData: (billData) => set({ billData }),
  setSplitData: (splitData) => set({ splitData }),
  setReports: (reports) => set({ reports }),
  setSettings: (settings) => set({ settings }),
  setActiveView: (activeView) => set({ activeView }),
  setFilterLocation: (filterLocation) => set({ filterLocation }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  updateOrderTotals: () => {
    const { currentOrder } = get();
    if (!currentOrder) return;
    const subtotal = currentOrder.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const tax = subtotal * 0.16;
    const service_charge = subtotal * 0.10;
    const total = subtotal + tax + service_charge;
    set({
      currentOrder: {
        ...currentOrder,
        subtotal,
        tax,
        service_charge,
        total,
      },
    });
  },

  fetchTables: async () => {
    set({ isLoading: true });
    try {
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  openTable: async (tableId, guestCount = 1) => {
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status: 'occupied', current_guests: guestCount } : t
      ),
    }));
  },

  addOrderItem: async (_tableId, item) => {
    get().addOrderItemToState(item);
  },

  updateOrderStatus: async (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
      currentOrder:
        state.currentOrder?.id === orderId
          ? { ...state.currentOrder, status }
          : state.currentOrder,
    }));
  },

  closeTable: async (tableId) => {
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status: 'free', current_guests: 0 } : t
      ),
      currentOrder: state.currentOrder?.table_id === tableId ? null : state.currentOrder,
    }));
  },
}));
