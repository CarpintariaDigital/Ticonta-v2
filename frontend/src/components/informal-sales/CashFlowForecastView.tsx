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
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total a Receber (Fiados)</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {cashFlow?.total_outstanding_debt.toLocaleString("pt-MZ") || 0} MT
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Saldo devedor na praça</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-rose-500/30 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Fiados Vencidos (Atrasados)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-rose-400">
            {cashFlow?.overdue_amount.toLocaleString("pt-MZ") || 0} MT
          </div>
          <span className="text-[11px] text-rose-400/80 mt-1 block">Cobrança prioritária</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Previsão Próximos 7 Dias</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400">
            {cashFlow?.due_this_week_amount.toLocaleString("pt-MZ") || 0} MT
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Entradas previstas esta semana</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          Cronograma de Recebimentos Estimados
        </h3>
        <p className="text-xs text-slate-400 mb-4">
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
                  : "bg-slate-950/60 border-slate-800"
              }`}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-300 mb-1">
                  {bucket.period_label}
                </span>
                <span
                  className={`text-base font-extrabold block ${
                    idx === 0 ? "text-rose-400" : "text-white"
                  }`}
                >
                  {bucket.expected_amount.toLocaleString("pt-MZ")} MT
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {bucket.debit_count} conta(s)
                </span>
              </div>

              {bucket.customer_names.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 truncate">
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
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            Estrutura da Receita (À Vista vs Fiado)
          </h4>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-xl flex items-center justify-between">
              <span className="text-slate-400">Receita Total de Vendas:</span>
              <span className="font-bold text-white">
                {revenueBreakdown?.total_revenue.toLocaleString("pt-MZ") || 0} MT
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl flex items-center justify-between">
              <span className="text-slate-400">Vendas Liquidadas no Ato (À Vista):</span>
              <span className="font-bold text-emerald-400">
                {revenueBreakdown?.immediate_cash_revenue.toLocaleString("pt-MZ") || 0} MT
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl flex items-center justify-between">
              <span className="text-slate-400">Total de Crédito Fiado Concedido:</span>
              <span className="font-bold text-amber-400">
                {revenueBreakdown?.debit_credit_revenue.toLocaleString("pt-MZ") || 0} MT
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl flex items-center justify-between">
              <span className="text-slate-400">Total de Dívidas Já Recuperadas:</span>
              <span className="font-bold text-teal-300">
                {revenueBreakdown?.total_recovered_debt.toLocaleString("pt-MZ") || 0} MT
              </span>
            </div>
          </div>
        </div>

        {/* Right: Credit Risk Customers */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Clientes em Análise de Risco
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {creditRisk?.customers && creditRisk.customers.length > 0 ? (
              creditRisk.customers.map((c) => (
                <div
                  key={c.customer_id}
                  className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{c.name}</span>
                    <span className="text-[11px] text-slate-500">{c.phone || c.location || "Sem contacto"}</span>
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
              <div className="py-8 text-center text-slate-500 text-xs">
                Nenhum cliente em situação de risco crítico.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
