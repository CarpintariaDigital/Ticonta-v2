"use client";

import { Download, Printer, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { IncomeStatementResponse } from "@/types/accounting";
import { Button } from "@/components/ui/button";
import { exportToCSV, printFinancialReport } from "@/services/export";

interface IncomeStatementProps {
  data: IncomeStatementResponse;
}

export default function IncomeStatement({ data }: IncomeStatementProps) {
  const isProfitable = data.net_income >= 0;

  const handleExport = () => {
    const headers = ["Categoria", "Código", "Descrição", "Valor (MZN)"];
    const rows = [
      ...data.revenues_breakdown.map((r) => ["Rendimento", r.code, r.name, r.amount]),
      ...data.expenses_breakdown.map((e) => ["Gasto", e.code, e.name, e.amount]),
      ["Resultado Líquido", "", "Lucro/Prejuízo Líquido", data.net_income],
    ];
    exportToCSV(`DRE_${data.period_from}_${data.period_to}`, rows, headers);
  };

  return (
    <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white backdrop-blur p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-white">Demonstração de Resultados (DRE Moçambique)</h3>
          <p className="text-xs text-zinc-500">
            Período: {data.period_from} até {data.period_to}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="border-zinc-200 bg-zinc-50 hover:bg-zinc-800 text-zinc-700 text-xs h-8"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Excel / CSV
          </Button>
          <Button
            size="sm"
            onClick={() => printFinancialReport("DRE")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
          <span className="text-xs text-emerald-400 font-semibold uppercase">Total de Rendimentos</span>
          <p className="text-xl font-extrabold text-white mt-1">
            {Number(data.total_revenues).toFixed(2)}{" "}
            <span className="text-xs font-normal text-zinc-500">MZN</span>
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-4">
          <span className="text-xs text-red-400 font-semibold uppercase">Total de Gastos / Custos</span>
          <p className="text-xl font-extrabold text-white mt-1">
            {Number(data.total_expenses).toFixed(2)}{" "}
            <span className="text-xs font-normal text-zinc-500">MZN</span>
          </p>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            isProfitable
              ? "border-emerald-500/30 bg-emerald-900/30 text-emerald-300"
              : "border-red-500/30 bg-red-900/30 text-red-300"
          }`}
        >
          <span className="text-xs font-semibold uppercase">Resultado Líquido do Exercício</span>
          <p className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
            {isProfitable ? <TrendingUp className="h-5 w-5 text-emerald-400" /> : <TrendingDown className="h-5 w-5 text-red-400" />}
            {Number(data.net_income).toFixed(2)}{" "}
            <span className="text-xs font-normal text-zinc-500">MZN</span>
          </p>
        </div>
      </div>

      {/* Breakdown Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenues Section */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Proveitos e Vendas (Classe 7)
          </h4>
          <div className="space-y-2 text-xs font-mono">
            {data.revenues_breakdown.map((r) => (
              <div key={r.code} className="flex justify-between border-b border-zinc-200/40 pb-1.5">
                <span className="text-zinc-700">
                  <b className="text-emerald-400">{r.code}</b> {r.name}
                </span>
                <span className="font-bold text-white">{Number(r.amount).toFixed(2)} MZN</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Section */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
            Gastos e Perdas (Classe 6)
          </h4>
          <div className="space-y-2 text-xs font-mono">
            {data.expenses_breakdown.map((e) => (
              <div key={e.code} className="flex justify-between border-b border-zinc-200/40 pb-1.5">
                <span className="text-zinc-700">
                  <b className="text-red-400">{e.code}</b> {e.name}
                </span>
                <span className="font-bold text-white">{Number(e.amount).toFixed(2)} MZN</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
