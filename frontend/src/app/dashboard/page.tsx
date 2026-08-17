"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, ShoppingCart, BookOpen, Users, FolderKanban, BarChart3, Factory } from "lucide-react";
import { useRouter } from "next/navigation";
import SyncStatus from "@/components/common/SyncStatus";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        {/* Top Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 font-bold text-black shadow-lg shadow-emerald-500/20">
              Ti
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">TiConta v2 ERP</h1>
              <p className="text-xs text-zinc-400">Offline-First • Moçambique</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <SyncStatus />
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-white">{user?.username || "Administrador"}</span>
              <span className="text-[11px] text-emerald-400 font-mono uppercase">{user?.role || "Admin"}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sair
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Painel Principal</h2>
            <p className="text-sm text-zinc-400">
              Bem-vindo ao TiConta v2. Selecione um dos módulos para iniciar:
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/pos" className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-emerald-500/50 transition-all block">
              <ShoppingCart className="h-8 w-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white">Ponto de Venda (POS)</h3>
              <p className="text-xs text-zinc-400 mt-1">Vendas rápidas, faturas e caixa offline-first.</p>
            </Link>

            <Link href="/accounting" className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-blue-500/50 transition-all block">
              <BookOpen className="h-8 w-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white">Contabilidade</h3>
              <p className="text-xs text-zinc-400 mt-1">Plano de contas, diários e compliance Moçambique.</p>
            </Link>

            <Link href="/manufacturing" className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-orange-500/50 transition-all block">
              <Factory className="h-8 w-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white">Fabrico & Marcenaria</h3>
              <p className="text-xs text-zinc-400 mt-1">Ordens de produção, orçamentação por dentro e corte 2D.</p>
            </Link>

            <Link href="/reports" className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-purple-500/50 transition-all block">
              <BarChart3 className="h-8 w-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white">Relatórios & BI</h3>
              <p className="text-xs text-zinc-400 mt-1">DRE, Balancete, Fluxo de Caixa, Vendas e Folha INSS.</p>
            </Link>

            <Link href="/crm" className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-purple-500/50 transition-all block">
              <Users className="h-8 w-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white">Clientes & CRM</h3>
              <p className="text-xs text-zinc-400 mt-1">Gestão de contactos, dívidas e histórico de compras.</p>
            </Link>

            <Link href="/projects" className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-amber-500/50 transition-all block">
              <FolderKanban className="h-8 w-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white">Obras & Projetos</h3>
              <p className="text-xs text-zinc-400 mt-1">Custos reais vs orçamentos, tarefas e relatórios de obra.</p>
            </Link>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
