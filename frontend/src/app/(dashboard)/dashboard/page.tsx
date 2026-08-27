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
        iconColor: "text-emerald-400",
        badge: "WhatsApp Ready",
        badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        kpi: "38.450 MT",
        kpiLabel: "Vendas Hoje",
      },
      {
        title: "Cotações & Faturas Pró-Forma",
        description: "Emissão de propostas comerciais com IVA 16%, envio WhatsApp e impressão timbrada A4.",
        href: "/quotes",
        icon: FileText,
        iconColor: "text-blue-400",
        badge: "Propostas MZ",
        badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        kpi: "173.000 MT",
        kpiLabel: "Em Cotações",
      },
      {
        title: "Vendas Informais & Fiado",
        description: "Caderno digital para vendedores, amortizações parciais, histórico e cobrança via WhatsApp.",
        href: "/informal-sales",
        icon: Store,
        iconColor: "text-yellow-400",
        badge: "Score de Fiado",
        badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        kpi: "42.150 MT",
        kpiLabel: "Fiado a Receber",
      },
      {
        title: "Xitique (Rotativo & Mercadorias)",
        description: "Rodas de dinheiro e xitique comercial de lojas/ferragens com escala de entrega por ciclo.",
        href: "/xitique",
        icon: Coins,
        iconColor: "text-yellow-300",
        badge: "Rotativo & Lojas",
        badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        kpi: "6 Grupos",
        kpiLabel: "Rodas Ativas",
      },
      {
        title: "Poupança Comunitária (ASCAS)",
        description: "Fundos de acumulação a prazo, empréstimos internos com juros e partilha proporcional (Share-out).",
        href: "/savings",
        icon: PiggyBank,
        iconColor: "text-amber-400",
        badge: "Crédito & Juros",
        badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        kpi: "185.000 MT",
        kpiLabel: "Fundo Poupado",
      },
      {
        title: "Restaurante & Bares",
        description: "Mapa de mesas em tempo real, pedidos de cozinha (KDS) e divisão de contas.",
        href: "/restaurant",
        icon: UtensilsCrossed,
        iconColor: "text-amber-400",
        badge: "Mesas & KDS",
        badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        kpi: "8 Mesas",
        kpiLabel: "Ocupação Atual",
      },
      {
        title: "Takeaway & Entregas",
        description: "Despacho de encomendas, rastreamento de estafetas e taxas por zona.",
        href: "/takeaway",
        icon: Bike,
        iconColor: "text-sky-400",
        badge: "Entregas",
        badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
        kpi: "14 Pedidos",
        kpiLabel: "Em trânsito",
      },
      {
        title: "Oficina & Serviços Auto",
        description: "Quadro de boxes, mecânica geral, bate-chapa, scanner OBD-II e peças.",
        href: "/auto-services",
        icon: Wrench,
        iconColor: "text-teal-400",
        badge: "Oficina 360º",
        badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
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
        iconColor: "text-blue-400",
        badge: "PGC-NIRF MZ",
        badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        kpi: "Equilibrado",
        kpiLabel: "Balancete Ativo",
      },
      {
        title: "Produção Avícola & Agropecuária",
        description: "Lotes de frangos e poedeiras, postura de ovos, mortalidade e custos zootécnicos.",
        href: "/poultry",
        icon: Egg,
        iconColor: "text-orange-400",
        badge: "Zootécnico",
        badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        kpi: "2.400 Aves",
        kpiLabel: "Efetivo Vivo",
      },
      {
        title: "CRM & Gestão de Clientes",
        description: "Base de dados unificada, histórico de compras, limites de crédito e fidelização.",
        href: "/crm",
        icon: Users,
        iconColor: "text-indigo-400",
        badge: "Clientes",
        badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
        kpi: "342 Clientes",
        kpiLabel: "Registados",
      },
      {
        title: "Obras & Gestão de Projetos",
        description: "Controlo orçamental de empreitadas, autos de medição e cronograma físico-financeiro.",
        href: "/projects",
        icon: FolderKanban,
        iconColor: "text-purple-400",
        badge: "Empreitadas",
        badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        kpi: "4 Obras",
        kpiLabel: "Em Execução",
      },
      {
        title: "Fabrico & Marcenaria",
        description: "Ordens de fabrico, consumo de materiais (Madeira/MDF/Ferragens) e orçamentação.",
        href: "/manufacturing",
        icon: Factory,
        iconColor: "text-rose-400",
        badge: "Produção",
        badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
        kpi: "12 Ordens",
        kpiLabel: "Em Fabrico",
      },
    ],
  },
  {
    category: "Administração da Loja & Sistema",
    modules: [
      {
        title: "👑 Painel de Administração & Licenciamento",
        description: "Emissão oficial de licenças HMAC-SHA256, definição de preços por módulo e envio WhatsApp.",
        href: "/admin/licensing",
        icon: ShieldCheck,
        iconColor: "text-purple-400",
        badge: "Admin Master",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        kpi: "Licenciamento",
        kpiLabel: "Emissão de Chaves",
      },
      {
        title: "Dados da Empresa & Logótipo Oficial",
        description: "Configuração do logótipo da loja, NUIT, contactos e rodapés de recibos e faturas.",
        href: "/settings/company",
        icon: Building2,
        iconColor: "text-teal-400",
        badge: "Faturação",
        badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
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
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <DashboardNavbar />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Executive Header & Quick Admin Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur shadow-2xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                Painel Executivo Integrado
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Olá, {user?.username || "Administrador"} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Visão operacional em tempo real de vendas, pagamentos móveis, fiados e poupanças em Moçambique.
              </p>
            </div>

            {/* Quick Action Buttons for Admin Controls & Payments */}
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/admin/licensing">
                <Button className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-lg shadow-purple-950">
                  <ShieldCheck className="w-4 h-4" />
                  <span>👑 Painel Admin & Licenças</span>
                </Button>
              </Link>

              <Link href="/settings/company">
                <Button variant="outline" className="border-teal-500/40 bg-teal-950/30 text-teal-300 hover:bg-teal-900/50 font-bold text-xs flex items-center gap-1.5 rounded-xl">
                  <Building2 className="w-4 h-4" />
                  <span>Empresa & Logo</span>
                </Button>
              </Link>

              <Link href="/quotes">
                <Button variant="outline" className="border-blue-500/40 bg-blue-950/30 text-blue-300 hover:bg-blue-900/50 font-bold text-xs flex items-center gap-1.5 rounded-xl">
                  <FileText className="w-4 h-4" />
                  <span>Pró-Formas</span>
                </Button>
              </Link>

              <Button
                onClick={() => setIsUserManagerOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-lg shadow-indigo-950"
              >
                <Users className="w-4 h-4" />
                <span>Utilizadores</span>
              </Button>

              <Button
                onClick={() => setIsPaymentIntegrationsOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-lg shadow-emerald-950"
              >
                <Smartphone className="w-4 h-4" />
                <span>M-Pesa / e-Mola / POS</span>
              </Button>
            </div>
          </div>

          {/* Consolidated Executive KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Faturação Total Hoje</span>
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                54.800,00 <span className="text-xs text-emerald-400 font-normal">MT</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18.4% vs dia anterior
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Pagamentos Móveis (M-Pesa / e-Mola)</span>
                <Smartphone className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                38.800,00 <span className="text-xs text-red-400 font-normal">MT</span>
              </div>
              <div className="text-[10px] text-slate-400">
                70.8% do volume total de pagamentos
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total a Receber (Fiados)</span>
                <Store className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
                42.150,00 <span className="text-xs text-rose-300 font-normal">MT</span>
              </div>
              <div className="text-[10px] text-zinc-400">
                8 contas vencidas com lembrete WhatsApp
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Fundos de Xitique & Poupança</span>
                <PiggyBank className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                185.000,00 <span className="text-xs text-amber-400 font-normal">MT</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold">
                +6.750 MT juros gerados para partilha
              </div>
            </div>
          </div>

          {/* Graphical Analytics: Sales Trend & Payment Methods Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Graph: 7-Day Revenue Trend (Visual SVG & Bar Chart) */}
            <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Tendência de Vendas (Últimos 7 Dias)
                  </h3>
                  <p className="text-xs text-slate-400">Volume consolidado de faturação diária em Meticais (MT)</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-500 block">Média Diária</span>
                  <span className="text-xs font-bold text-emerald-400">52.740 MT</span>
                </div>
              </div>

              {/* Bar Graph Visualizer */}
              <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-slate-800">
                {salesHistory.map((s, idx) => {
                  const heightPercent = Math.round((s.total / maxSale) * 100);
                  const isToday = s.day === "Hoje";
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] font-mono font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(s.total / 1000).toFixed(1)}k
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[42px] rounded-t-xl transition-all group-hover:scale-105 ${
                          isToday
                            ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/20"
                            : "bg-gradient-to-t from-indigo-900 to-indigo-500"
                        }`}
                      />
                      <span
                        className={`text-[11px] font-bold ${
                          isToday ? "text-emerald-400 font-black" : "text-slate-400"
                        }`}
                      >
                        {s.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend & Channel Comparison */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>M-Pesa (47%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>e-Mola (24%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-400" />
                    <span>Dinheiro (20%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Cartão POS (9%)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Payment Gateway & Operator Channels Status */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Canais de Pagamento & POS
                </h3>
                <p className="text-xs text-slate-400">Estado das ligações móveis e bancárias</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">M-Pesa C2B Vodacom</span>
                      <span className="text-[10px] text-slate-400 font-mono">Shortcode: 171717</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Ativo
                  </span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">e-Mola Movitel</span>
                      <span className="text-[10px] text-slate-400 font-mono">Merchant: 861234567</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Ativo
                  </span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">Terminais POS TPA</span>
                      <span className="text-[10px] text-slate-400 font-mono">SIMOrede / BIM</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Conciliado
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsPaymentIntegrationsOpen(true)}
                className="w-full text-xs font-bold border-slate-700 hover:bg-slate-800 text-slate-200"
              >
                Gerir Configurações de Pagamento ⚙️
              </Button>
            </div>
          </div>

          {/* Module Direct Access Categories */}
          <div className="space-y-6">
            {ALL_MODULES.map((section, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {section.category}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.modules.map((m, mIdx) => {
                    const Icon = m.icon;
                    return (
                      <Link
                        key={mIdx}
                        href={m.href}
                        className="group bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 hover:border-slate-700 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-3 shadow-lg"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors">
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
                            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                              {m.title}
                              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                              {m.description}
                            </p>
                          </div>
                        </div>

                        {m.kpi && (
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <span className="text-[10px] text-slate-500 font-medium">{m.kpiLabel}:</span>
                            <span className="font-bold text-white font-mono">{m.kpi}</span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>

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
    </ProtectedRoute>
  );
}
