import { FeatureCategoryComparison, PricingPlan } from "@/types/pricing";

export const ANNUAL_DISCOUNT_PERCENT = 15;

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "base",
    name: "Base",
    tagline: "Para bancas, quiosques, lojas de retalho e comércio rápido",
    monthlyPrice: 800,
    ctaText: "Activar Plano Base",
    ctaHref: "https://wa.me/258840000000?text=Olá!%20Gostaria%20de%20activar%20o%20Plano%20Base%20(800%20MZN/mês)%20do%20TiConta.",
    modules: ["pos", "informal"],
    features: [
      { name: "Ponto de Venda (POS) Caixa Rápido", included: true },
      { name: "Gestão de Stock e Inventário", included: true },
      { name: "Caderno de Fiado & Gestão de Devedores", included: true },
      { name: "Cobranças automáticas por WhatsApp", included: true },
      { name: "Funcionamento 100% Offline (IndexedDB)", included: true },
      { name: "Impressão de Recibos Térmicos (80mm)", included: true },
      { name: "Restaurante, Mesas & Ecrã KDS", included: false },
      { name: "Contabilidade PGC & RH/INSS", included: false },
      { name: "CRM Comercial & Avicultura", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Para restaurantes, padarias, clínicas e PMEs de serviços",
    monthlyPrice: 2500,
    popular: true,
    ctaText: "Activar Plano Pro",
    ctaHref: "https://wa.me/258840000000?text=Olá!%20Gostaria%20de%20activar%20o%20Plano%20Pro%20(2.500%20MZN/mês)%20do%20TiConta.",
    modules: ["pos", "informal", "restaurant", "hr", "accounting"],
    features: [
      { name: "Tudo incluído no Plano Base", included: true },
      { name: "Restaurante, Mesas & Comandas Digitais", included: true },
      { name: "Ecrã de Cozinha Digital (KDS) em Tempo Real", included: true },
      { name: "Takeaway & Gestão de Estafetas", included: true },
      { name: "Recursos Humanos & Payroll com INSS/IRPS", included: true },
      { name: "Contabilidade Oficial PGC-NIRF Completa", included: true },
      { name: "Emissão de Fatura-Recibo e NFe", included: true },
      { name: "CRM, Avicultura & Projectos", included: false },
      { name: "API Dedicada & Webhooks", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Solução integral para indústrias, agro-pecuária, construtoras e redes",
    monthlyPrice: 5000,
    ctaText: "Activar Plano Enterprise",
    ctaHref: "https://wa.me/258840000000?text=Olá!%20Gostaria%20de%20activar%20o%20Plano%20Enterprise%20(5.000%20MZN/mês)%20do%20TiConta.",
    modules: ["pos", "informal", "restaurant", "hr", "accounting", "crm", "poultry", "projects", "auto_services"],
    features: [
      { name: "Tudo incluído no Plano Pro", included: true },
      { name: "CRM Comercial com Funil de Vendas Kanban", included: true },
      { name: "Produção Avícola, Lotes, Poedeiras e FCR", included: true },
      { name: "Obras, Empreitadas, Marcenaria & Corte 2D", included: true },
      { name: "Oficina Auto, Scanner OBD-II & Diagnóstico", included: true },
      { name: "Acesso à API REST & Integrações Externas", included: true },
      { name: "Multi-utilizadores e Filiais Ilimitadas", included: true },
      { name: "Backup em Nuvem e Suporte VIP 24/7", included: true },
    ],
  },
];

export const FEATURE_COMPARISON_DATA: FeatureCategoryComparison[] = [
  {
    category: "Vendas & POS",
    features: [
      {
        name: "POS Caixa Offline-First",
        description: "Emissão de recibos e vendas com IndexedDB sem internet",
        basic: true,
        professional: true,
        complete: true,
        enterprise: true,
      },
      {
        name: "Caderno de Fiado & Devedores",
        description: "Registo de dívidas e lembretes por WhatsApp",
        basic: true,
        professional: true,
        complete: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Restauração & Bares",
    features: [
      {
        name: "Mesas & Ecrã de Cozinha (KDS)",
        description: "Comandas em tempo real e divisão de contas",
        basic: false,
        professional: true,
        complete: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Contabilidade & Gestão",
    features: [
      {
        name: "Contabilidade PGC & Mapas de IVA",
        description: "Balancete, DRE e Balanço Patrimonial",
        basic: false,
        professional: true,
        complete: true,
        enterprise: true,
      },
      {
        name: "RH, Vencimentos & INSS",
        description: "Folhas de salário com deduções fiscais",
        basic: false,
        professional: true,
        complete: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Módulos Especializados",
    features: [
      {
        name: "CRM Comercial & Leads",
        description: "Funil de vendas e oportunidades",
        basic: false,
        professional: false,
        complete: true,
        enterprise: true,
      },
      {
        name: "Avicultura & Zootecnia",
        description: "Controlo de mortalidade, ração e ovos",
        basic: false,
        professional: false,
        complete: true,
        enterprise: true,
      },
      {
        name: "Obras, Fabrico & Oficina Auto",
        description: "Gestão de projectos e ordens de reparação",
        basic: false,
        professional: false,
        complete: true,
        enterprise: true,
      },
    ],
  },
];
