"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Lock,
  Coins,
  PiggyBank,
  FileText,
  Building2,
  KeyRound,
} from "lucide-react";
import { useLicensedModules } from "@/hooks/useLicensedModules";

export const NAVIGATION_MODULES = [
  {
    category: "Vendas, Caixa & Propostas",
    items: [
      { name: "Painel Geral", href: "/dashboard", icon: LayoutDashboard, color: "text-zinc-500" },
      { name: "Ponto de Venda (POS)", href: "/pos", icon: ShoppingCart, color: "text-emerald-400", requiredModule: "pos" },
      { name: "Cotações & Pró-Forma", href: "/quotes", icon: FileText, color: "text-blue-400" },
      { name: "Vendas Informais & Fiado", href: "/informal-sales", icon: Store, color: "text-yellow-400", requiredModule: "informal" },
      { name: "Xitique (Rotativo/Comercial)", href: "/xitique", icon: Coins, color: "text-yellow-300", requiredModule: "xitique" },
      { name: "Poupança & Crédito (ASCAS)", href: "/savings", icon: PiggyBank, color: "text-amber-400", requiredModule: "savings" },
      { name: "Restaurante & Bares", href: "/restaurant", icon: UtensilsCrossed, color: "text-amber-400", requiredModule: "restaurant" },
      { name: "Takeaway & Entregas", href: "/takeaway", icon: Bike, color: "text-sky-400", requiredModule: "restaurant" },
      { name: "Oficina & Serviços Auto", href: "/auto-services", icon: Wrench, color: "text-teal-400", requiredModule: "auto_services" },
    ],
  },
  {
    category: "Agro, Indústria & Projetos",
    items: [
      { name: "Produção Avícola & Ovos", href: "/poultry", icon: Egg, color: "text-orange-400", requiredModule: "poultry" },
      { name: "Cotações & Preços", href: "/pricing", icon: TrendingUp, color: "text-teal-400" },
      { name: "Fabrico & Marcenaria", href: "/manufacturing", icon: Factory, color: "text-indigo-400", requiredModule: "projects" },
      { name: "Obras & Projetos", href: "/projects", icon: FolderKanban, color: "text-cyan-400", requiredModule: "projects" },
    ],
  },
  {
    category: "Gestão, Finanças & Equipa",
    items: [
      { name: "Contabilidade PGC-NIRF", href: "/accounting", icon: BookOpen, color: "text-blue-400", requiredModule: "accounting" },
      { name: "Recursos Humanos & INSS", href: "/hr", icon: Users, color: "text-rose-400", requiredModule: "hr" },
      { name: "Clientes & CRM", href: "/crm", icon: Users, color: "text-purple-400", requiredModule: "crm" },
      { name: "Relatórios Fiscais & BI", href: "/reports", icon: BarChart3, color: "text-emerald-400", requiredModule: "accounting" },
    ],
  },
  {
    category: "Administração & Configuração",
    items: [
      { name: "👑 Painel Admin & Licenças", href: "/admin/licensing", icon: ShieldCheck, color: "text-purple-400" },
      { name: "Dados da Empresa & Logótipo", href: "/settings/company", icon: Building2, color: "text-teal-400" },
      { name: "Segurança & Alterar PIN", href: "/settings/security", icon: KeyRound, color: "text-amber-400" },
      { name: "Gestão de Licenciamento", href: "/settings/license", icon: ShieldCheck, color: "text-emerald-400" },
      { name: "Recursos Premium", href: "/settings/premium", icon: Sparkles, color: "text-amber-400" },
    ],
  },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { hasModule } = useLicensedModules();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Find active module name
  const allItems = NAVIGATION_MODULES.flatMap((c) => c.items);
  const currentModule =
    allItems.find((item) => item.href === pathname) ||
    allItems.find((item) => pathname?.startsWith(item.href) && item.href !== "/dashboard") || {
      name: "Painel Geral",
      icon: LayoutDashboard,
      color: "text-emerald-400",
    };

  const CurrentIcon = currentModule.icon;

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/85 shadow-xs backdrop-blur-xl px-4 lg:px-6 py-2 shadow-2xl shadow-black/60">
      <div className="flex items-center justify-between">
        {/* Left: Hardware Brand Box with Official Logo & Module Switcher */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-[#1b2d4f] to-[#101c2e] border-2 border-[#2dc4a0]/40 p-1.5 shadow-md shadow-[#2dc4a0]/20 group-hover:border-[#2dc4a0] transition-all">
              <img
                src="/logo-ticonta.png"
                alt="TiConta Logo"
                className="h-full w-full object-contain filter drop-shadow"
              />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-widest text-white uppercase font-mono">
                  TiConta
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-[#2dc4a0] px-1.5 py-0.5 rounded border border-[#2dc4a0]/30 font-mono">
                  ERP POS
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-[#4a7a9b] font-medium tracking-wider uppercase">
                <span>Caixa & Gestão MZ</span>
              </div>
            </div>
          </Link>

          {/* Screws Divider */}
          <div className="hidden lg:flex items-center gap-1 opacity-70">
            <div className="screw" />
            <div className="screw" />
          </div>

          {/* Desktop Module Switcher Dropdown (Hardware Digital Selector) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setModulesDropdownOpen(!modulesDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-emerald-900/15 bg-white/90 shadow-xs px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:border-[#2dc4a0]/60 hover:text-zinc-900 transition-all shadow-inner"
            >
              <div className="w-2 h-2 rounded-full bg-[#2dc4a0] shadow-[0_0_6px_#2dc4a0]" />
              <CurrentIcon className={`h-4 w-4 ${currentModule.color}`} />
              <span className="font-mono text-zinc-900">{currentModule.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#4a7a9b]" />
            </button>

            {modulesDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setModulesDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-[600px] z-50 chassis-panel p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#1c3150]">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#2dc4a0] uppercase">
                      /// MÓDULOS DO SISTEMA TICONTA
                    </span>
                    <div className="screws-cluster">
                      <div className="screw" />
                      <div className="screw" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {NAVIGATION_MODULES.map((cat) => (
                      <div key={cat.category} className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4a7a9b] px-2 block font-mono">
                          {cat.category}
                        </span>
                        <div className="space-y-1">
                          {cat.items.map((item) => {
                            const ItemIcon = item.icon;
                            const isLicensed = !item.requiredModule || hasModule(item.requiredModule);
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                            return (
                              <Link
                                key={item.href}
                                href={isLicensed ? item.href : "/pricing"}
                                onClick={() => setModulesDropdownOpen(false)}
                                className={`flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                                  isActive
                                    ? "bg-emerald-500/20 text-[#2dc4a0] border border-[#2dc4a0]/40 font-bold shadow-sm"
                                    : isLicensed
                                    ? "text-zinc-700 hover:bg-emerald-50 hover:text-emerald-950 border border-transparent"
                                    : "text-zinc-500 hover:bg-emerald-50 hover:text-zinc-700 opacity-75 border border-transparent"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <ItemIcon className={`h-3.5 w-3.5 ${isLicensed ? item.color : "text-zinc-500"}`} />
                                  <span className="truncate">{item.name}</span>
                                </div>
                                {!isLicensed && (
                                  <span className="flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    <Lock className="h-2.5 w-2.5" />
                                    <span>Actualizar</span>
                                  </span>
                                )}
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

        {/* Quick Links on Desktop Bar - Styled with Tactile Keys */}
        <nav className="hidden xl:flex items-center gap-1.5">
          <Link
            href="/pos"
            className={`px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider transition-all border ${
              pathname?.startsWith("/pos")
                ? "bg-[#1d9e75] text-white border-[#0f6e56] shadow-[0_2px_0_#085041]"
                : "bg-[#142238] text-[#2dc4a0] border-[#0d1d33] hover:bg-[#1a2f4a]"
            }`}
          >
            [POS CAIXA]
          </Link>
          <Link
            href="/auto-services"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/auto-services") ? "bg-teal-500/20 text-teal-400 font-semibold" : "text-zinc-600 hover:text-emerald-900"
            }`}
          >
            Oficina
          </Link>
          <Link
            href="/restaurant"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/restaurant") ? "bg-amber-500/20 text-amber-400" : "text-zinc-600 hover:text-emerald-900"
            }`}
          >
            Restaurante
          </Link>
          <Link
            href="/takeaway"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/takeaway") ? "bg-sky-500/20 text-sky-400" : "text-zinc-600 hover:text-emerald-900"
            }`}
          >
            Takeaway
          </Link>
          <Link
            href="/informal-sales"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/informal-sales") ? "bg-yellow-500/20 text-yellow-400" : "text-zinc-600 hover:text-emerald-900"
            }`}
          >
            Fiado
          </Link>
          <Link
            href="/poultry"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/poultry") ? "bg-orange-500/20 text-orange-400" : "text-zinc-600 hover:text-emerald-900"
            }`}
          >
            Avicultura
          </Link>
          <Link
            href="/accounting"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/accounting") ? "bg-blue-500/20 text-blue-400" : "text-zinc-600 hover:text-emerald-900"
            }`}
          >
            Contabilidade
          </Link>
          <Link
            href="/settings/company"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              pathname?.startsWith("/settings/company") ? "bg-teal-500/20 text-teal-400 font-bold" : "text-zinc-600 hover:text-emerald-900"
            }`}
          >
            Empresa / Logo
          </Link>
          <Link
            href="/admin/licensing"
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
              pathname?.startsWith("/admin")
                ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950"
                : "bg-purple-950/40 text-purple-300 border-purple-500/40 hover:bg-purple-900/60"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ADMIN & LICENÇAS</span>
          </Link>
        </nav>

        {/* Right: Sync Status + Operator Info + Logout Key */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/licensing"
            className="xl:hidden px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-600/30 text-purple-300 border border-purple-500/40 hover:bg-purple-600/50 flex items-center gap-1"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>ADMIN</span>
          </Link>

          <SyncStatus />

          <Link
            href="/admin/licensing"
            className="hidden sm:flex flex-col text-right bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200 hover:border-purple-500/60 hover:bg-purple-950/20 transition-all group"
            title="Abrir Painel de Administração & Licenças"
          >
            <span className="text-[11px] font-bold text-zinc-900 group-hover:text-purple-300 truncate max-w-[120px] flex items-center justify-end gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              {user?.username || "Operador"}
            </span>
            <span className="text-[9px] text-[#2dc4a0] group-hover:text-purple-400 font-mono uppercase font-bold tracking-wider">
              {user?.role || "admin"} (CONFIG)
            </span>
          </Link>

          <Button
            variant="retro-destructive"
            size="sm"
            onClick={handleLogout}
            className="h-8 px-2.5 text-xs hidden sm:flex items-center gap-1.5"
            title="Encerrar Sessão"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>SAIR</span>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="retro"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 h-8 w-8 text-zinc-700"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[#1c3150] space-y-4 max-h-[80vh] overflow-y-auto pb-4 animate-in slide-in-from-top-2 duration-200 chassis-panel p-3">
          {NAVIGATION_MODULES.map((cat) => (
            <div key={cat.category} className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4a7a9b] px-2 font-mono">
                {cat.category}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {cat.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isLicensed = !item.requiredModule || hasModule(item.requiredModule);
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={isLicensed ? item.href : "/pricing"}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs transition-all ${
                        isActive
                          ? "bg-emerald-500/20 text-[#2dc4a0] border border-[#2dc4a0]/40 font-bold"
                          : isLicensed
                          ? "text-zinc-700 bg-[#132238] hover:bg-[#1b2d4f]"
                          : "text-zinc-500 bg-[#0d1726] hover:bg-[#132238] opacity-80"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ItemIcon className={`h-3.5 w-3.5 ${isLicensed ? item.color : "text-zinc-500"}`} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {!isLicensed && (
                        <Lock className="h-3 w-3 text-amber-400 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-[#1c3150] flex justify-between items-center px-2">
            <span className="text-xs text-zinc-500 font-mono">
              Operador: <strong className="text-white">{user?.username}</strong>
            </span>
            <Button
              variant="retro-destructive"
              size="sm"
              onClick={handleLogout}
              className="text-xs h-7 px-3"
            >
              SAIR
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

