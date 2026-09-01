"use client";

import { AlertTriangle, TrendingUp, DollarSign, CheckCircle2 } from "lucide-react";
import { ProjectSummary } from "@/types/projects";

interface BudgetVsActualProps {
  summary: ProjectSummary;
}

export default function BudgetVsActual({ summary }: BudgetVsActualProps) {
  const isProfitable = summary.profit >= 0;

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs text-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider font-mono">
          Orçamento vs. Custos Reais
        </h4>
        {summary.budget_alert && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full font-mono">
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            Alerta: &gt;80% Orçamento Utilizado
          </span>
        )}
      </div>

      {/* Progress Bars */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-zinc-500">Consumo Orçamental:</span>
          <span className={summary.budget_used_percentage > 100 ? "text-rose-700 font-bold" : "text-zinc-900 font-bold"}>
            {summary.budget_used_percentage}% ({Number(summary.actual_cost).toLocaleString("pt-MZ")} de{" "}
            {Number(summary.budget).toLocaleString("pt-MZ")} MZN)
          </span>
        </div>

        <div className="h-3 w-full rounded-full bg-zinc-100 overflow-hidden p-0.5 border border-zinc-200">
          <div
            className={`h-full rounded-full transition-all ${
              summary.budget_used_percentage > 100
                ? "bg-rose-600"
                : summary.budget_used_percentage >= 80
                ? "bg-amber-500"
                : "bg-emerald-600"
            }`}
            style={{ width: `${Math.min(summary.budget_used_percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Financial KPIs Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Orçamento Aprovado</span>
          <p className="text-base font-black text-zinc-900 font-mono">
            {Number(summary.budget).toLocaleString("pt-MZ")}{" "}
            <span className="text-[10px] font-normal text-zinc-500">MZN</span>
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-rose-700 font-mono">Despesas Acumuladas</span>
          <p className="text-base font-black text-zinc-900 font-mono">
            {Number(summary.actual_cost).toLocaleString("pt-MZ")}{" "}
            <span className="text-[10px] font-normal text-zinc-500">MZN</span>
          </p>
        </div>

        <div
          className={`rounded-2xl border p-3.5 space-y-1 ${
            isProfitable
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <span className={`text-[10px] uppercase font-bold font-mono ${isProfitable ? "text-emerald-800" : "text-rose-800"}`}>
            Margem / Saldo Previsto
          </span>
          <p className={`text-base font-black font-mono ${isProfitable ? "text-emerald-800" : "text-rose-800"}`}>
            {Number(summary.profit).toLocaleString("pt-MZ")}{" "}
            <span className="text-[10px] font-normal text-zinc-500">MZN</span>
          </p>
        </div>
      </div>
    </div>
  );
}
