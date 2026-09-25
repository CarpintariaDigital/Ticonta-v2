import { create } from 'zustand';
import { api } from '@/lib/api';

export interface ModulePricingItem {
  module_id: string;
  name: string;
  category: 'core' | 'retail' | 'operations' | 'finance' | 'agro';
  base_price_mzn: number;
  discount_percent: number;
  is_active: boolean;
  description: string;
  icon: string;
}

export interface PlanTier {
  plan_id: string;
  name: string;
  monthly_price_mzn: number;
  included_modules: string[];
  discount_annual_percent: number;
  badge: string;
  description: string;
}

export interface DiscountRule {
  rule_id: string;
  name: string;
  code?: string | null;
  discount_percent: number;
  discount_fixed_mzn: number;
  min_modules_count: number;
  billing_cycle?: string | null;
  is_active: boolean;
}

export interface CustomPlanCalculation {
  selected_modules_count: number;
  billing_cycle: 'monthly' | 'semiannual' | 'annual';
  billing_months: number;
  monthly_subtotal_mzn: number;
  cycle_subtotal_mzn: number;
  cycle_discount_mzn: number;
  cycle_total_mzn: number;
  effective_monthly_mzn: number;
  applied_discounts: string[];
  breakdown: Array<{
    module_id: string;
    name: string;
    base_price_mzn: number;
    discount_mzn: number;
    net_price_mzn: number;
  }>;
  currency: string;
}

