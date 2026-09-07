"use client";

import React from "react";
import {
  CashFlowForecastResponse,
  RevenueBreakdownResponse,
  CreditRiskReportResponse,
} from "@/types/informal_sales";
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  DollarSign,
  ShieldAlert,
  PieChart,
  Users,
  CheckCircle2,
} from "lucide-react";

interface CashFlowForecastViewProps {
  cashFlow: CashFlowForecastResponse | null;
  revenueBreakdown: RevenueBreakdownResponse | null;
  creditRisk: CreditRiskReportResponse | null;
}

export const CashFlowForecastView: React.FC<CashFlowForecastViewProps> = ({
  cashFlow,
  revenueBreakdown,
  creditRisk,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white/90 border border-zinc-200 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-zinc-500 text-xs mb-2">
            <span>Total a Receber (Fiados)</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-zinc-900">
            {cashFlow?.total_outstanding_debt.toLocaleString("pt-MZ") || 0} MT
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Saldo devedor na praça</span>
        </div>

        <div className="p-4 bg-white/90 border border-rose-500/30 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-zinc-500 text-xs mb-2">
            <span>Fiados Vencidos (Atrasados)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-rose-400">
            {cashFlow?.overdue_amount.toLocaleString("pt-MZ") || 0} MT
          </div>
          <span className="text-[11px] text-rose-400/80 mt-1 block">Cobrança prioritária</span>
        </div>

        <div className="p-4 bg-white/90 border border-zinc-200 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-zinc-500 text-xs mb-2">
            <span>Previsão Próximos 7 Dias</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400">
            {cashFlow?.due_this_week_amount.toLocaleString("pt-MZ") || 0} MT
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Entradas previstas esta semana</span>
        </div>

        <div className="p-4 bg-white/90 border border-zinc-200 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-zinc-500 text-xs mb-2">
            <span>Taxa de Recuperação</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-extrabold text-teal-300">
            {revenueBreakdown?.debit_recovery_rate_percent || 100}%
          </div>
          <span className="text-[11px] text-teal-400/80 mt-1 block">Eficácia na cobrança do fiado</span>
        </div>
      </div>

      {/* Cash Flow Timeline Buckets */}
      <div className="bg-white/90 border border-zinc-200 rounded-2xl p-5 shadow-2xl">
        <h3 className="text-base font-bold text-zinc-900 mb-1 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          Cronograma de Recebimentos Estimados
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Previsão temporal das amortizações acordadas com os clientes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {cashFlow?.forecast_timeline.map((bucket, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                idx === 0
                  ? "bg-rose-950/20 border-rose-500/40"
                  : idx === 1 || idx === 2
                  ? "bg-emerald-950/20 border-emerald-500/40"
                  : "bg-zinc-50/80 border-zinc-200"
              }`}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block text-zinc-700 mb-1">
                  {bucket.period_label}
                </span>
                <span
                  className={`text-base font-extrabold block ${
                    idx === 0 ? "text-rose-400" : "text-zinc-900"
                  }`}
                >
                  {bucket.expected_amount.toLocaleString("pt-MZ")} MT
                </span>
                <span className="text-[11px] text-zinc-500 block mt-0.5">
                  {bucket.debit_count} conta(s)
                </span>
              </div>

              {bucket.customer_names.length > 0 && (
                <div className="mt-3 pt-2 border-t border-zinc-200/80 text-[10px] text-zinc-500 truncate">
                  {bucket.customer_names.join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Breakdown & High-Risk Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revenue Distribution */}
        <div className="lg:col-span-6 bg-white/90 border border-zinc-200 rounded-2xl p-5 shadow-2xl">
          <h4 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            Estrutura da Receita (À Vista vs Fiado)
          </h4>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-zinc-50/80 rounded-xl flex items-center justify-between">
              <span className="text-zinc-500">Receita Total de Vendas:</span>
              <span className="font-bold text-zinc-900">
                {revenueBreakdown?.total_revenue.toLocaleString("pt-MZ") || 0} MT
              </span>
            </div>

            <div className="p-3 bg-zinc-50/80 rounded-xl flex items-center justify-between">
              <span className="text-zinc-500">Vendas Liquidadas no Ato (À Vista):</span>
              <span className="font-bold text-emerald-400">
                {revenueBreakdown?.immediate_cash_revenue.toLocaleString("pt-MZ") || 0} MT
              </span>
            </div>

            <div className="p-3 bg-zinc-50/80 rounded-xl flex items-center justify-between">
              <span className="text-zinc-500">Total de Crédito Fiado Concedido:</span>
              <span className="font-bold text-amber-400">
                {revenueBreakdown?.debit_credit_revenue.toLocaleString("pt-MZ") || 0} MT
              </span>
            </div>

            <div className="p-3 bg-zinc-50/80 rounded-xl flex items-center justify-between">
              <span className="text-zinc-500">Total de Dívidas Já Recuperadas:</span>
              <span className="font-bold text-teal-300">
                {revenueBreakdown?.total_recovered_debt.toLocaleString("pt-MZ") || 0} MT
              </span>
            </div>
          </div>
        </div>

        {/* Right: Credit Risk Customers */}
        <div className="lg:col-span-6 bg-white/90 border border-zinc-200 rounded-2xl p-5 shadow-2xl">
          <h4 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Clientes em Análise de Risco
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {creditRisk?.customers && creditRisk.customers.length > 0 ? (
              creditRisk.customers.map((c) => (
                <div
                  key={c.customer_id}
                  className="p-2.5 bg-zinc-50/80 border border-zinc-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-zinc-900 block">{c.name}</span>
                    <span className="text-[11px] text-zinc-500">{c.phone || c.location || "Sem contacto"}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-rose-400 block">
                      {c.total_owed.toLocaleString("pt-MZ")} MT
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Score: {c.payment_reliability.toFixed(1)}/5
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs">
                Nenhum cliente em situação de risco crítico.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
