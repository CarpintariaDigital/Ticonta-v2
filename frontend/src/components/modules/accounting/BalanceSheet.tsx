"use client";

import { Download, Printer, ShieldCheck, AlertCircle } from "lucide-react";
import { BalanceSheetResponse } from "@/types/accounting";
import { Button } from "@/components/ui/button";
import { exportToCSV, printFinancialReport } from "@/services/export";

interface BalanceSheetProps {
  data: BalanceSheetResponse;
}

export default function BalanceSheet({ data }: BalanceSheetProps) {
  const handleExport = () => {
    const headers = ["Classificação", "Código", "Rubrica", "Valor (MZN)"];
    const rows = [
      ...data.assets_breakdown.map((a) => ["Activo", a.code, a.name, a.amount]),
      ...data.liabilities_breakdown.map((l) => ["Passivo", l.code, l.name, l.amount]),
      ...data.equity_breakdown.map((eq) => ["Capital Próprio", eq.code, eq.name, eq.amount]),
      ["Resultado Retido", "", "Resultados Transitados / Exercício", data.retained_earnings],
    ];
    exportToCSV(`Balanco_Patrimonial_${data.as_of_date}`, rows, headers);
  };

  return (
    <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Balanço Patrimonial (PGC-NIRF Moçambique)</h3>
            {data.is_balanced ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-3 w-3" />
                Equação Fundamental Equilibrada
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                <AlertCircle className="h-3 w-3" />
                Desbalanceado
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">Posição em: {data.as_of_date}</p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs h-8"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Excel / CSV
          </Button>
          <Button
            size="sm"
            onClick={() => printFinancialReport("Balanco")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* 2 Main Columns: Activo vs Passivo + Capital Próprio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Activo */}
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-4">
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
              Total do Activo (Classes 1, 2, 3, 4)
            </span>
            <p className="text-2xl font-black text-white mt-1">
              {Number(data.total_assets).toFixed(2)}{" "}
              <span className="text-xs font-normal text-zinc-400">MZN</span>
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2 font-mono text-xs">
            <h4 className="font-bold text-zinc-200 uppercase tracking-wider mb-2">Composição do Activo</h4>
            {data.assets_breakdown.map((a) => (
              <div key={a.code} className="flex justify-between border-b border-zinc-800/40 pb-1.5">
                <span className="text-zinc-300">
                  <b className="text-blue-400">{a.code}</b> {a.name}
                </span>
                <span className="font-bold text-white">{Number(a.amount).toFixed(2)} MZN</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Passivo & Capital Próprio */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5">
              <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
                Total do Passivo
              </span>
              <p className="text-lg font-black text-white mt-1">
                {Number(data.total_liabilities).toFixed(2)} MZN
              </p>
            </div>

            <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-3.5">
              <span className="text-[11px] text-purple-400 font-semibold uppercase tracking-wider">
                Capital Próprio Total
              </span>
              <p className="text-lg font-black text-white mt-1">
                {Number(data.total_equity).toFixed(2)} MZN
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2 font-mono text-xs">
            <h4 className="font-bold text-zinc-200 uppercase tracking-wider mb-2">Passivo (Obrigações)</h4>
            {data.liabilities_breakdown.map((l) => (
              <div key={l.code} className="flex justify-between border-b border-zinc-800/40 pb-1.5">
                <span className="text-zinc-300">
                  <b className="text-amber-400">{l.code}</b> {l.name}
                </span>
                <span className="font-bold text-white">{Number(l.amount).toFixed(2)} MZN</span>
              </div>
            ))}

            <h4 className="font-bold text-zinc-200 uppercase tracking-wider mt-4 mb-2 pt-2 border-t border-zinc-800">
              Capital Próprio & Resultados
            </h4>
            {data.equity_breakdown.map((eq) => (
              <div key={eq.code} className="flex justify-between border-b border-zinc-800/40 pb-1.5">
                <span className="text-zinc-300">
                  <b className="text-purple-400">{eq.code}</b> {eq.name}
                </span>
                <span className="font-bold text-white">{Number(eq.amount).toFixed(2)} MZN</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-emerald-400 pt-1">
              <span>Resultado Líquido do Período</span>
              <span>{Number(data.retained_earnings).toFixed(2)} MZN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