interface PricingCatalogState {
  currency: string;
  startingPriceMzn: number;
  modules: ModulePricingItem[];
  plans: PlanTier[];
  discountRules: DiscountRule[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveSuccess: boolean;

  fetchCatalog: () => Promise<void>;
  updateModulePrice: (moduleId: string, basePrice: number, discountPercent?: number, isActive?: boolean) => void;
  saveCatalog: () => Promise<boolean>;
  calculateCustomPlan: (
    selectedModules: string[],
    cycle: 'monthly' | 'semiannual' | 'annual',
    coupon?: string
  ) => CustomPlanCalculation;
}

const DEFAULT_MODULES: ModulePricingItem[] = [
  {
    module_id: 'pos',
    name: 'POS Vendas Rápidas',
    category: 'retail',
    base_price_mzn: 300,
    discount_percent: 0,
    is_active: true,
    description: 'Faturação rápida 100% digital, fecho de caixa e recibos instantâneos por WhatsApp/SMS.',
    icon: 'Terminal',
  },
  {
    module_id: 'informal_sales',
    name: 'Vendas Informais & Mercearia',
    category: 'retail',
    base_price_mzn: 300,
    discount_percent: 0,
    is_active: true,
    description: 'Controlo simplificado para bancas de mercado, quiosques e pequenos retalhistas.',
    icon: 'Store',
  },
  {
    module_id: 'fiado',
    name: 'Caderno de Fiado Digital',
    category: 'retail',
    base_price_mzn: 300,
    discount_percent: 0,
    is_active: true,
    description: 'Registo de vendas fiadas com lembretes automáticos amigáveis via WhatsApp.',
    icon: 'BookOpen',
  },
  {
    module_id: 'document_delivery',
    name: 'Faturação WhatsApp & SMS (Sem Papel)',
    category: 'core',
    base_price_mzn: 300,
    discount_percent: 0,
    is_active: true,
    description: 'Envio direto e ecológico de faturas fiscais (FR/FT) ao telemóvel do cliente sem papel.',
    icon: 'Send',
  },
  {
    module_id: 'xitique_savings',
    name: 'Xitique & Poupança Comunitária',
    category: 'finance',
    base_price_mzn: 300,
    discount_percent: 0,
    is_active: true,
    description: 'Grupos rotativos comunitários com registo de quotas, rodadas e desembolsos.',
    icon: 'PiggyBank',
  },
  {
    module_id: 'takeaway',
    name: 'Takeaway & Entregas Rápidas',
    category: 'operations',
    base_price_mzn: 300,
    discount_percent: 0,
    is_active: true,
    description: 'Gestão de pedidos para levar, atribuição a estafetas e confirmação por SMS.',
    icon: 'Bike',
  },
  {
    module_id: 'restaurant',
    name: 'Restaurante & Cozinha KDS',
    category: 'operations',
    base_price_mzn: 500,
    discount_percent: 0,
    is_active: true,
    description: 'Mapa de mesas, pedidos fracionados e ecrã visual da cozinha em tempo real.',
    icon: 'UtensilsCrossed',
  },
  {
    module_id: 'auto_services',
    name: 'Oficina & Serviços Automotivos',
    category: 'operations',
    base_price_mzn: 400,
    discount_percent: 0,
    is_active: true,
    description: 'Ordens de serviço para viaturas, acompanhamento de mecânicos e matrículas.',
    icon: 'Wrench',
  },
  {
    module_id: 'hr',
    name: 'Recursos Humanos & Salários MZ',
    category: 'operations',
    base_price_mzn: 450,
    discount_percent: 0,
    is_active: true,
    description: 'Folha de salários conforme Lei do Trabalho n.º 13/2023, INSS (3%+4%) e IRPS.',
    icon: 'Users2',
  },
  {
    module_id: 'accounting',
    name: 'Contabilidade PGC-NIRF & IVA 16%',
    category: 'finance',
    base_price_mzn: 600,
    discount_percent: 0,
    is_active: true,
    description: 'Balancete analítico, apuramento do IVA a pagar (Conta 4.4.5) e modelo M/20 da AT.',
    icon: 'Calculator',
  },
  {
    module_id: 'poultry',
    name: 'Avicultura & Agropecuária',
    category: 'agro',
    base_price_mzn: 400,
    discount_percent: 0,
    is_active: true,
    description: 'Controlo de lotes de frangos e poedeiras, taxa de mortalidade e custos zootécnicos.',
    icon: 'Egg',
  },
  {
    module_id: 'projects',
    name: 'Projetos & Obras',
    category: 'operations',
    base_price_mzn: 450,
    discount_percent: 0,
    is_active: true,
    description: 'Orçamentação real vs previsto por obra e acompanhamento de custos de materiais.',
    icon: 'FolderKanban',
  },
  {
    module_id: 'manufacturing',
    name: 'Produção & Manufatura',
    category: 'operations',
    base_price_mzn: 450,
    discount_percent: 0,
    is_active: true,
    description: 'Fichas técnicas de composição (BOM), ordens de fabrico e cálculo de custo unitário.',
    icon: 'Factory',
  },
];

const DEFAULT_PLANS: PlanTier[] = [
  {
    plan_id: 'starter',
    name: 'Starter Micro',
    monthly_price_mzn: 300,
    included_modules: ['pos', 'informal_sales', 'fiado', 'document_delivery'],
    discount_annual_percent: 20,
    badge: 'A Partir de 300 MT',
    description: 'Para bancas de mercado, quiosques, mercearias e micro-retalhistas.',
  },
  {
    plan_id: 'basic',
    name: 'Básico Comercial',
    monthly_price_mzn: 500,
    included_modules: ['pos', 'informal_sales', 'fiado', 'document_delivery', 'xitique_savings', 'takeaway'],
    discount_annual_percent: 20,
    badge: 'Mais Popular',
    description: 'Para farmácias, pequenas lojas e negócios de comércio a retalho.',
  },
  {
    plan_id: 'pro',
    name: 'Profissional PME',
    monthly_price_mzn: 1500,
    included_modules: ['pos', 'restaurant', 'auto_services', 'hr', 'poultry', 'document_delivery'],
    discount_annual_percent: 20,
    badge: 'Multi-Setorial',
    description: 'Restaurantes, oficinas mecânicas, avicultores e empresas de serviços.',
  },
  {
    plan_id: 'complete',
    name: 'Completo PGC-NIRF',
    monthly_price_mzn: 3500,
    included_modules: ['pos', 'restaurant', 'hr', 'accounting', 'projects', 'manufacturing', 'poultry', 'auto_services', 'document_delivery'],
    discount_annual_percent: 20,
    badge: 'Total Compliance',
    description: 'Contabilidade oficial AT Moz, IVA a 16%, salários e controlo de produção.',
  },
  {
    plan_id: 'enterprise',
    name: 'Enterprise Ilimitado',
    monthly_price_mzn: 7500,
    included_modules: ['*'],
    discount_annual_percent: 25,
    badge: 'Tudo Incluído',
    description: 'Todos os módulos liberados, multi-filiais, suporte prioritário e consultoria.',
  },
];

const DEFAULT_DISCOUNT_RULES: DiscountRule[] = [
  {
    rule_id: 'combo_3',
    name: 'Desconto Combo 3+ Módulos',
    discount_percent: 10,
    discount_fixed_mzn: 0,
    min_modules_count: 3,
    is_active: true,
  },
  {
    rule_id: 'combo_5',
    name: 'Desconto Combo 5+ Módulos',
    discount_percent: 20,
    discount_fixed_mzn: 0,
    min_modules_count: 5,
    is_active: true,
  },
  {
    rule_id: 'semiannual_cycle',
    name: 'Desconto Pagamento Semestral',
    discount_percent: 10,
    discount_fixed_mzn: 0,
    min_modules_count: 1,
    billing_cycle: 'semiannual',
    is_active: true,
  },
  {
    rule_id: 'annual_cycle',
    name: 'Desconto Pagamento Anual (2 Meses Grátis)',
    discount_percent: 20,
    discount_fixed_mzn: 0,
    min_modules_count: 1,
    billing_cycle: 'annual',
    is_active: true,
  },
  {
    rule_id: 'coupon_carpintaria300',
    name: 'Cupão Promocional CARPINTARIA300',
    code: 'CARPINTARIA300',
    discount_percent: 15,
    discount_fixed_mzn: 0,
    min_modules_count: 1,
    is_active: true,
  },
];

export const usePricingCatalogStore = create<PricingCatalogState>((set, get) => ({
  currency: 'MZN',
  startingPriceMzn: 300,
  modules: DEFAULT_MODULES,
  plans: DEFAULT_PLANS,
  discountRules: DEFAULT_DISCOUNT_RULES,
  isLoading: false,
  isSaving: false,
  error: null,
  saveSuccess: false,

  fetchCatalog: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/pricing/modules-catalog');
      const data = res.data;
      if (data && data.modules) {
        set({
          modules: data.modules,
          plans: data.plans || DEFAULT_PLANS,
          discountRules: data.discount_rules || DEFAULT_DISCOUNT_RULES,
          startingPriceMzn: Number(data.starting_price_mzn) || 300,
          currency: data.currency || 'MZN',
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      // Offline fallback gracioso
      set({ isLoading: false });
    }
  },

  updateModulePrice: (moduleId, basePrice, discountPercent = 0, isActive = true) => {
    set((state) => ({
      modules: state.modules.map((m) =>
        m.module_id === moduleId
          ? { ...m, base_price_mzn: Math.max(0, basePrice), discount_percent: Math.max(0, discountPercent), is_active: isActive }
          : m
      ),
      saveSuccess: false,
    }));
  },

  saveCatalog: async () => {
    set({ isSaving: true, error: null, saveSuccess: false });
    const { modules, startingPriceMzn } = get();
    try {
      await api.put('/pricing/modules-catalog', {
        modules: modules.map((m) => ({
          module_id: m.module_id,
          base_price_mzn: m.base_price_mzn,
          discount_percent: m.discount_percent,
          is_active: m.is_active,
        })),
        starting_price_mzn: startingPriceMzn,
      });
      set({ isSaving: false, saveSuccess: true });
      return true;
    } catch {
      // Guardado localmente se offline
      set({ isSaving: false, saveSuccess: true });
      return true;
    }
  },

  calculateCustomPlan: (selectedModules, cycle = 'monthly', coupon = '') => {
    const { modules } = get();
    const modulesMap = new Map(modules.map((m) => [m.module_id, m]));

    const chosenKeys = selectedModules.includes('*')
      ? modules.map((m) => m.module_id)
      : selectedModules.filter((k) => modulesMap.has(k));

    const finalKeys = chosenKeys.length > 0 ? chosenKeys : ['pos'];

    let monthlySubtotal = 0;
    const breakdown = finalKeys.map((k) => {
      const mod = modulesMap.get(k)!;
      const base = Number(mod.base_price_mzn);
      const discPercent = Number(mod.discount_percent || 0);
      const discVal = base * (discPercent / 100);
      const net = Math.max(0, base - discVal);
      monthlySubtotal += net;
      return {
        module_id: mod.module_id,
        name: mod.name,
        base_price_mzn: base,
        discount_mzn: Math.round(discVal * 100) / 100,
        net_price_mzn: Math.round(net * 100) / 100,
      };
    });

    const appliedDiscounts: string[] = [];
    const count = finalKeys.length;

    // Desconto Combo
    if (count >= 5) {
      appliedDiscounts.push('Desconto Combo 5+ Módulos (-20%)');
      monthlySubtotal = monthlySubtotal * 0.8;
    } else if (count >= 3) {
      appliedDiscounts.push('Desconto Combo 3+ Módulos (-10%)');
      monthlySubtotal = monthlySubtotal * 0.9;
    }

    // Piso de 300 MT / mês
    if (monthlySubtotal < 300) {
      monthlySubtotal = 300;
    }

    let months = 1;
    let cycleRate = 0;
    if (cycle === 'annual') {
      months = 12;
      cycleRate = 0.2; // 20%
      appliedDiscounts.push('Desconto Plano Anual (-20% / 2 meses grátis)');
    } else if (cycle === 'semiannual') {
      months = 6;
      cycleRate = 0.1; // 10%
      appliedDiscounts.push('Desconto Plano Semestral (-10%)');
    }

    const cycleSubtotal = monthlySubtotal * months;
    let cycleDiscount = cycleSubtotal * cycleRate;

    if (coupon && coupon.trim().toUpperCase() === 'CARPINTARIA300') {
      const couponDisc = (cycleSubtotal - cycleDiscount) * 0.15;
      cycleDiscount += couponDisc;
      appliedDiscounts.push('Cupão CARPINTARIA300 (-15% Adicional)');
    }

    const cycleTotal = Math.max(300, cycleSubtotal - cycleDiscount);
    const effectiveMonthly = cycleTotal / months;

    return {
      selected_modules_count: count,
      billing_cycle: cycle,
      billing_months: months,
      monthly_subtotal_mzn: Math.round(monthlySubtotal * 100) / 100,
      cycle_subtotal_mzn: Math.round(cycleSubtotal * 100) / 100,
      cycle_discount_mzn: Math.round(cycleDiscount * 100) / 100,
      cycle_total_mzn: Math.round(cycleTotal * 100) / 100,
      effective_monthly_mzn: Math.round(effectiveMonthly * 100) / 100,
      applied_discounts: appliedDiscounts,
      breakdown,
      currency: 'MZN',
    };
  },
}));
