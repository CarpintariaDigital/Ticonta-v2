export function formatCurrency(amount: number | string | null | undefined): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(numericAmount)) return "0,00 MT";
  return new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(numericAmount)
    .replace("MZN", "MT")
    .trim();
}

export function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d,-]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formatador oficial e alias para compatibilidade com módulos Moçambique (Metical - MZN / MT)
 */
export function formatMZN(value: number | string | null | undefined): string {
  return formatCurrency(value);
}

/**
 * Cálculo fiscal de IVA a 16% (Decreto-Lei Moçambique)
 */
export function calculateIVA16(grossTotal: number, isIncluded: boolean = true) {
  if (isIncluded) {
    const net = grossTotal / 1.16;
    const tax = grossTotal - net;
    return {
      net: Number(net.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: grossTotal,
    };
  } else {
    const tax = grossTotal * 0.16;
    const total = grossTotal + tax;
    return {
      net: grossTotal,
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  }
}

export default formatCurrency;
