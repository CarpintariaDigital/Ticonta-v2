export interface PricingPlan {
  id: "base" | "pro" | "enterprise" | string;
  name: string;
  monthlyPrice: number;
  annualPrice?: number;
  modules: string[];
  features?: string[];
  description?: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "base",
    name: "BÁSICO",
    monthlyPrice: 800,
    annualPrice: 8640,
    modules: ["pos", "informal"],
    features: ["Vendas Rápidas (POS)", "Controle de Fiado & Dívidas", "Impressão Térmica 58/80mm", "Offline-First Sync"],
    description: "Ideal para bancas, mercearias e pequenos comerciantes.",
  },
  {
    id: "pro",
    name: "PROFISSIONAL",
    monthlyPrice: 2500,
    annualPrice: 27000,
    modules: ["pos", "informal", "restaurant", "accounting", "manufacturing"],
    features: ["Tudo do Básico", "Gestão de Restaurante & Mesas", "Contabilidade PGC-NIRF", "Ordens de Produção & Marcenaria"],
    description: "Perfeito para restaurantes, oficinas e empresas em crescimento.",
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    monthlyPrice: 5000,
    annualPrice: 54000,
    modules: ["pos", "informal", "restaurant", "accounting", "manufacturing", "crm", "poultry", "takeaway", "hr", "*"],
    features: ["Acesso Ilimitado a Todos os Módulos", "CRM & Pipeline de Vendas", "Gestão de Avicultura & Lotes", "Folha de Pagamento & INSS Moz", "Suporte Prioritário 24/7"],
    description: "Solução completa para agropecuárias, indústrias e grandes operações.",
  },
];

export const PLANS = PRICING_PLANS;

export function getPlanByCode(code: string): PricingPlan | undefined {
  const clean = code.toLowerCase().trim();
  return PRICING_PLANS.find((p) => p.id === clean);
}

export function getFeaturesByPlan(planId: string): string[] {
  const plan = getPlanByCode(planId);
  return plan?.features || [];
}
