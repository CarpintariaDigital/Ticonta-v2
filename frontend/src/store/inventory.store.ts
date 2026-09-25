import { create } from 'zustand';
import { api } from '@/lib/api';

export interface InventoryItem {
  id: number;
  company_id: number;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  unit: string;
  unit_price: number;
  cost_price: number;
  current_stock: number;
  min_stock_alert: number;
  iva_rate: number;
  location?: string;
  supplier_id?: number;
  active: boolean;
  stock_value_cost_mzn: number;
  stock_value_retail_mzn: number;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: number;
  company_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  movement_type: string;
  quantity: number;
  stock_before: number;
  stock_after: number;
  unit_cost: number;
  reference_document?: string;
  notes?: string;
  created_at: string;
}

export interface InventoryOverview {
  total_items: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_stock_units: number;
  total_cost_value_mzn: number;
  total_retail_value_mzn: number;
  potential_margin_mzn: number;
  currency: string;
}

interface InventoryState {
  items: InventoryItem[];
  movements: StockMovement[];
  overview: InventoryOverview | null;
  isLoading: boolean;
  error: string | null;

  fetchInventory: () => Promise<void>;
  createItem: (data: any) => Promise<InventoryItem>;
  recordMovement: (data: any) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  movements: [],
  overview: null,
  isLoading: false,
  error: null,

  fetchInventory: async () => {
    set({ isLoading: true, error: null });
    try {
      const [itemsRes, overviewRes, movsRes] = await Promise.all([
        api.get<InventoryItem[]>('/inventory/items'),
        api.get<InventoryOverview>('/inventory/overview'),
        api.get<StockMovement[]>('/inventory/movements').catch(() => ({ data: [] })),
      ]);

      set({
        items: Array.isArray(itemsRes.data) ? itemsRes.data : [],
        overview: overviewRes.data,
        movements: Array.isArray(movsRes.data) ? movsRes.data : [],
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  createItem: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<InventoryItem>('/inventory/items', data);
      const newItem = res.data;
      set((state) => ({ items: [newItem, ...state.items], isLoading: false }));
      return newItem;
    } catch {
      const fallbackItem: InventoryItem = {
        id: Date.now(),
        company_id: 1,
        name: data.name,
        sku: data.sku,
        category: data.category || 'Geral',
        unit: data.unit || 'un',
        unit_price: Number(data.unit_price) || 0,
        cost_price: Number(data.cost_price) || 0,
        current_stock: Number(data.current_stock) || 0,
        min_stock_alert: Number(data.min_stock_alert) || 5,
        iva_rate: 16,
        active: true,
        stock_value_cost_mzn: (Number(data.current_stock) || 0) * (Number(data.cost_price) || 0),
        stock_value_retail_mzn: (Number(data.current_stock) || 0) * (Number(data.unit_price) || 0),
        is_low_stock: (Number(data.current_stock) || 0) <= (Number(data.min_stock_alert) || 5),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((state) => ({ items: [fallbackItem, ...state.items], isLoading: false }));
      return fallbackItem;
    }
  },

  recordMovement: async (data) => {
    try {
      await api.post('/inventory/movements', data);
      await get().fetchInventory();
    } catch {
      // Local update
      const { items } = get();
      const target = items.find((i) => i.id === data.product_id);
      if (target) {
        const qty = Number(data.quantity);
        const newStock = data.movement_type.startsWith('in_')
          ? target.current_stock + qty
          : Math.max(0, target.current_stock - qty);

        set((state) => ({
          items: state.items.map((i) =>
            i.id === data.product_id
              ? {
                  ...i,
                  current_stock: newStock,
                  stock_value_cost_mzn: newStock * i.cost_price,
                  stock_value_retail_mzn: newStock * i.unit_price,
                  is_low_stock: newStock <= i.min_stock_alert,
                }
              : i
          ),
        }));
      }
    }
  },
}));
