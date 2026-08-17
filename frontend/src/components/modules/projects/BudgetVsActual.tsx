"use client";

import { AlertTriangle, TrendingUp, DollarSign, CheckCircle2 } from "lucide-react";
import { ProjectSummary } from "@/types/projects";

interface BudgetVsActualProps {
  summary: ProjectSummary;
}

export default function BudgetVsActual({ summary }: BudgetVsActualProps) {
  const isProfitable = summary.profit >= 0;

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-5">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Orçamento vs. Custos Reais
        </h4>
        {summary.budget_alert && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse">
            <AlertTriangle className="h-3 w-3" />
            Alerta: &gt;80% Orçamento Utilizado
          </span>
        )}
      </div>

      {/* Progress Bars */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-zinc-400">Consumo Orçamental:</span>
          <span className={summary.budget_used_percentage > 100 ? "text-red-400 font-bold" : "text-white font-bold"}>
            {summary.budget_used_percentage}% ({Number(summary.actual_cost).toLocaleString("pt-MZ")} de{" "}
            {Number(summary.budget).toLocaleString("pt-MZ")} MZN)
          </span>
        </div>

        <div className="h-3 w-full rounded-full bg-zinc-950 overflow-hidden p-0.5 border border-zinc-800">
          <div
            className={`h-full rounded-full transition-all ${
              summary.budget_used_percentage > 100
                ? "bg-red-500"
                : summary.budget_used_percentage >= 80
                ? "bg-amber-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${Math.min(summary.budget_used_percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Financial KPIs Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3">
          <span className="text-[10px] uppercase font-bold text-blue-400">Orçamento Aprovado</span>
          <p className="text-base font-black text-white mt-1">
            {Number(summary.budget).toLocaleString("pt-MZ")}{" "}
            <span className="text-[10px] font-normal text-zinc-400">MZN</span>
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3">
          <span className="text-[10px] uppercase font-bold text-red-400">Despesas Acumuladas</span>
          <p className="text-base font-black text-white mt-1">
            {Number(summary.actual_cost).toLocaleString("pt-MZ")}{" "}
            <span className="text-[10px] font-normal text-zinc-400">MZN</span>
          </p>
        </div>

        <div
          className={`rounded-xl border p-3 ${
            isProfitable
              ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-300"
              : "border-red-500/30 bg-red-950/30 text-red-300"
          }`}
        >
          <span className="text-[10px] uppercase font-bold">Margem / Saldo Previsto</span>
          <p className="text-base font-black text-white mt-1 flex items-center gap-1">
            {Number(summary.profit).toLocaleString("pt-MZ")}{" "}
            <span className="text-[10px] font-normal text-zinc-400">MZN</span>
          </p>
        </div>
      </div>
    </div>
  );
}
