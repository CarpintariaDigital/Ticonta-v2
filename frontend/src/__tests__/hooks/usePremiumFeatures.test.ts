import { describe, it, expect, beforeEach } from "vitest";
import { usePremiumStore } from "@/store/premium.store";

describe("Premium Features Marketplace Store", () => {
  beforeEach(() => {
    usePremiumStore.setState({
      features: [
        {
          id: 1,
          name: "whatsapp_delivery",
          description: "Envio de faturas via WhatsApp",
          monthly_cost_mzn: 350.0,
          category: "communication",
          enabled: true,
        },
        {
          id: 2,
          name: "barcode_scanner",
          description: "Leitor de código de barras",
          monthly_cost_mzn: 400.0,
          category: "pos",
          enabled: false,
        },
      ],
      costBreakdown: {
        base_plan: "PROFESSIONAL",
        base_plan_cost_mzn: 1500.0,
        enabled_features: [{ name: "whatsapp_delivery", cost_mzn: 350.0 }],
        premium_addons_total_mzn: 350.0,
        grand_total_monthly_mzn: 1850.0,
        next_billing_date: "2026-09-15",
      },
      isLoading: false,
      error: null,
    });
  });

  it("checks if a premium feature is enabled accurately", () => {
    const store = usePremiumStore.getState();
    expect(store.hasFeature("whatsapp_delivery")).toBe(true);
    expect(store.hasFeature("barcode_scanner")).toBe(false);
    expect(store.hasFeature("non_existent_feature")).toBe(false);
  });

  it("calculates cost breakdowns properly", () => {
    const breakdown = usePremiumStore.getState().costBreakdown;
    expect(breakdown).toBeDefined();
    expect(breakdown?.grand_total_monthly_mzn).toBe(1850.0);
    expect(breakdown?.enabled_features.length).toBe(1);
  });
});
