"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Scale, TrendingUp, ShieldCheck } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TrialBalance from "@/components/modules/accounting/TrialBalance";
import IncomeStatement from "@/components/modules/accounting/IncomeStatement";
import BalanceSheet from "@/components/modules/accounting/BalanceSheet";
import { accountingService } from "@/services/accounting";
import {
  BalanceSheetResponse,
  IncomeStatementResponse,
  TrialBalanceResponse,
} from "@/types/accounting";
import { Button } from "@/components/ui/button";

export default function AccountingReportsPage() {
  const [activeTab, setActiveTab] = useState<"trial" | "dre" | "bs">("trial");
  const [trialBalance, setTrialBalance] = useState<TrialBalanceResponse | null>(null);
  const [dre, setDre] = useState<IncomeStatementResponse | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const [tb, inc, bs] = await Promise.all([
        accountingService.getTrialBalance(),
        accountingService.getIncomeStatement(),
        accountingService.getBalanceSheet(),
      ]);
      setTrialBalance(tb);
      setDre(inc);
      setBalanceSheet(bs);
    } catch (err) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FAF8F5] text-zinc-900 flex flex-col font-sans">
        {/* Header */}
        <header className="border-b border-zinc-200 bg-white backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/accounting">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Demonstrações & Relatórios Financeiros</h1>
              <p className="text-xs text-zinc-500">Balancete, DRE e Balanço Patrimonial</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadReports}
            className="border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-800 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Recalcular
          </Button>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-zinc-200 bg-zinc-50/40 px-6 py-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("trial")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "trial"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-800 border border-zinc-200"
              }`}
            >
              <Scale className="h-4 w-4" />
              1. Balancete de Verificação
            </button>

            <button
              onClick={() => setActiveTab("dre")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "dre"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-800 border border-zinc-200"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              2. Demonstração de Resultados (DRE)
            </button>

            <button
              onClick={() => setActiveTab("bs")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "bs"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-800 border border-zinc-200"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              3. Balanço Patrimonial (BS)
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6">
          {activeTab === "trial" && trialBalance && <TrialBalance data={trialBalance} />}
          {activeTab === "dre" && dre && <IncomeStatement data={dre} />}
          {activeTab === "bs" && balanceSheet && <BalanceSheet data={balanceSheet} />}
        </main>
      </div>
    </ProtectedRoute>
  );
}
