import { create } from "zustand";
import { POSItem, Product, POSSummary, POSSession } from "@/types/pos";

export interface POSState {
  cart: POSItem[];
  selectedCustomerId: number | null;
  discountPercentage: number;
  session: POSSession | null;
  isProcessing: boolean;

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string | number) => void;
  updateQty: (id: string | number, qty: number) => void;
  applyDiscount: (discount: number) => void;
  clearCart: () => void;
  getSummary: () => POSSummary;
  openSession: (userId: number, initialAmount?: number) => void;
  closeSession: () => void;
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  selectedCustomerId: null,
  discountPercentage: 0,
  session: null,
  isProcessing: false,

  addItem: (product: Product, quantity = 1) => {
    const { cart } = get();
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      set({ cart: updated });
    } else {
      set({
        cart: [
          ...cart,
          {
            id: `item_${product.id}_${Date.now()}`,
            product,
            quantity,
            unit_price: product.unit_price,
          },
        ],
      });
    }
  },

  removeItem: (id: string | number) => {
    set({ cart: get().cart.filter((item) => item.id !== id && item.product.id !== id) });
  },

  updateQty: (id: string | number, qty: number) => {
    if (qty <= 0) {
      get().removeItem(id);
      return;
    }
    set({
      cart: get().cart.map((item) =>
        item.id === id || item.product.id === id ? { ...item, quantity: qty } : item
      ),
    });
  },

  applyDiscount: (discountPercentage: number) => {
    set({ discountPercentage });
  },

  clearCart: () => {
    set({ cart: [], selectedCustomerId: null, discountPercentage: 0 });
  },

  getSummary: (): POSSummary => {
    const { cart, discountPercentage } = get();
    let subtotal = 0;
    let taxAmount = 0;
    let itemCount = 0;

    for (const item of cart) {
      const lineTotal = item.product.unit_price * item.quantity;
      subtotal += lineTotal;
      const rate = item.product.iva_rate !== undefined ? item.product.iva_rate : 16;
      taxAmount += lineTotal * (rate / 100);
      itemCount += item.quantity;
    }

    if (discountPercentage > 0) {
      const discount = subtotal * (discountPercentage / 100);
      subtotal -= discount;
      taxAmount = subtotal * 0.16;
    }

    const netTotal = subtotal + taxAmount;
    return {
      subtotal,
      taxAmount,
      netTotal,
      itemCount,
    };
  },

  openSession: (user_id: number, opening_amount = 0) => {
    set({
      session: {
        id: Date.now(),
        user_id,
        opening_amount,
        opened_at: new Date().toISOString(),
        status: "open",
      },
    });
  },

  closeSession: () => {
    set({ session: null });
  },
}));
