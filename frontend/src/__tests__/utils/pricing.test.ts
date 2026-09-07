import { describe, it, expect } from "vitest";
import { paymentService } from "@/services/payment";
import { PRICING_PLANS } from "@/lib/pricing-data";

describe("Pricing & Payment Logic", () => {
  it("calculates monthly pricing without discount", () => {
    const res = paymentService.calculatePrice(1500, "monthly");
    expect(res.total).toBe(1500);
    expect(res.monthlyEquivalent).toBe(1500);
    expect(res.savings).toBe(0);
  });

  it("calculates annual pricing with 10% discount", () => {
    // 1500 * 12 = 18000. 10% desc = 16200 MT
    const res = paymentService.calculatePrice(1500, "annual");
    expect(res.total).toBe(16200);
    expect(res.monthlyEquivalent).toBe(1350);
    expect(res.savings).toBe(1800);
  });

  it("ensures all 3 plans are configured with correct modules and prices", () => {
    expect(PRICING_PLANS.length).toBe(3);
    const planIds = PRICING_PLANS.map((p) => p.id);
    expect(planIds).toEqual(["base", "pro", "enterprise"]);

    const basePlan = PRICING_PLANS.find((p) => p.id === "base");
    expect(basePlan?.monthlyPrice).toBe(800);
    expect(basePlan?.modules).toContain("pos");
    expect(basePlan?.modules).toContain("informal");

    const proPlan = PRICING_PLANS.find((p) => p.id === "pro");
    expect(proPlan?.monthlyPrice).toBe(2500);
    expect(proPlan?.modules).toContain("restaurant");
    expect(proPlan?.modules).toContain("accounting");

    const entPlan = PRICING_PLANS.find((p) => p.id === "enterprise");
    expect(entPlan?.monthlyPrice).toBe(5000);
    expect(entPlan?.modules).toContain("crm");
    expect(entPlan?.modules).toContain("poultry");
  });
});
