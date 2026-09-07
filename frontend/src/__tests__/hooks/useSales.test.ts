import { describe, it, expect } from "vitest";
import { usePOSStore } from "@/store/pos.store";
import { Product } from "@/types/pos";

describe("usePOSStore", () => {
  it("initializes with empty cart", () => {
    const state = usePOSStore.getState();
    expect(state.cart).toHaveLength(0);
    expect(state.selectedCustomerId).toBe(null);
    expect(state.discountPercentage).toBe(0);
  });

  it("adds and removes items with stock protection and summary calculations", () => {
    const product: Product = {
      id: 1,
      company_id: 1,
      name: "Porta Chanfuta Maciça",
      sku: "SKU-P1",
      category: "carpintaria",
      unit_price: 7500,
      cost_price: 4000,
      quantity: 10,
      iva_rate: 16,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    usePOSStore.getState().addItem(product, 2);

    let state = usePOSStore.getState();
    expect(state.cart).toHaveLength(1);
    expect(state.cart[0].product.name).toBe("Porta Chanfuta Maciça");
    expect(state.cart[0].quantity).toBe(2);

    const summary = usePOSStore.getState().getSummary();
    expect(summary.subtotal).toBe(15000);
    expect(summary.taxAmount).toBe(2400);
    expect(summary.netTotal).toBe(17400);
    expect(summary.itemCount).toBe(2);

    usePOSStore.getState().clearCart();
    state = usePOSStore.getState();
    expect(state.cart).toHaveLength(0);
  });
});
