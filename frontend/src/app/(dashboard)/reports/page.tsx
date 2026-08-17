"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  FolderKanban,
  Users,
  PieChart,
  ArrowLeft,
  RefreshCw,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import SalesReportView from "@/components/modules/reports/SalesReport";
import FinancialReportView from "@/components/modules/reports/FinancialReport";
import { useReports } from "@/hooks/useReports";
import { ReportType } from "@/types/reports";
import { Button } from "@/components/ui/button";
import { exportToCSV, printFinancialReport } from "@/services/export";

const REPORT_TABS: { id: ReportType; label: string; icon: any }[] = [
  { id: "sales", label: "Vendas & POS", icon: ShoppingCartIcon },
  { id: "financial", label: "Finanças & Caixa", icon: DollarSign },
  { id: "crm", label: "Pipeline & CRM", icon: TrendingUp },
  { id: "projects", label: "Obras & Projetos", icon: FolderKanban },
  { id: "hr", label: "RH & Folha INSS", icon: Users },
];

function ShoppingCartIcon(props: any) {
  return <PieChart {...props} />;
}

export default function ReportsPage() {
  const {
    activeReportType,
    selectedPeriod,
    salesData,
    financialData,
    crmData,
    projectsData,
    hrData,
    isLoading,
    setActiveReportType,
    setSelectedPeriod,
    fetchActiveReport,
  } = useReports();

  const handleExportCSV = () => {
    if (activeReportType === "sales" && salesData) {
      const headers = ["Produto", "Quantidade", "Receita (MZN)"];
      const rows = salesData.top_products.map((p) => [p.name, p.quantity, p.revenue]);
      exportToCSV(`relatorio_vendas_${selectedPeriod}`, rows, headers);
    } else if (activeReportType === "projects" && projectsData) {
      const headers = ["Categoria de Custo", "Total (MZN)"];
      const rows = Object.entries(projectsData.expenses_by_category).map(([k, v]) => [k, v]);
      exportToCSV(`relatorio_projetos_${selectedPeriod}`, rows, headers);
    } else {
      window.open(
        `http://localhost:8000/api/v1/reports/export/csv?report_type=${activeReportType}&period=${selectedPeriod}&company_id=1`,
        "_blank"
      );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        {/* Top Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 font-bold">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Relatórios & BI Executivo</h1>
              <p className="text-xs text-zinc-400">Análise de Desempenho, Vendas, Margens e Compliance</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
              <span className="text-[11px] font-semibold text-zinc-400">Período:</span>
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchActiveReport(activeReportType, selectedPeriod)}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 text-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
              Excel / CSV
            </Button>

            <Button
              size="sm"
              onClick={() => printFinancialReport(activeReportType)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/40"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Imprimir
            </Button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-zinc-800 bg-zinc-900/40 px-6 py-2">
          <div className="flex flex-wrap gap-2">
            {REPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReportType(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeReportType === tab.id
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-950/40"
                      : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
          {activeReportType === "sales" && salesData && <SalesReportView data={salesData} />}
          {activeReportType === "financial" && financialData && (
            <FinancialReportView data={financialData} />
          )}

          {activeReportType === "crm" && crmData && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 font-sans">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
                Resumo Executivo do Pipeline CRM ({crmData.period})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold">Valor Total em Propostas</span>
                  <p className="text-xl font-black text-white mt-1">
                    {Number(crmData.pipeline_total_value).toLocaleString("pt-MZ")} MZN
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold">Valor Ponderado (Probabilidade)</span>
                  <p className="text-xl font-black text-amber-400 mt-1">
                    {Number(crmData.weighted_pipeline_value).toLocaleString("pt-MZ")} MZN
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold">Taxa de Sucesso (Win Rate)</span>
                  <p className="text-xl font-black text-emerald-400 mt-1">
                    {crmData.win_rate_percentage}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeReportType === "projects" && projectsData && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 font-sans">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
                Desempenho Financeiro de Obras & Contratos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold">Orçamento Contratado</span>
                  <p className="text-xl font-black text-white mt-1">
                    {Number(projectsData.total_budget_contracted).toLocaleString("pt-MZ")} MZN
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold">Custos Reais de Execução</span>
                  <p className="text-xl font-black text-red-400 mt-1">
                    {Number(projectsData.total_actual_expenses).toLocaleString("pt-MZ")} MZN
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold">Margem de Lucro Global</span>
                  <p className="text-xl font-black text-emerald-400 mt-1">
                    {Number(projectsData.overall_profit).toLocaleString("pt-MZ")} MZN
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold">Avanço Físico Médio</span>
                  <p className="text-xl font-black text-blue-400 mt-1">
                    {projectsData.average_progress_percentage}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeReportType === "hr" && hrData && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 font-sans">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
                Demonstrativo de Recursos Humanos & Encargos INSS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold">Massa Salarial</span>
                  <p className="text-xl font-black text-white mt-1">
                    {Number(hrData.total_gross_payroll).toLocaleString("pt-MZ")} MZN
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold">Guia Total INSS (7%)</span>
                  <p className="text-xl font-black text-purple-400 mt-1">
                    {Number(hrData.total_inss_guia).toLocaleString("pt-MZ")} MZN
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold">Retenção IRPS</span>
                  <p className="text-xl font-black text-amber-400 mt-1">
                    {Number(hrData.total_irps_retained).toLocaleString("pt-MZ")} MZN
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold">Taxa de Assiduidade</span>
                  <p className="text-xl font-black text-emerald-400 mt-1">
                    {hrData.attendance_rate_percentage}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
