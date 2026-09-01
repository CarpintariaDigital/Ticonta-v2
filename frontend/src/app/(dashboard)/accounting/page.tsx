"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  FileSpreadsheet,
  PlusCircle,
  TrendingUp,
  FileText,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { accountingService } from "@/services/accounting";
import { TrialBalanceResponse, IncomeStatementResponse } from "@/types/accounting";

export default function AccountingDashboardPage() {
  const [trialBalance, setTrialBalance] = useState<TrialBalanceResponse | null>(null);
  const [dre, setDre] = useState<IncomeStatementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [tb, income] = await Promise.all([
          accountingService.getTrialBalance(),
          accountingService.getIncomeStatement(),
        ]);
        setTrialBalance(tb);
        setDre(income);
      } catch (err) {
        // Fallbacks
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
        {/* Header */}
        <header className="border-b border-zinc-200 bg-white backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 font-bold">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Módulo de Contabilidade</h1>
              <p className="text-xs text-zinc-500">PGC-NIRF • Sistema Financeiro Moçambique</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/accounting/journal-entries">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">
                <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                Novo Lançamento
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
          {/* Quick Navigation Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/accounting/chart-of-accounts"
              className="group rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 hover:border-emerald-500/50 hover:bg-zinc-50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white mt-4">Plano Geral de Contas</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Estrutura oficial PGC Moçambique com classes de 1 a 8 e saldos correntes.
              </p>
            </Link>

            <Link
              href="/accounting/journal-entries"
              className="group rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 hover:border-blue-500/50 hover:bg-zinc-50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white mt-4">Diário & Razão</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Histórico de partidas dobradas, lançamentos automáticos de POS e despesas.
              </p>
            </Link>

            <Link
              href="/accounting/reports"
              className="group rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 hover:border-purple-500/50 hover:bg-zinc-50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Scale className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white mt-4">Relatórios & Demonstrações</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Balancete de Verificação, DRE e Balanço Patrimonial com exportação Excel/PDF.
              </p>
            </Link>
          </div>

          {/* Financial KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-4">
              <span className="text-xs text-zinc-500 font-medium uppercase">Movimento Total Débito</span>
              <p className="text-2xl font-black text-white mt-1">
                {Number(trialBalance?.sum_total_debits || 0).toFixed(2)}{" "}
                <span className="text-xs font-normal text-zinc-500">MZN</span>
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-4">
              <span className="text-xs text-zinc-500 font-medium uppercase">Movimento Total Crédito</span>
              <p className="text-2xl font-black text-white mt-1">
                {Number(trialBalance?.sum_total_credits || 0).toFixed(2)}{" "}
                <span className="text-xs font-normal text-zinc-500">MZN</span>
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-4">
              <span className="text-xs text-zinc-500 font-medium uppercase">Rendimentos do Exercício</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {Number(dre?.total_revenues || 0).toFixed(2)}{" "}
                <span className="text-xs font-normal text-zinc-500">MZN</span>
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-4">
              <span className="text-xs text-zinc-500 font-medium uppercase">Resultado Líquido</span>
              <p className="text-2xl font-black text-white mt-1 flex items-center gap-1">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                {Number(dre?.net_income || 0).toFixed(2)}{" "}
                <span className="text-xs font-normal text-zinc-500">MZN</span>
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
