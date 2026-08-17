import { describe, it, expect } from "vitest";

const EXCHANGE_RATES: Record<string, number> = {
  USD: 63.85,
  ZAR: 3.48,
  EUR: 69.20,
};

export function convertToMZN(amount: number, currency: "USD" | "ZAR" | "EUR"): number {
  const rate = EXCHANGE_RATES[currency] || 1;
  return parseFloat((amount * rate).toFixed(2));
}

export function convertFromMZN(amountMZN: number, targetCurrency: "USD" | "ZAR" | "EUR"): number {
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return parseFloat((amountMZN / rate).toFixed(2));
}

describe("Currency Conversion Utils", () => {
  it("converts foreign currencies to MZN with correct rates", () => {
    expect(convertToMZN(100, "USD")).toBe(6385.00);
    expect(convertToMZN(1000, "ZAR")).toBe(3480.00);
  });

  it("converts MZN to foreign currencies properly", () => {
    expect(convertFromMZN(6385, "USD")).toBe(100.00);
    expect(convertFromMZN(3480, "ZAR")).toBe(1000.00);
  });
});
