"use client";

import { CheckCircle, AlertTriangle, Download, Printer } from "lucide-react";
import { TrialBalanceResponse } from "@/types/accounting";
import { Button } from "@/components/ui/button";
import { exportToCSV, printFinancialReport } from "@/services/export";

interface TrialBalanceProps {
  data: TrialBalanceResponse;
}

export default function TrialBalance({ data }: TrialBalanceProps) {
  const handleExport = () => {
    const headers = [
      "Código",
      "Nome da Conta",
      "Tipo",
      "Movimento Débito",
      "Movimento Crédito",
      "Saldo Devedor",
      "Saldo Credor",
    ];
    const rows = data.items.map((it) => [
      it.account_code,
      it.account_name,
      it.account_type,
      it.total_debit,
      it.total_credit,
      it.debit_balance,
      it.credit_balance,
    ]);
    exportToCSV(`balancete_${data.date}`, rows, headers);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Balancete de Verificação (Trial Balance)</h3>
            {data.is_balanced ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <CheckCircle className="h-3 w-3" />
                Balanceado (✓)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                <AlertTriangle className="h-3 w-3" />
                Desbalanceado
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">Data de referência: {data.date}</p>
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
            onClick={() => printFinancialReport("Balancete")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs text-zinc-300">
          <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-y border-zinc-800">
            <tr>
              <th className="py-2.5 px-3">Código</th>
              <th className="py-2.5 px-3">Descrição da Conta</th>
              <th className="py-2.5 px-3 text-right">Débitos (MZN)</th>
              <th className="py-2.5 px-3 text-right">Créditos (MZN)</th>
              <th className="py-2.5 px-3 text-right">Saldo Devedor</th>
              <th className="py-2.5 px-3 text-right">Saldo Credor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {data.items.map((it) => (
              <tr key={it.account_code} className="hover:bg-zinc-900/40 transition-colors">
                <td className="py-2 px-3 font-semibold text-emerald-400">{it.account_code}</td>
                <td className="py-2 px-3 text-zinc-200">{it.account_name}</td>
                <td className="py-2 px-3 text-right">{Number(it.total_debit).toFixed(2)}</td>
                <td className="py-2 px-3 text-right">{Number(it.total_credit).toFixed(2)}</td>
                <td className="py-2 px-3 text-right font-semibold text-zinc-100">
                  {Number(it.debit_balance) > 0 ? Number(it.debit_balance).toFixed(2) : "-"}
                </td>
                <td className="py-2 px-3 text-right font-semibold text-zinc-100">
                  {Number(it.credit_balance) > 0 ? Number(it.credit_balance).toFixed(2) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-zinc-700 bg-zinc-950 font-bold text-white text-xs">
            <tr>
              <td colSpan={2} className="py-3 px-3 uppercase tracking-wider">
                Totais Finais do Exercício:
              </td>
              <td className="py-3 px-3 text-right text-emerald-400">
                {Number(data.sum_total_debits).toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right text-blue-400">
                {Number(data.sum_total_credits).toFixed(2)}
              </td>
              <td colSpan={2} className="py-3 px-3 text-center text-zinc-400 font-sans text-[11px]">
                {data.is_balanced ? "✓ Balancete Perfeito" : "⚠ Atenção: Diferença Detetada"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
