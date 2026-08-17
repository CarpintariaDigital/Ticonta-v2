"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { ShoppingCart, ShieldCheck, Wifi, ArrowRight, UserPlus, LogIn, LayoutDashboard, KeyRound, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Header Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 font-extrabold text-black text-lg shadow-lg shadow-emerald-500/20">
            Ti
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">TiConta v2</h1>
            <p className="text-[11px] text-zinc-400">ERP Offline-First • Moçambique</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 text-xs font-semibold rounded-xl">
                <LayoutDashboard className="w-4 h-4" />
                Ir para Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs rounded-xl">
                  <LogIn className="w-3.5 h-3.5 mr-1.5" />
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  Criar Conta
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto my-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold animate-in fade-in duration-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          Sistema Operacional & Pronto para Uso em Moçambique
        </div>

        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Gestão Comercial, POS e Contabilidade <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">100% Offline</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
            Emita faturas com IVA (16%), controle estoques, faça lançamentos PGC-NIRF e processe folhas de salário INSS mesmo sem sinal de Internet.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/login">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-xl shadow-emerald-500/20 px-8 flex items-center gap-2 text-sm">
              <LogIn className="w-4 h-4" />
              Aceder ao Sistema
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>

          <Link href="/pos">
            <Button size="lg" variant="outline" className="border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 rounded-xl px-6 flex items-center gap-2 text-sm">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              Abrir Caixa POS
            </Button>
          </Link>

          <Link href="/admin/licensing">
            <Button size="lg" variant="outline" className="border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 rounded-xl px-6 flex items-center gap-2 text-sm">
              <KeyRound className="w-4 h-4 text-blue-400" />
              Licenciamento
            </Button>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 w-full text-left pt-6">
          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur space-y-2 hover:border-emerald-500/40 transition-colors">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 w-fit rounded-xl border border-emerald-500/20">
              <Wifi className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Operação Offline-First</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Vendas e emissão de recibos térmicos locais no navegador sem depender de ligação à rede.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur space-y-2 hover:border-blue-500/40 transition-colors">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 w-fit rounded-xl border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Compliance PGC-NIRF</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Plano de contas moçambicano, balancetes de verificação, DRE, Balanço e retenção IRPS/INSS.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur space-y-2 hover:border-purple-500/40 transition-colors">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 w-fit rounded-xl border border-purple-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Multicanal & Licença</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Envio de faturas por WhatsApp/SMS e chaves de ativação criptográficas HMAC-SHA256.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <p>© 2024–2026 Carpintaria Digital. Todos os direitos reservados. Maputo, Moçambique.</p>
      </footer>
    </div>
  );
}
