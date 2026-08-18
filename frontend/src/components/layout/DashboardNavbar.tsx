"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import SyncStatus from "@/components/common/SyncStatus";
import {
  LayoutDashboard,
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
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

export const NAVIGATION_MODULES = [
  {
    category: "Vendas & Serviços",
    items: [
      { name: "Painel Geral", href: "/dashboard", icon: LayoutDashboard, color: "text-zinc-400" },
      { name: "Ponto de Venda (POS)", href: "/pos", icon: ShoppingCart, color: "text-emerald-400" },
      { name: "Oficina & Serviços Auto", href: "/auto-services", icon: Wrench, color: "text-teal-400" },
      { name: "Restaurante & Bares", href: "/restaurant", icon: UtensilsCrossed, color: "text-amber-400" },
      { name: "Takeaway & Entregas", href: "/takeaway", icon: Bike, color: "text-sky-400" },
      { name: "Vendas Informais / Fiado", href: "/informal-sales", icon: Store, color: "text-yellow-400" },
    ],
  },
  {
    category: "Agro & Produção",
    items: [
      { name: "Produção Avícola & Ovos", href: "/poultry", icon: Egg, color: "text-orange-400" },
      { name: "Cotações & Preços", href: "/pricing", icon: TrendingUp, color: "text-teal-400" },
      { name: "Fabrico & Marcenaria", href: "/manufacturing", icon: Factory, color: "text-indigo-400" },
    ],
  },
  {
    category: "Gestão & Compliance",
    items: [
      { name: "Contabilidade PGC", href: "/accounting", icon: BookOpen, color: "text-blue-400" },
      { name: "Recursos Humanos & INSS", href: "/hr", icon: Users, color: "text-rose-400" },
      { name: "Clientes & CRM", href: "/crm", icon: Users, color: "text-purple-400" },
      { name: "Obras & Projetos", href: "/projects", icon: FolderKanban, color: "text-cyan-400" },
      { name: "Relatórios Fiscais & BI", href: "/reports", icon: BarChart3, color: "text-emerald-400" },
    ],
  },
  {
    category: "Sistema & Licença",
    items: [
      { name: "Gestão de Licenciamento", href: "/settings/license", icon: ShieldCheck, color: "text-emerald-400" },
      { name: "Recursos Premium", href: "/settings/premium", icon: Sparkles, color: "text-amber-400" },
    ],
  },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Find active module name
  const allItems = NAVIGATION_MODULES.flatMap((c) => c.items);
  const currentModule = allItems.find((item) => pathname?.startsWith(item.href) && item.href !== "/dashboard") || {
    name: pathname === "/dashboard" ? "Painel Geral" : "Módulo",
    icon: LayoutDashboard,
    color: "text-emerald-400",
  };

  const CurrentIcon = currentModule.icon;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl px-4 lg:px-6 py-2.5 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        {/* Left: Brand with Official Logo & Module Switcher */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-slate-900 border border-emerald-500/30 p-1 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <img
                src="/logo-ticonta.png"
                alt="TiConta Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white tracking-tight block">TiConta</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  v2 ERP
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">Gestão & Contabilidade MZ</span>
            </div>
          </Link>

          {/* Desktop Module Switcher Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setModulesDropdownOpen(!modulesDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-emerald-500/40 hover:bg-zinc-850 hover:text-white transition-all shadow-sm"
            >
              <CurrentIcon className={`h-4 w-4 ${currentModule.color}`} />
              <span>{currentModule.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>

            {modulesDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setModulesDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-[540px] z-50 rounded-xl border border-zinc-800 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="grid grid-cols-2 gap-4">
                    {NAVIGATION_MODULES.map((cat) => (
                      <div key={cat.category} className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 block">
                          {cat.category}
                        </span>
                        <div className="space-y-0.5">
                          {cat.items.map((item) => {
                            const ItemIcon = item.icon;
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setModulesDropdownOpen(false)}
                                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                                  isActive
                                    ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                                    : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                                }`}
                              >
                                <ItemIcon className={`h-3.5 w-3.5 ${item.color}`} />
                                <span className="truncate">{item.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Links on Desktop Bar */}
        <nav className="hidden xl:flex items-center gap-1">
          <Link
            href="/pos"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/pos") ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            POS Caixa
          </Link>
          <Link
            href="/auto-services"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/auto-services") ? "bg-teal-500/20 text-teal-400 font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            Auto & Oficina
          </Link>
          <Link
            href="/restaurant"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/restaurant") ? "bg-amber-500/20 text-amber-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            Restaurante
          </Link>
          <Link
            href="/takeaway"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/takeaway") ? "bg-sky-500/20 text-sky-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            Takeaway
          </Link>
          <Link
            href="/informal-sales"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/informal-sales") ? "bg-yellow-500/20 text-yellow-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            Fiado & Ambulante
          </Link>
          <Link
            href="/poultry"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/poultry") ? "bg-orange-500/20 text-orange-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            Avicultura
          </Link>
          <Link
            href="/accounting"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/accounting") ? "bg-blue-500/20 text-blue-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            Contabilidade
          </Link>
          <Link
            href="/settings/license"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/settings/license") ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            Licença
          </Link>
        </nav>

        {/* Right: Sync Status + User Info + Logout */}
        <div className="flex items-center gap-3">
          <SyncStatus />

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-white truncate max-w-[120px]">
              {user?.username || "Administrador"}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono uppercase font-semibold">
              {user?.role || "admin"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 px-2.5 text-xs hidden sm:flex items-center gap-1.5"
            title="Encerrar Sessão"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sair</span>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden border-zinc-800 bg-zinc-900 text-zinc-300 p-1.5 h-8 w-8"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-zinc-800 space-y-4 max-h-[80vh] overflow-y-auto pb-4 animate-in slide-in-from-top-2 duration-200">
          {NAVIGATION_MODULES.map((cat) => (
            <div key={cat.category} className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2">
                {cat.category}
              </span>
              <div className="grid grid-cols-2 gap-1">
                {cat.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-all ${
                        isActive
                          ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                          : "text-zinc-300 bg-zinc-900/60 hover:bg-zinc-800"
                      }`}
                    >
                      <ItemIcon className={`h-3.5 w-3.5 ${item.color}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-zinc-800 flex justify-between items-center px-2">
            <span className="text-xs text-zinc-400">
              Conectado como <strong className="text-white">{user?.username}</strong>
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="text-xs h-7 px-3"
            >
              Sair
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
