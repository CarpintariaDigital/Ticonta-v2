"use client";

import { useState } from "react";
import {
  Calculator,
  Download,
  FileCode,
  ShieldCheck,
  TrendingUp,
  Loader2,
  Send,
  AlertCircle,
  FileText,
} from "lucide-react";
import { MonthlyPayrollSummary } from "@/types/hr";
import { Button } from "@/components/ui/button";
import { exportToCSV, printFinancialReport } from "@/services/export";

interface PayrollCalculatorProps {
  period: string;
  payroll: MonthlyPayrollSummary | null;
  isLoading: boolean;
  onPeriodChange: (p: string) => void;
  onGeneratePayroll: (p: string) => Promise<any>;
  onExportXML: (p: string) => Promise<any>;
}

export default function PayrollCalculator({
  period,
  payroll,
  isLoading,
  onPeriodChange,
  onGeneratePayroll,
  onExportXML,
}: PayrollCalculatorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingXML, setIsExportingXML] = useState(false);

  const handleProcess = async () => {
    setIsGenerating(true);
    try {
      await onGeneratePayroll(period);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = () => {
    if (!payroll) return;
    const headers = [
      "Funcionário",
      "Cargo",
      "Salário Bruto",
      "INSS Empregado (3%)",
      "IRPS Retido",
      "Salário Líquido",
      "INSS Patronal (4%)",
    ];
    const rows = payroll.items.map((it) => [
      it.employee_name,
      it.position,
      it.gross_salary,
      it.inss_employee,
      it.irps,
      it.net_salary,
      it.inss_employer,
    ]);
    exportToCSV(`folha_salarial_${period}`, rows, headers);
  };

  const handleDownloadXML = async () => {
    setIsExportingXML(true);
    try {
      await onExportXML(period);
    } finally {
      setIsExportingXML(false);
    }
  };

  return (
    <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-5 font-sans">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white">Processamento da Folha Salarial & INSS</h3>
          <p className="text-xs text-zinc-400">
            Deduções automáticas de 3% Segurança Social e Retenção na Fonte IRPS Moçambique
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
            <span className="text-[11px] font-semibold text-zinc-400">Período:</span>
            <input
              type="month"
              value={period}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="bg-transparent text-xs text-white font-mono focus:outline-none"
            />
          </div>

          <Button
            size="sm"
            disabled={isGenerating || isLoading}
            onClick={handleProcess}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Calculator className="h-3.5 w-3.5 mr-1.5" />
            )}
            Gerar Folha do Mês
          </Button>
        </div>
      </div>

      {payroll ? (
        <>
          {/* Summary KPIs */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3.5">
              <span className="text-[10px] uppercase font-bold text-blue-400">Massa Salarial Bruta</span>
              <p className="text-xl font-black text-white mt-1">
                {Number(payroll.total_gross).toLocaleString("pt-MZ")}{" "}
                <span className="text-xs font-normal text-zinc-400">MZN</span>
              </p>
            </div>

            <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-3.5">
              <span className="text-[10px] uppercase font-bold text-purple-400">
                Guia Total INSS (7%)
              </span>
              <p className="text-xl font-black text-white mt-1">
                {Number(payroll.total_inss_due).toLocaleString("pt-MZ")}{" "}
                <span className="text-[10px] font-normal text-zinc-400">(3% + 4%)</span>
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5">
              <span className="text-[10px] uppercase font-bold text-amber-400">Retenção IRPS / IRT</span>
              <p className="text-xl font-black text-white mt-1">
                {Number(payroll.total_irps).toLocaleString("pt-MZ")}{" "}
                <span className="text-xs font-normal text-zinc-400">MZN</span>
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Líquido a Pagar</span>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {Number(payroll.total_net_payable).toLocaleString("pt-MZ")}{" "}
                <span className="text-xs font-normal text-zinc-400">MZN</span>
              </p>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Folha calculada para {payroll.total_employees} trabalhadores ativos.</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="border-zinc-800 bg-zinc-900 text-zinc-300 text-xs h-8"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Excel / CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => printFinancialReport("Folha")}
                className="border-zinc-800 bg-zinc-900 text-zinc-300 text-xs h-8"
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                Imprimir
              </Button>
              <Button
                size="sm"
                disabled={isExportingXML}
                onClick={handleDownloadXML}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold h-8"
              >
                <FileCode className="h-3.5 w-3.5 mr-1" />
                {isExportingXML ? "A gerar..." : "Baixar XML SISSMO (INSS)"}
              </Button>
            </div>
          </div>

          {/* Payroll Table Breakdown */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left font-sans text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 font-mono">
                <tr>
                  <th className="py-3 px-4">Funcionário</th>
                  <th className="py-3 px-4">Cargo</th>
                  <th className="py-3 px-4 text-right">Salário Bruto</th>
                  <th className="py-3 px-4 text-right">INSS (3%)</th>
                  <th className="py-3 px-4 text-right">IRPS Retido</th>
                  <th className="py-3 px-4 text-right font-bold text-white">Líquido a Receber</th>
                  <th className="py-3 px-4 text-right text-zinc-500">Patronal (4%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {payroll.items.map((it) => (
                  <tr key={it.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      <div>{it.employee_name}</div>
                      <div className="text-[10px] font-normal text-zinc-500 font-mono">
                        INSS: {it.employee_inss || "N/A"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{it.position}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                      {Number(it.gross_salary).toLocaleString("pt-MZ")}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-purple-400">
                      -{Number(it.inss_employee).toLocaleString("pt-MZ")}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-400">
                      -{Number(it.irps).toLocaleString("pt-MZ")}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {Number(it.net_salary).toLocaleString("pt-MZ")} MZN
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-500">
                      {Number(it.inss_employer).toLocaleString("pt-MZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 text-center p-6 text-xs text-zinc-500 space-y-2">
          <AlertCircle className="h-6 w-6 text-zinc-600" />
          <span>Nenhuma folha salarial processada para o período {period}.</span>
          <Button size="sm" onClick={handleProcess} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">
            Calcular Agora
          </Button>
        </div>
      )}
    </div>
  );
}
