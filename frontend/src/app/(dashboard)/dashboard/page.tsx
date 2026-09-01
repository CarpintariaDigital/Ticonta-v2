"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar, { NAVIGATION_MODULES } from "@/components/layout/DashboardNavbar";
import { useAuthStore } from "@/store/auth.store";
import { UserManagerModal } from "@/components/admin/UserManagerModal";
import { PaymentIntegrationsModal } from "@/components/settings/PaymentIntegrationsModal";
import {
  ShoppingCart,
  UtensilsCrossed,
  Bike,
  Store,
  Wrench,
  Egg,
  TrendingUp,
  BookOpen,
  Users,
  FolderKanban,
  Factory,
  BarChart3,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CreditCard,
  Smartphone,
  Banknote,
  DollarSign,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  Settings,
  UserPlus,
  RefreshCw,
  Coins,
  Package,
  FileText,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModuleCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
  kpi?: string;
  kpiLabel?: string;
}

const ALL_MODULES: {
  category: string;
  modules: ModuleCardProps[];
}[] = [
  {
    category: "Vendas, Balcão, Propostas & Comunidade",
    modules: [
      {
        title: "Ponto de Venda (POS)",
        description: "Emissão de recibos digitais via WhatsApp, leitor de código de barras e cálculo de troco.",
        href: "/pos",
        icon: ShoppingCart,
        iconColor: "text-emerald-600",
        badge: "WhatsApp Ready",
        badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
        kpi: "38.450 MT",
        kpiLabel: "Vendas Hoje",
      },
      {
        title: "Cotações & Faturas Pró-Forma",
        description: "Emissão de propostas comerciais com IVA 16%, envio WhatsApp e impressão timbrada A4.",
        href: "/quotes",
        icon: FileText,
        iconColor: "text-blue-600",
        badge: "Propostas MZ",
        badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
        kpi: "6 Ativas",
        kpiLabel: "Cotações Válidas",
      },
      {
        title: "Vendas Informais & Fiado",
        description: "Caderno de fiado, controlo de dívidas por cliente, limites de fiado e lembretes por SMS/WhatsApp.",
        href: "/informal-sales",
        icon: Store,
        iconColor: "text-yellow-600",
        badge: "Gestão Local",
        badgeColor: "bg-yellow-50 text-yellow-800 border-yellow-200",
        kpi: "42.150 MT",
        kpiLabel: "Fiado a Receber",
      },
      {
        title: "Xitique & Poupanças Comunitárias",
        description: "Gestão de fundos rotativos, grupos de poupança, taxas de juro social e distribuição de lucros.",
        href: "/xitique",
        icon: PiggyBank,
        iconColor: "text-amber-600",
        badge: "Poupança Solidária",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        kpi: "185.000 MT",
        kpiLabel: "Fundo em Caixa",
      },
    ],
  },
  {
    category: "Restauração, Hotelaria & Operações Rápidas",
    modules: [
      {
        title: "Restaurante & Bares",
        description: "Mapa interativo de mesas, comanda digital, divisão de contas e ecrã de cozinha (KDS).",
        href: "/restaurant",
        icon: UtensilsCrossed,
        iconColor: "text-amber-600",
        badge: "Mesas & KDS",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        kpi: "8 Mesas",
        kpiLabel: "Ocupação Atual",
      },
      {
        title: "Takeaway & Entregas",
        description: "Despacho de encomendas, rastreamento de estafetas e taxas por zona.",
        href: "/takeaway",
        icon: Bike,
        iconColor: "text-sky-600",
        badge: "Entregas",
        badgeColor: "bg-sky-50 text-sky-800 border-sky-200",
        kpi: "14 Pedidos",
        kpiLabel: "Em trânsito",
      },
      {
        title: "Oficina & Serviços Auto",
        description: "Quadro de boxes, mecânica geral, bate-chapa, scanner OBD-II e peças.",
        href: "/auto-services",
        icon: Wrench,
        iconColor: "text-teal-600",
        badge: "Oficina 360º",
        badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
        kpi: "6 Viaturas",
        kpiLabel: "Em Reparação",
      },
    ],
  },
  {
    category: "Finanças, Contabilidade & Gestão",
    modules: [
      {
        title: "Contabilidade PGC-NIRF",
        description: "Diário de lançamentos, balancete de verificação, plano de contas e DRE fiscal.",
        href: "/accounting",
        icon: BookOpen,
        iconColor: "text-blue-600",
        badge: "PGC-NIRF MZ",
        badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
        kpi: "Equilibrado",
        kpiLabel: "Balancete Ativo",
      },
      {
        title: "Produção Avícola & Agropecuária",
        description: "Lotes de frangos e poedeiras, postura de ovos, mortalidade e custos zootécnicos.",
        href: "/poultry",
        icon: Egg,
        iconColor: "text-orange-600",
        badge: "Zootécnico",
        badgeColor: "bg-orange-50 text-orange-800 border-orange-200",
        kpi: "2.400 Aves",
        kpiLabel: "Efetivo Vivo",
      },
      {
        title: "CRM & Gestão de Clientes",
        description: "Base de dados unificada, histórico de compras, limites de crédito e fidelização.",
        href: "/crm",
        icon: Users,
        iconColor: "text-indigo-600",
        badge: "Clientes",
        badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
        kpi: "342 Clientes",
        kpiLabel: "Registados",
      },
      {
        title: "Obras & Gestão de Projetos",
        description: "Controlo orçamental de empreitadas, autos de medição e cronograma físico-financeiro.",
        href: "/projects",
        icon: FolderKanban,
        iconColor: "text-purple-600",
        badge: "Empreitadas",
        badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
        kpi: "4 Obras",
        kpiLabel: "Em Execução",
      },
      {
        title: "Fabrico & Marcenaria",
        description: "Ordens de Produção (OP), otimizador de corte de chapas 2D e cálculo de margem.",
        href: "/manufacturing",
        icon: Factory,
        iconColor: "text-amber-600",
        badge: "Indústria & Marcenaria",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        kpi: "7 OPs",
        kpiLabel: "Em Linha de Corte",
      },
      {
        title: "Recursos Humanos & INSS",
        description: "Processamento de salários, tabela do IRPS 2026, cálculo do INSS e folhas de ponto.",
        href: "/hr",
        icon: Users,
        iconColor: "text-rose-600",
        badge: "Salários MZ",
        badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
        kpi: "18 Colaboradores",
        kpiLabel: "Folha Ativa",
      },
      {
        title: "Relatórios & Fecho de Caixa",
        description: "Exportação SAF-T Moçambique, mapas fiscais de IVA e relatórios gerenciais.",
        href: "/reports",
        icon: BarChart3,
        iconColor: "text-emerald-600",
        badge: "Fiscalidade MZ",
        badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
        kpi: "Pronto",
        kpiLabel: "Fecho Diário",
      },
    ],
  },
  {
    category: "Administração, Licenças & Sistema",
    modules: [
      {
        title: "Painel Admin & Emissão de Licenças",
        description: "Gestão master de subscrições, ativação por chaves HMAC-SHA256 e planos comerciais.",
        href: "/admin/licensing",
        icon: ShieldCheck,
        iconColor: "text-purple-600",
        badge: "Admin Master",
        badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
        kpi: "Licenciamento",
        kpiLabel: "Emissão de Chaves",
      },
      {
        title: "Dados da Empresa & Logótipo Oficial",
        description: "Configuração do logótipo da loja, NUIT, contactos e rodapés de recibos e faturas.",
        href: "/settings/company",
        icon: Building2,
        iconColor: "text-teal-600",
        badge: "Faturação",
        badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
        kpi: "Logótipo & NUIT",
        kpiLabel: "Personalizado",
      },
    ],
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isPaymentIntegrationsOpen, setIsPaymentIntegrationsOpen] = useState(false);

  // Sales Trend Mock Data (Last 7 Days)
  const salesHistory = [
    { day: "Seg", total: 32400, mpesa: 14000, emola: 6400, cash: 8000, card: 4000 },
    { day: "Ter", total: 41200, mpesa: 18000, emola: 8200, cash: 10000, card: 5000 },
    { day: "Qua", total: 38900, mpesa: 15500, emola: 7400, cash: 11000, card: 5000 },
    { day: "Qui", total: 49500, mpesa: 22000, emola: 11500, cash: 9000, card: 7000 },
    { day: "Sex", total: 68300, mpesa: 31000, emola: 14300, cash: 14000, card: 9000 },
    { day: "Sáb", total: 84100, mpesa: 38000, emola: 19100, cash: 18000, card: 9000 },
    { day: "Hoje", total: 54800, mpesa: 26000, emola: 12800, cash: 11000, card: 5000 },
  ];

  const maxSale = Math.max(...salesHistory.map((s) => s.total));

  return (
    <div className="w-full space-y-8">
      {/* Executive Header & Quick Admin Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 border border-emerald-900/10 p-6 rounded-3xl backdrop-blur-xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-widest font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Painel Executivo Integrado
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            Olá, {user?.username || "Administrador"} 👋
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Visão operacional em tempo real de vendas, pagamentos móveis, fiados e poupanças em Moçambique.
          </p>
        </div>

        {/* Quick Action Buttons for Admin Controls & Payments */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/licensing">
            <Button className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>👑 Painel Admin & Licenças</span>
            </Button>
          </Link>

          <Link href="/settings/company">
            <Button variant="outline" className="border-teal-300 bg-teal-50 text-teal-900 hover:bg-teal-100 font-bold text-xs flex items-center gap-1.5 rounded-xl">
              <Building2 className="w-4 h-4" />
              <span>Empresa & Logo</span>
            </Button>
          </Link>

          <Link href="/quotes">
            <Button variant="outline" className="border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 rounded-xl">
              <FileText className="w-4 h-4" />
              <span>Pró-Formas</span>
            </Button>
          </Link>

          <Button
            onClick={() => setIsUserManagerOpen(true)}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-xs"
          >
            <Users className="w-4 h-4" />
            <span>Utilizadores</span>
          </Button>

          <Button
            onClick={() => setIsPaymentIntegrationsOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-xs"
          >
            <Smartphone className="w-4 h-4" />
            <span>M-Pesa / e-Mola / POS</span>
          </Button>
        </div>
      </div>

      {/* Consolidated Executive KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white/80 border border-emerald-900/10 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Faturação Total Hoje</span>
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
            54.800,00 <span className="text-xs text-emerald-700 font-normal">MT</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% vs dia anterior
          </div>
        </div>

        <div className="p-5 bg-white/80 border border-emerald-900/10 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Pagamentos Móveis (M-Pesa / e-Mola)</span>
            <Smartphone className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 font-mono">
            38.800,00 <span className="text-xs text-rose-600 font-normal">MT</span>
          </div>
          <div className="text-[10px] text-zinc-500">
            70.8% do volume total de pagamentos
          </div>
        </div>

        <div className="p-5 bg-white/80 border border-emerald-900/10 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Total a Receber (Fiados)</span>
            <Store className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 font-mono">
            42.150,00 <span className="text-xs text-amber-600 font-normal">MT</span>
          </div>
          <div className="text-[10px] text-zinc-500">
            8 contas vencidas com lembrete WhatsApp
          </div>
        </div>

        <div className="p-5 bg-white/80 border border-emerald-900/10 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Fundos de Xitique & Poupança</span>
            <PiggyBank className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-800 font-mono">
            185.000,00 <span className="text-xs text-amber-700 font-normal">MT</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold">
            +6.750 MT juros gerados para partilha
          </div>
        </div>
      </div>

      {/* Graphical Analytics: Sales Trend & Payment Methods Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Graph: 7-Day Revenue Trend (Visual SVG & Bar Chart) */}
        <div className="lg:col-span-8 bg-white/80 border border-emerald-900/10 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2 font-mono">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Tendência de Vendas (Últimos 7 Dias)
              </h3>
              <p className="text-xs text-zinc-500">Volume consolidado de faturação diária em Meticais (MT)</p>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-zinc-500 block">Média Diária</span>
              <span className="text-xs font-bold text-emerald-700">52.740 MT</span>
            </div>
          </div>

          {/* Bar Graph Visualizer */}
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-zinc-200">
            {salesHistory.map((s, idx) => {
              const heightPercent = Math.round((s.total / maxSale) * 100);
              const isToday = s.day === "Hoje";
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-mono font-bold text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(s.total / 1000).toFixed(1)}k
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[42px] rounded-t-xl transition-all group-hover:scale-105 ${
                      isToday
                        ? "bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-md shadow-emerald-700/20"
                        : "bg-gradient-to-t from-zinc-400 to-zinc-300 group-hover:from-emerald-600 group-hover:to-emerald-400"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-bold ${
                      isToday ? "text-emerald-800 font-black" : "text-zinc-500"
                    }`}
                  >
                    {s.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend & Channel Comparison */}
          <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-600" />
                <span>M-Pesa (47%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>e-Mola (24%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-zinc-400" />
                <span>Dinheiro (20%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span>Cartão POS (9%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Payment Gateway & Operator Channels Status */}
        <div className="lg:col-span-4 bg-white/80 border border-emerald-900/10 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Canais de Pagamento & POS
            </h3>
            <p className="text-xs text-zinc-500">Estado das ligações móveis e bancárias</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-100 text-red-700">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-zinc-900 block">M-Pesa C2B Vodacom</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Shortcode: 171717</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                Ativo
              </span>
            </div>

            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-zinc-900 block">e-Mola Movitel</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Merchant: 861234567</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                Ativo
              </span>
            </div>

            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-zinc-900 block">Terminais POS TPA</span>
                  <span className="text-[10px] text-zinc-500 font-mono">SIMOrede / BIM</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                Conciliado
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsPaymentIntegrationsOpen(true)}
            className="w-full text-xs font-bold border-zinc-300 hover:bg-zinc-100 text-zinc-800 rounded-xl"
          >
            Gerir Configurações de Pagamento ⚙️
          </Button>
        </div>
      </div>

      {/* Module Direct Access Categories */}
      <div className="space-y-6">
        {ALL_MODULES.map((section, sIdx) => (
          <div key={sIdx} className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-emerald-950 flex items-center gap-2 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              {section.category}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.modules.map((m, mIdx) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={mIdx}
                    href={m.href}
                    className="group bg-white/80 border border-emerald-900/10 rounded-2xl p-4 hover:border-emerald-500 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                          <Icon className={`w-5 h-5 ${m.iconColor}`} />
                        </div>
                        {m.badge && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.badgeColor}`}
                          >
                            {m.badge}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 group-hover:text-emerald-800 transition-colors flex items-center gap-1.5">
                          {m.title}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5 text-emerald-700" />
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    {m.kpi && (
                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-zinc-400 font-medium">{m.kpiLabel}:</span>
                        <span className="font-bold text-emerald-950 font-mono">{m.kpi}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User & Permissions Management Modal */}
      <UserManagerModal
        isOpen={isUserManagerOpen}
        onClose={() => setIsUserManagerOpen(false)}
      />

      {/* Payment Integrations Modal */}
      <PaymentIntegrationsModal
        isOpen={isPaymentIntegrationsOpen}
        onClose={() => setIsPaymentIntegrationsOpen(false)}
      />
    </div>
  );
}
