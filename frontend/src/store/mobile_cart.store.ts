import { create } from 'zustand';

export interface MobileCartItem {
  product_id?: string | number;
  id?: string | number;
  name: string;
  unit_price: number;
  price?: number;
  quantity: number;
  tax_rate?: number;
  barcode?: string;
  sku?: string;
  stock_quantity?: number;
  active?: boolean;
  scan_count?: number;
}

export interface MobileCartState {
  items: MobileCartItem[];
  itemCount: number;
  cartTotal: number;
  tax: number;
  total: number;
  customerNote: string;

  // Actions
  addItem: (product: any, qty?: number) => void;
  removeItem: (productId: string | number) => void;
  incrementQty: (productId: string | number) => void;
  decrementQty: (productId: string | number) => void;
  setNote: (note: string) => void;
  clearCart: () => void;
}

function calculateCartTotals(items: MobileCartItem[]) {
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce(
    (sum, i) => sum + (i.unit_price ?? i.price ?? 0) * i.quantity,
    0
  );
  const tax = items.reduce((sum, i) => {
    const rawRate = i.tax_rate !== undefined ? i.tax_rate : 16.0;
    const rate = rawRate > 1 ? rawRate / 100 : rawRate;
    return sum + (i.unit_price ?? i.price ?? 0) * i.quantity * rate;
  }, 0);

  return {
    itemCount,
    cartTotal,
    total: cartTotal + tax,
    tax,
  };
}

export const useMobileCartStore = create<MobileCartState>((set) => ({
  items: [],
  itemCount: 0,
  cartTotal: 0,
  tax: 0,
  total: 0,
  customerNote: '',

  addItem: (product, qty = 1) =>
    set((state) => {
      const pid = product.product_id ?? product.id;
      const unitPrice = product.unit_price ?? product.price ?? 0;
      const taxRate = product.tax_rate !== undefined ? product.tax_rate : 16.0;

      const existingIndex = state.items.findIndex(
        (i) => (i.product_id ?? i.id) === pid
      );

      let newItems: MobileCartItem[];
      if (existingIndex >= 0) {
        newItems = state.items.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + qty } : item
        );
      } else {
        newItems = [
          ...state.items,
          {
            ...product,
            product_id: pid,
            id: pid,
            unit_price: unitPrice,
            quantity: qty,
            tax_rate: taxRate,
          },
        ];
      }

      const totals = calculateCartTotals(newItems);
      return {
        items: newItems,
        ...totals,
      };
    }),

  removeItem: (productId) =>
    set((state) => {
      const newItems = state.items.filter(
        (i) => (i.product_id ?? i.id) !== productId
      );
      const totals = calculateCartTotals(newItems);
      return {
        items: newItems,
        ...totals,
      };
    }),

  incrementQty: (productId) =>
    set((state) => {
      const newItems = state.items.map((item) =>
        (item.product_id ?? item.id) === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      const totals = calculateCartTotals(newItems);
      return {
        items: newItems,
        ...totals,
      };
    }),

  decrementQty: (productId) =>
    set((state) => {
      const target = state.items.find(
        (i) => (i.product_id ?? i.id) === productId
      );
      if (!target) return state;

      let newItems: MobileCartItem[];
      if (target.quantity <= 1) {
        newItems = state.items.filter(
          (i) => (i.product_id ?? i.id) !== productId
        );
      } else {
        newItems = state.items.map((item) =>
          (item.product_id ?? item.id) === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }

      const totals = calculateCartTotals(newItems);
      return {
        items: newItems,
        ...totals,
      };
    }),

  setNote: (customerNote) => set({ customerNote }),

  clearCart: () =>
    set({
      items: [],
      itemCount: 0,
      cartTotal: 0,
      tax: 0,
      total: 0,
      customerNote: '',
    }),
}));
