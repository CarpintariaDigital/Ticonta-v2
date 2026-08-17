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

  it("ensures all 4 plans are configured with correct modules", () => {
    expect(PRICING_PLANS.length).toBe(4);
    const planIds = PRICING_PLANS.map((p) => p.id);
    expect(planIds).toEqual(["basic", "professional", "complete", "enterprise"]);

    const completePlan = PRICING_PLANS.find((p) => p.id === "complete");
    expect(completePlan?.modules).toContain("manufacturing");
    expect(completePlan?.modules).toContain("accounting");
  });
});
