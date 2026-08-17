import { describe, it, expect, beforeEach } from "vitest";
import { useMobileCartStore } from "@/store/mobile_cart.store";

describe("Mobile Barcode Cart Store", () => {
  beforeEach(() => {
    useMobileCartStore.getState().clearCart();
  });

  it("adds items and calculates subtotal and taxes accurately", () => {
    const store = useMobileCartStore.getState();

    store.addItem({
      product_id: 1,
      name: "Porta Chanfuta Maciça",
      sku: "SKU-PORTA-01",
      barcode: "560123456789",
      unit_price: 7500.0,
      stock_quantity: 10,
      tax_rate: 16.0,
      active: true,
      scan_count: 5,
    });

    const state = useMobileCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.itemCount).toBe(1);
    expect(state.cartTotal).toBe(7500.0);
    expect(state.tax).toBe(1200.0);
  });

  it("increments quantity and updates totals when scanning same product", () => {
    const store = useMobileCartStore.getState();

    const mockProduct = {
      product_id: 2,
      name: "Cadeira de Escritório",
      sku: "SKU-CAD-02",
      barcode: "560999888222",
      unit_price: 3000.0,
      stock_quantity: 20,
      tax_rate: 16.0,
      active: true,
      scan_count: 2,
    };

    store.addItem(mockProduct, 1);
    store.addItem(mockProduct, 2);

    const state = useMobileCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(3);
    expect(state.cartTotal).toBe(9000.0);
    expect(state.tax).toBe(1440.0);
  });

  it("removes product and clears cart properly", () => {
    const store = useMobileCartStore.getState();

    store.addItem({
      product_id: 3,
      name: "Mesa Reunião",
      sku: "SKU-MES-03",
      unit_price: 15000.0,
      stock_quantity: 5,
      tax_rate: 16.0,
      active: true,
      scan_count: 1,
    });

    expect(useMobileCartStore.getState().items.length).toBe(1);

    store.removeItem(3);
    expect(useMobileCartStore.getState().items.length).toBe(0);
    expect(useMobileCartStore.getState().cartTotal).toBe(0);
  });
});
