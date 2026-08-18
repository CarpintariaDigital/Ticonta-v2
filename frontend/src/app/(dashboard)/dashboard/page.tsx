"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar, { NAVIGATION_MODULES } from "@/components/layout/DashboardNavbar";
import { useAuthStore } from "@/store/auth.store";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

interface ModuleCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
}

const ALL_MODULES: {
  category: string;
  modules: ModuleCardProps[];
}[] = [
  {
    category: "Vendas, Serviços & Retalho",
    modules: [
      {
        title: "Ponto de Venda (POS)",
        description: "Emissão de faturas VD/FT com IVA 16%, caixa diário e funcionamento offline.",
        href: "/pos",
        icon: ShoppingCart,
        iconColor: "text-emerald-400",
        badge: "Offline-First",
        badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      },
      {
        title: "Oficina & Serviços Auto",
        description: "Quadro de boxes, mecânica geral, bate-chapa, scanner OBD-II, estufa de pintura e tuning.",
        href: "/auto-services",
        icon: Wrench,
        iconColor: "text-teal-400",
        badge: "Oficina 360º",
        badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      },
      {
        title: "Restaurante & Bares",
        description: "Mapa de mesas em tempo real, pedidos de cozinha (KDS) e divisão de contas.",
        href: "/restaurant",
        icon: UtensilsCrossed,
        iconColor: "text-amber-400",
        badge: "Mesas & KDS",
        badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      },
      {
        title: "Takeaway & Entregas",
        description: "Despacho de encomendas, rastreamento de estafetas e taxas por zona.",
        href: "/takeaway",
        icon: Bike,
        iconColor: "text-sky-400",
        badge: "Entregas",
        badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
      },
      {
        title: "Vendas Informais & Fiado",
        description: "Caderno digital para vendedores de rua, pagamentos parciais e score de crédito.",
        href: "/informal-sales",
        icon: Store,
        iconColor: "text-yellow-400",
        badge: "Score de Fiado",
        badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      },
    ],
  },
  {
    category: "Agropecuária & Indústria",
    modules: [
      {
        title: "Produção Avícola & Ovos",
        description: "Lotes de frangos e poedeiras, postura de ovos, mortalidade e alertas zootécnicos.",
        href: "/poultry",
        icon: Egg,
        iconColor: "text-orange-400",
        badge: "Zootécnico",
        badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      },
      {
        title: "Cotações & Precificação",
        description: "Custo de produção por ovo/frango, margem de lucro e preços médios de mercado.",
        href: "/pricing",
        icon: TrendingUp,
        iconColor: "text-teal-400",
        badge: "Mercado MZ",
        badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
      },
      {
        title: "Fabrico & Marcenaria",
        description: "Ordens de fabrico, consumo de materiais (Madeira/MDF) e orçamentação por dentro.",
        href: "/manufacturing",
        icon: Factory,
        iconColor: "text-indigo-400",
        badge: "Produção",
        badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      },
    ],
  },
  {
    category: "Finanças, RH & Gestão",
    modules: [
      {
        title: "Contabilidade (PGC-NIRF)",
        description: "Plano de contas oficial de Moçambique, diários, balancetes e fecho de contas.",
        href: "/accounting",
        icon: BookOpen,
        iconColor: "text-blue-400",
        badge: "PGC Moçambique",
        badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      },
      {
        title: "Recursos Humanos & Salários",
        description: "Processamento salarial, retenção de IRPS/IRT e mapa oficial de INSS (3% + 4%).",
        href: "/hr",
        icon: Users,
        iconColor: "text-rose-400",
        badge: "INSS + IRPS",
        badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      },
      {
        title: "Clientes & CRM",
        description: "Gestão de contactos, histórico de faturas, conta corrente e saldos devedores.",
        href: "/crm",
        icon: Users,
        iconColor: "text-purple-400",
        badge: "CRM",
        badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      },
      {
        title: "Obras & Projetos",
        description: "Controlo de despesas por centro de custo, orçamentos e acompanhamento de obra.",
        href: "/projects",
        icon: FolderKanban,
        iconColor: "text-cyan-400",
        badge: "Projetos",
        badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      },
      {
        title: "Relatórios & BI",
        description: "DRE, Balancete, Fluxo de Caixa, Mapa do IVA e Declarações para a AT.",
        href: "/reports",
        icon: BarChart3,
        iconColor: "text-emerald-400",
        badge: "Relatórios AT",
        badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      },
    ],
  },
  {
    category: "Configuração & Licenciamento",
    modules: [
      {
        title: "Gestão de Licenciamento",
        description: "Estado da subscrição, ativação de chaves criptográficas e auditoria de módulos.",
        href: "/settings/license",
        icon: ShieldCheck,
        iconColor: "text-emerald-400",
        badge: "Criptográfico",
        badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      },
      {
        title: "Recursos Premium",
        description: "Ativação de funcionalidades avançadas: WhatsApp API, Multi-empresa e Backup Cloud.",
        href: "/settings/premium",
        icon: Sparkles,
        iconColor: "text-amber-400",
        badge: "Add-ons",
        badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      },
    ],
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        <DashboardNavbar />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Welcome Banner */}
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  Licença Ativa (Plano Completo)
                </Badge>
                <span className="text-xs text-zinc-400 font-mono">Moçambique (MZN)</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Olá, {user?.username || "Administrador"} 👋
              </h2>
              <p className="text-sm text-zinc-400 max-w-2xl">
                Selecione um dos módulos abaixo para gerir as operações da sua empresa em modo offline-first.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/pos">
                <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all">
                  <ShoppingCart className="h-4 w-4" />
                  Abrir Caixa POS
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </button>
              </Link>
            </div>
          </div>

          {/* Module Categories Grid */}
          <div className="space-y-8">
            {ALL_MODULES.map((section) => (
              <div key={section.category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                    {section.category}
                  </h3>
                  <div className="h-px flex-1 bg-zinc-800/80" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {section.modules.map((mod) => {
                    const IconComponent = mod.icon;
                    return (
                      <Link
                        key={mod.href}
                        href={mod.href}
                        className="group relative rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all flex flex-col justify-between shadow-sm"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 group-hover:scale-105 transition-transform">
                              <IconComponent className={`h-5 w-5 ${mod.iconColor}`} />
                            </div>
                            {mod.badge && (
                              <Badge className={`text-[10px] ${mod.badgeColor || "bg-zinc-800 text-zinc-300"}`}>
                                {mod.badge}
                              </Badge>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors text-sm">
                              {mod.title}
                            </h4>
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                              {mod.description}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 mt-2 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500 group-hover:text-emerald-400 transition-colors">
                          <span className="font-medium">Aceder ao módulo</span>
                          <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
