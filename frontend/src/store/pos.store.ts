import { create } from "zustand";
import { CartItem, PaymentMethod, Product, SaleSummary } from "@/types/pos";

interface POSState {
  cart: CartItem[];
  discountPercentage: number;
  paymentMethod: PaymentMethod;
  selectedCustomerId: number | null;
  isProcessing: boolean;
  lastCompletedSale: any | null;
  isOnline: boolean;
  pendingSyncCount: number;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  setDiscountPercentage: (discount: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setSelectedCustomerId: (customerId: number | null) => void;
  clearCart: () => void;
  setIsProcessing: (processing: boolean) => void;
  setLastCompletedSale: (sale: any | null) => void;
  setIsOnline: (online: boolean) => void;
  setPendingSyncCount: (count: number) => void;
  getSummary: () => SaleSummary;
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  discountPercentage: 0,
  paymentMethod: "cash",
  selectedCustomerId: null,
  isProcessing: false,
  lastCompletedSale: null,
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  pendingSyncCount: 0,

  addItem: (product: Product, quantity = 1) => {
    const { cart } = get();
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      const newQty = updatedCart[existingIndex].quantity + quantity;
      // Validação rápida de limite de stock
      if (newQty <= product.quantity) {
        updatedCart[existingIndex].quantity = newQty;
        set({ cart: updatedCart });
      }
    } else {
      if (quantity <= product.quantity) {
        set({
          cart: [
            ...cart,
            {
              product,
              quantity,
              unit_price: product.unit_price,
              tax_rate: product.iva_rate || 16,
            },
          ],
        });
      }
    }
  },

  removeItem: (productId: number) => {
    const { cart } = get();
    set({ cart: cart.filter((item) => item.product.id !== productId) });
  },

  updateQuantity: (productId: number, quantity: number) => {
    const { cart } = get();
    if (quantity <= 0) {
      set({ cart: cart.filter((item) => item.product.id !== productId) });
      return;
    }

    const updatedCart = cart.map((item) => {
      if (item.product.id === productId) {
        const validQty = Math.min(quantity, item.product.quantity);
        return { ...item, quantity: validQty };
      }
      return item;
    });

    set({ cart: updatedCart });
  },

  setDiscountPercentage: (discount: number) => {
    const validDiscount = Math.max(0, Math.min(100, discount));
    set({ discountPercentage: validDiscount });
  },

  setPaymentMethod: (method: PaymentMethod) => set({ paymentMethod: method }),

  setSelectedCustomerId: (customerId: number | null) => set({ selectedCustomerId: customerId }),

  clearCart: () => set({ cart: [], discountPercentage: 0, selectedCustomerId: null }),

  setIsProcessing: (isProcessing: boolean) => set({ isProcessing }),

  setLastCompletedSale: (lastCompletedSale: any | null) => set({ lastCompletedSale }),

  setIsOnline: (isOnline: boolean) => set({ isOnline }),

  setPendingSyncCount: (pendingSyncCount: number) => set({ pendingSyncCount }),

  getSummary: () => {
    const { cart, discountPercentage } = get();
    let subtotal = 0;
    let taxAmount = 0;
    let itemCount = 0;

    cart.forEach((item) => {
      const lineTotal = item.unit_price * item.quantity;
      const lineTax = lineTotal * (item.tax_rate / 100);
      subtotal += lineTotal;
      taxAmount += lineTax;
      itemCount += item.quantity;
    });

    const grossTotal = subtotal + taxAmount;
    const discountAmount = grossTotal * (discountPercentage / 100);
    const netTotal = Math.max(0, grossTotal - discountAmount);

    return {
      subtotal,
      taxAmount,
      discountPercentage,
      discountAmount,
      netTotal,
      itemCount,
    };
  },
}));
