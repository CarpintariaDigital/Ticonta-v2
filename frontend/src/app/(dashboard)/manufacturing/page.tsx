"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Factory,
  Calculator,
  Scissors,
  ClipboardList,
  Plus,
  ArrowLeft,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import BudgetCalculator from "@/components/modules/manufacturing/BudgetCalculator";
import CuttingPlanner from "@/components/modules/manufacturing/CuttingPlanner";
import { useManufacturing } from "@/hooks/useManufacturing";
import { WorkOrder, WorkOrderStatus } from "@/types/manufacturing";
import { Button } from "@/components/ui/button";

export default function ManufacturingPage() {
  const {
    workOrders,
    selectedWorkOrder,
    statusFilter,
    isLoading,
    fetchWorkOrders,
    selectWorkOrder,
    setStatusFilter,
    calculateBudget,
    calculateCuttingPlan,
    createWorkOrder,
  } = useManufacturing();

  const [activeTab, setActiveTab] = useState<"orders" | "budget" | "cutting">("orders");

  const totalOrders = workOrders.length;
  const inProgressCount = workOrders.filter((w) => w.status === "in_progress").length;
  const completedCount = workOrders.filter((w) => w.status === "completed").length;
  const totalProductionValue = workOrders.reduce((acc, w) => acc + (Number(w.budget) || 0), 0);

  const getStatusBadge = (st: WorkOrderStatus) => {
    const map: Record<WorkOrderStatus, { label: string; style: string }> = {
      pending: { label: "Pendente", style: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
      in_progress: { label: "Em Fabrico", style: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
      completed: { label: "Concluído", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
      cancelled: { label: "Cancelado", style: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
    };
    const c = map[st] || map.pending;
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${c.style}`}>
        {c.label}
      </span>
    );
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 font-bold">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Fabrico & Marcenaria Industrial</h1>
              <p className="text-xs text-zinc-400">Ordens de Produção, Orçamento por Dentro e Otimização 2D de Corte</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWorkOrders}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-zinc-800 bg-zinc-900/40 px-6 py-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "orders"
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-950/40"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              1. Ordens de Produção (OP) ({totalOrders})
            </button>

            <button
              onClick={() => setActiveTab("budget")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "budget"
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-950/40"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              <Calculator className="h-4 w-4" />
              2. Calculadora de Orçamento
            </button>

            <button
              onClick={() => setActiveTab("cutting")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "cutting"
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-950/40"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              <Scissors className="h-4 w-4" />
              3. Otimizador de Corte 2D (Chapas)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
          {/* Summary KPIs */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">
                Valor Total em Produção
              </span>
              <p className="text-xl font-black text-white mt-1">
                {totalProductionValue.toLocaleString("pt-MZ")}{" "}
                <span className="text-xs font-normal text-zinc-500">MZN</span>
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="text-[11px] text-amber-400 font-medium uppercase tracking-wider">
                Em Fabrico na Oficina
              </span>
              <p className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
                <Clock className="h-5 w-5 text-amber-400" />
                {inProgressCount} ordens
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">
                Peças Concluídas & Entregues
              </span>
              <p className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                {completedCount} ordens
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">
                Total de Registos
              </span>
              <p className="text-xl font-black text-white mt-1">{totalOrders} OPs</p>
            </div>
          </div>

          {/* Active Tab View */}
          {activeTab === "orders" && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs text-zinc-300">
                  <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 font-mono">
                    <tr>
                      <th className="py-3.5 px-4">Nº Ordem (OP)</th>
                      <th className="py-3.5 px-4">Descrição da Peça / Encomenda</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4 text-right">Orçamento (MZN)</th>
                      <th className="py-3.5 px-4 text-right">Custo Real</th>
                      <th className="py-3.5 px-4 text-right">Lucro Previsto</th>
                      <th className="py-3.5 px-4 text-center">Data Início</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {workOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                          Nenhuma ordem de produção registada.
                        </td>
                      </tr>
                    ) : (
                      workOrders.map((w) => (
                        <tr key={w.id} className="hover:bg-zinc-900/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                            {w.order_number}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white line-clamp-1">{w.description}</div>
                            {w.project_name && (
                              <div className="text-[11px] text-zinc-500">Obra: {w.project_name}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">{getStatusBadge(w.status)}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                            {Number(w.budget).toLocaleString("pt-MZ")}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-zinc-400">
                            {Number(w.actual_cost).toLocaleString("pt-MZ")}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                            {Number(w.profit).toLocaleString("pt-MZ")} MZN
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-zinc-400">
                            {w.start_date}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <BudgetCalculator
              onCalculate={calculateBudget}
              onCreateWorkOrder={async (desc, bgt) => {
                await createWorkOrder({
                  description: desc,
                  budget: bgt,
                  materials: [],
                });
              }}
            />
          )}

          {activeTab === "cutting" && <CuttingPlanner onCalculate={calculateCuttingPlan} />}
        </main>
      </div>
    </ProtectedRoute>
  );
}
