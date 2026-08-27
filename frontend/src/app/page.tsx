"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  LogIn,
  LayoutDashboard,
  UtensilsCrossed,
  Bike,
  Store,
  Wrench,
  Egg,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-50 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Header Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-6 py-3.5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group cursor-pointer">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-slate-900 border border-emerald-500/30 p-1 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <img
                src="/LOGO-TICONTA.png"
                alt="TiConta ERP Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-base font-black tracking-widest text-white uppercase">
                  TiConta
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-[#2dc4a0] px-1.5 py-0.5 rounded border border-[#2dc4a0]/30 font-mono">
                  v2 ERP
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
                Máquina Registradora & Gestão Moçambique
              </p>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                asChild
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono h-9 px-4 rounded-xl shadow-lg shadow-emerald-950/50"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>PAINEL DASHBOARD</span>
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono h-9 px-4 rounded-xl shadow-lg shadow-emerald-950/50"
              >
                <Link href="/login" className="flex items-center gap-2">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>ENTRAR NO TERMINAL ↵</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero & Sector Modules */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center text-center space-y-10">
        
        {/* Offline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/10 animate-in fade-in duration-300">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          Sistema Operacional 100% Funcional Offline & Online
        </div>

        {/* Value Proposition */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Gestão Comercial, POS e Fiscal{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              para Moçambique
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Emita faturas com IVA (16%), controle estoques, faça lançamentos PGC-NIRF, gira restauração, takeaway, serviços auto e vendas informais com resiliência local.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold font-mono h-11 px-6 rounded-xl shadow-xl shadow-emerald-950/60"
            >
              <Link href="/login" className="flex items-center gap-2">
                <span>Aceder ao Terminal de Gestão</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
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
              Mecânica, Bate-chapa, OBD-II, Estufa de Pintura e Ordens de Serviço.
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
              Mapa interativo de mesas, ecrã de cozinha (KDS) em tempo real e contas.
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
