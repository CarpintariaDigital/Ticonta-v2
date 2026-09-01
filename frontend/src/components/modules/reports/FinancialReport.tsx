"use client";

import { FinancialReportData } from "@/types/reports";
import { DollarSign, TrendingUp, ArrowDownRight, ArrowUpRight, Wallet, Building } from "lucide-react";

interface FinancialReportViewProps {
  data: FinancialReportData;
}

export default function FinancialReportView({ data }: FinancialReportViewProps) {
  const isPositive = data.net_cash_flow >= 0;

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
          <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">
            Receitas Totais Consolidadas
          </span>
          <p className="text-xl font-black text-white mt-1">
            {Number(data.total_income).toLocaleString("pt-MZ")}{" "}
            <span className="text-xs font-normal text-zinc-500">MZN</span>
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-4">
          <span className="text-[11px] text-red-400 font-medium uppercase tracking-wider">
            Despesas Operacionais & Custos
          </span>
          <p className="text-xl font-black text-white mt-1">
            {Number(data.total_expenses).toLocaleString("pt-MZ")}{" "}
            <span className="text-xs font-normal text-zinc-500">MZN</span>
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-4">
          <span className="text-[11px] text-blue-400 font-medium uppercase tracking-wider">
            Fluxo de Caixa Líquido
          </span>
          <p
            className={`text-xl font-black mt-1 flex items-center gap-1 ${
              isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPositive ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
            {Number(data.net_cash_flow).toLocaleString("pt-MZ")}{" "}
            <span className="text-xs font-normal text-zinc-500">MZN</span>
          </p>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4">
          <span className="text-[11px] text-purple-400 font-medium uppercase tracking-wider">
            Margem Líquida
          </span>
          <p className="text-xl font-black text-white mt-1">
            {data.profit_margin_percentage}%
          </p>
        </div>
      </div>

      {/* Cash & Bank Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-200 pb-2 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-amber-400" />
            Disponibilidades em Caixa
          </h4>
          <p className="text-2xl font-black text-white font-mono">
            {Number(data.cash_in_hand).toLocaleString("pt-MZ")}{" "}
            <span className="text-sm font-normal text-zinc-500">MZN</span>
          </p>
          <span className="text-xs text-zinc-500 block">
            Soma dos caixas físicos de ponto de venda e fundo de maneio.
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-200 pb-2 flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-400" />
            Saldos Bancários Globais
          </h4>
          <p className="text-2xl font-black text-white font-mono">
            {Number(data.bank_balances).toLocaleString("pt-MZ")}{" "}
            <span className="text-sm font-normal text-zinc-500">MZN</span>
          </p>
          <span className="text-xs text-zinc-500 block">
            Contas correntes conciliadas em instituições bancárias locais.
          </span>
        </div>
      </div>
    </div>
  );
}
