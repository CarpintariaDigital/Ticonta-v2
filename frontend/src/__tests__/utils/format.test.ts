import { describe, it, expect } from "vitest";

export function formatMZN(amount: number): string {
  return `${Number(amount).toLocaleString("pt-MZ")} MZN`;
}

export function formatPercentage(pct: number): string {
  return `${pct.toFixed(1)}%`;
}

export function formatTax(taxRate: number): string {
  return `${taxRate}% IVA`;
}

describe("Format Utilities", () => {
  it("formats MZN currency numbers correctly", () => {
    expect(formatMZN(15000)).toContain("15");
    expect(formatMZN(15000)).toContain("MZN");
    expect(formatMZN(0)).toBe("0 MZN");
  });

  it("formats percentages with 1 decimal place", () => {
    expect(formatPercentage(85.456)).toBe("85.5%");
    expect(formatPercentage(100)).toBe("100.0%");
  });

  it("formats standard VAT rate tags", () => {
    expect(formatTax(16)).toBe("16% IVA");
    expect(formatTax(7)).toBe("7% IVA");
  });
});
