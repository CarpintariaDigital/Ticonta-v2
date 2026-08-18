"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  ShoppingCart,
  ShieldCheck,
  Wifi,
  ArrowRight,
  UserPlus,
  LogIn,
  LayoutDashboard,
  KeyRound,
  BookOpen,
  UtensilsCrossed,
  Bike,
  Store,
  Wrench,
  Egg,
  TrendingUp,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { isAuthenticated, user, login } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleQuickLogin = async (username: string, pin: string, redirectUrl: string) => {
    try {
      await login(username, pin);
      router.push(redirectUrl);
    } catch {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-50 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Header Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-6 py-3.5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-slate-900 border border-emerald-500/30 p-1 shadow-lg shadow-emerald-500/20">
              <img
                src="/logo-ticonta.png"
                alt="TiConta ERP Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-base font-black text-white leading-tight flex items-center gap-2">
                TiConta
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  v2 ERP Moçambique
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">Sistema Comercial, Fiscal, Agro & Oficina</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950">
                  <LayoutDashboard className="w-4 h-4" />
                  Ir para Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-xs rounded-xl">
                    <LogIn className="w-3.5 h-3.5 mr-1.5" />
                    Entrar
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Explorar Módulos
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto my-8 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/10 animate-in fade-in duration-300">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          Sistema Operacional 100% Funcional Offline & Online
        </div>

        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Gestão Comercial, POS e Fiscal{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              para Moçambique
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Emita faturas com IVA (16%), controle estoques, faça lançamentos PGC-NIRF, gira restauração, takeaway, avicultura e fiado sem depender de internet.
          </p>
        </div>

        {/* 1-Click Demo Login Box */}
        <div className="w-full max-w-xl rounded-2xl border border-emerald-500/30 bg-zinc-900/90 p-5 shadow-2xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Entrada Rápida para Demonstração Local
            </span>
            <span className="text-[11px] text-zinc-400">Clique para testar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin("admin_user", "1234", "/dashboard")}
              className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/40 bg-emerald-600/15 hover:bg-emerald-600/30 text-left transition-all group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-black font-black text-sm">
                AD
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 block">
                  👤 Administrador (Full)
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">admin_user • 1234</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleQuickLogin("operador_pos", "4321", "/pos")}
              className="flex items-center gap-3 p-3 rounded-xl border border-blue-500/40 bg-blue-600/15 hover:bg-blue-600/30 text-left transition-all group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white font-black text-sm">
                POS
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-white group-hover:text-blue-300 block">
                  🛒 Operador de Caixa
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">operador_pos • 4321</span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full text-left pt-4">
          <Link
            href="/pos"
            className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur space-y-2 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all block group"
          >
            <div className="p-2.5 bg-emerald-500/15 text-emerald-400 w-fit rounded-xl border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              Ponto de Venda (POS)
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Faturas VD/FT com IVA 16%, leitor de código de barras e emissão térmica.
            </p>
          </Link>

          <Link
            href="/auto-services"
            className="p-5 rounded-2xl border border-teal-500/30 bg-teal-950/20 backdrop-blur space-y-2 hover:border-teal-400 hover:bg-zinc-900 transition-all block group shadow-lg shadow-teal-950/30"
          >
            <div className="p-2.5 bg-teal-500/20 text-teal-300 w-fit rounded-xl border border-teal-500/40 group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
              Oficina & Serviços Auto
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Mecânica, Bate-chapa, OBD-II, Estufa de Pintura e Projetos Tuning.
            </p>
          </Link>

          <Link
            href="/restaurant"
            className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur space-y-2 hover:border-amber-500/50 hover:bg-zinc-900 transition-all block group"
          >
            <div className="p-2.5 bg-amber-500/15 text-amber-400 w-fit rounded-xl border border-amber-500/30 group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
              Restaurante & Bares
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Mapa interativo de mesas, ecrã de cozinha (KDS) em tempo real e divisão.
            </p>
          </Link>

          <Link
            href="/takeaway"
            className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur space-y-2 hover:border-sky-500/50 hover:bg-zinc-900 transition-all block group"
          >
            <div className="p-2.5 bg-sky-500/15 text-sky-400 w-fit rounded-xl border border-sky-500/30 group-hover:scale-110 transition-transform">
              <Bike className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
              Takeaway & Entregas
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Gestão de estafetas, taxas de entrega por bairro e despacho rápido.
            </p>
          </Link>

          <Link
            href="/informal-sales"
            className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur space-y-2 hover:border-yellow-500/50 hover:bg-zinc-900 transition-all block group"
          >
            <div className="p-2.5 bg-yellow-500/15 text-yellow-400 w-fit rounded-xl border border-yellow-500/30 group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
              Vendas Informais / Fiado
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Caderno digital de fiado, score de crédito e lembretes WhatsApp.
            </p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <p>© 2024–2026 Carpintaria Digital • TiConta v2 ERP Moçambique. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
