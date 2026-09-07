"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Calendar,
  DollarSign,
  FileCode,
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmployeeRegistry from "@/components/modules/hr/EmployeeRegistry";
import EmployeeForm from "@/components/modules/hr/EmployeeForm";
import PayrollCalculator from "@/components/modules/hr/PayrollCalculator";
import { useHR } from "@/hooks/useHR";
import { CreateEmployeeInput, Employee } from "@/types/hr";
import { Button } from "@/components/ui/button";

export default function HRPage() {
  const {
    employees,
    currentPayroll,
    selectedPeriod,
    isLoading,
    fetchEmployees,
    fetchPayroll,
    setSelectedPeriod,
    createEmployee,
    generatePayroll,
    exportINSSDeclaration,
  } = useHR();

  const [activeTab, setActiveTab] = useState<"payroll" | "employees">("payroll");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.active).length;
  const totalSalaries = employees.reduce((acc, e) => acc + (Number(e.salary) || 0), 0);
  const avgSalary = totalEmployees > 0 ? totalSalaries / totalEmployees : 0;

  const handleCreateEmployee = async (data: CreateEmployeeInput) => {
    await createEmployee(data);
    setShowCreateModal(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FAF8F5] text-zinc-900 flex flex-col font-sans">
        {/* Top Header */}
        <header className="border-b border-zinc-200 bg-white backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Recursos Humanos & Folha INSS</h1>
              <p className="text-xs text-zinc-500">Salários, Deduções Legais e Guia SISSMO Moçambique</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchEmployees();
                fetchPayroll(selectedPeriod);
              }}
              className="border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-800 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Novo Colaborador
            </Button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-zinc-200 bg-zinc-50/40 px-6 py-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("payroll")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "payroll"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-800 border border-zinc-200"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              1. Folha Salarial & INSS ({selectedPeriod})
            </button>

            <button
              onClick={() => setActiveTab("employees")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "employees"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-800 border border-zinc-200"
              }`}
            >
              <Users className="h-4 w-4" />
              2. Quadro de Pessoal ({totalEmployees})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
          {/* Top KPI Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
              <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                Total de Colaboradores
              </span>
              <p className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
                <Users className="h-5 w-5 text-blue-400" />
                {totalEmployees} <span className="text-xs font-normal text-zinc-500">({activeEmployees} ativos)</span>
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
              <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                Massa Salarial Mensal
              </span>
              <p className="text-xl font-black text-white mt-1">
                {totalSalaries.toLocaleString("pt-MZ")}{" "}
                <span className="text-xs font-normal text-zinc-500">MZN</span>
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
              <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">
                Salário Médio
              </span>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {Math.round(avgSalary).toLocaleString("pt-MZ")}{" "}
                <span className="text-xs font-normal text-zinc-500">MZN</span>
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
              <span className="text-[11px] text-purple-400 font-medium uppercase tracking-wider">
                Submissão INSS (Prazo)
              </span>
              <p className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-purple-400" />
                Até dia 10 do mês seguinte
              </p>
            </div>
          </div>

          {/* Active Tab Content */}
          {activeTab === "payroll" ? (
            <PayrollCalculator
              period={selectedPeriod}
              payroll={currentPayroll}
              isLoading={isLoading}
              onPeriodChange={(p) => {
                setSelectedPeriod(p);
              }}
              onGeneratePayroll={async (p) => {
                return generatePayroll(p);
              }}
              onExportXML={async (p) => {
                return exportINSSDeclaration(p);
              }}
            />
          ) : (
            <EmployeeRegistry
              employees={employees}
              onOpenCreateModal={() => setShowCreateModal(true)}
            />
          )}
        </main>

        {/* Modal Novo Funcionário */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white border-b border-zinc-200 pb-3">
                Registar Novo Colaborador
              </h3>
              <EmployeeForm onSubmit={handleCreateEmployee} onCancel={() => setShowCreateModal(false)} />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
