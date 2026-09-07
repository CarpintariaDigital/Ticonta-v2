import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BarcodeProduct, CartItem } from "@/types/barcode";
import { barcodeService } from "@/services/barcode";

interface MobileCartState {
  items: CartItem[];
  cartTotal: number;
  tax: number;
  discounts: number;
  itemCount: number;
  lastScannedProduct: BarcodeProduct | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addItem: (product: BarcodeProduct, quantity?: number) => void;
  scanAndAdd: (barcode: string, companyId?: number) => Promise<BarcodeProduct>;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  clearError: () => void;
}

const recalculateTotals = (items: CartItem[]) => {
  let subtotal = 0;
  let totalTax = 0;
  let count = 0;

  for (const item of items) {
    const itemSubtotal = item.unit_price * item.quantity;
    const itemTax = itemSubtotal * (item.tax_rate / 100);
    subtotal += itemSubtotal;
    totalTax += itemTax;
    count += item.quantity;
  }

  return {
    cartTotal: subtotal,
    tax: totalTax,
    discounts: 0,
    itemCount: count,
  };
};

export const useMobileCartStore = create<MobileCartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartTotal: 0,
      tax: 0,
      discounts: 0,
      itemCount: 0,
      lastScannedProduct: null,
      isLoading: false,
      error: null,

      addItem: (product, quantity = 1) => {
        const currentItems = [...get().items];
        const existingIndex = currentItems.findIndex((i) => i.product_id === product.product_id);

        if (existingIndex > -1) {
          const currentQty = currentItems[existingIndex].quantity;
          const newQty = currentQty + quantity;
          currentItems[existingIndex] = {
            ...currentItems[existingIndex],
            quantity: newQty,
            total_price: newQty * currentItems[existingIndex].unit_price,
          };
        } else {
          currentItems.push({
            product_id: product.product_id,
            name: product.name,
            sku: product.sku,
            barcode: product.barcode,
            unit_price: product.unit_price,
            quantity: quantity,
            tax_rate: product.tax_rate,
            total_price: product.unit_price * quantity,
          });
        }

        const totals = recalculateTotals(currentItems);
        set({
          items: currentItems,
          lastScannedProduct: product,
          ...totals,
        });
      },

      scanAndAdd: async (barcode, companyId = 1) => {
        set({ isLoading: true, error: null });
        try {
          const product = await barcodeService.resolveBarcode(barcode, companyId);
          get().addItem(product, 1);
          set({ isLoading: false });
          return product;
        } catch (err: any) {
          const msg = err.response?.data?.detail || `Código '${barcode}' não encontrado.`;
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      removeItem: (productId) => {
        const filtered = get().items.filter((i) => i.product_id !== productId);
        const totals = recalculateTotals(filtered);
        set({
          items: filtered,
          ...totals,
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const currentItems = get().items.map((item) => {
          if (item.product_id === productId) {
            return {
              ...item,
              quantity,
              total_price: quantity * item.unit_price,
            };
          }
          return item;
        });

        const totals = recalculateTotals(currentItems);
        set({
          items: currentItems,
          ...totals,
        });
      },

      clearCart: () => {
        set({
          items: [],
          cartTotal: 0,
          tax: 0,
          discounts: 0,
          itemCount: 0,
          lastScannedProduct: null,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "ticonta-mobile-cart-storage",
    }
  )
);
