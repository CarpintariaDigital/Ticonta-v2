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

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-700 border border-zinc-200 uppercase font-mono">
            Pendente
          </span>
        );
      case "in_progress":
        return (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300 uppercase font-mono">
            Em Fabrico
          </span>
        );
      case "completed":
        return (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300 uppercase font-mono">
            Concluído
          </span>
        );
      case "cancelled":
        return (
          <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-300 uppercase font-mono">
            Cancelado
          </span>
        );
    }
  };

  const totalProductionValue = workOrders.reduce((acc, w) => acc + Number(w.budget || 0), 0);
  const inProgressCount = workOrders.filter((w) => w.status === "in_progress").length;
  const completedCount = workOrders.filter((w) => w.status === "completed").length;
  const totalOrders = workOrders.length;

  return (
    <div className="w-full space-y-6 text-zinc-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
            <Factory className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-emerald-950 font-mono flex items-center gap-2">
              Fabrico & Marcenaria Industrial
            </h1>
            <p className="text-xs text-zinc-500">
              Ordens de Produção, Orçamento por Dentro e Otimização 2D de Corte
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWorkOrders}
            className="border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 text-xs rounded-xl shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border border-zinc-200 bg-zinc-100 p-1 rounded-2xl">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "orders"
                ? "bg-amber-700 text-white shadow-xs font-mono"
                : "bg-transparent text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            1. Ordens de Produção (OP) ({totalOrders})
          </button>

          <button
            onClick={() => setActiveTab("budget")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "budget"
                ? "bg-amber-700 text-white shadow-xs font-mono"
                : "bg-transparent text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Calculator className="h-4 w-4" />
            2. Calculadora de Orçamento
          </button>

          <button
            onClick={() => setActiveTab("cutting")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "cutting"
                ? "bg-amber-700 text-white shadow-xs font-mono"
                : "bg-transparent text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Scissors className="h-4 w-4" />
            3. Otimizador de Corte 2D (Chapas)
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 shadow-xs">
          <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
            Valor Total em Produção
          </span>
          <p className="text-xl font-black text-emerald-950 font-mono mt-1">
            {totalProductionValue.toLocaleString("pt-MZ")}{" "}
            <span className="text-xs font-normal text-zinc-500">MZN</span>
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 shadow-xs">
          <span className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider">
            Em Fabrico na Oficina
          </span>
          <p className="text-xl font-black text-amber-800 font-mono mt-1 flex items-center gap-1.5">
            <Clock className="h-5 w-5 text-amber-600" />
            {inProgressCount} ordens
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 shadow-xs">
          <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">
            Peças Concluídas & Entregues
          </span>
          <p className="text-xl font-black text-emerald-800 font-mono mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            {completedCount} ordens
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 shadow-xs">
          <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
            Total de Registos
          </span>
          <p className="text-xl font-black text-zinc-900 font-mono mt-1">{totalOrders} OPs</p>
        </div>
      </div>

      {/* Active Tab View */}
      {activeTab === "orders" && (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs text-zinc-800">
              <thead className="bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-600 border-b border-zinc-200 font-mono font-bold">
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
              <tbody className="divide-y divide-zinc-100">
                {workOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400 text-xs">
                      Nenhuma ordem de produção registada.
                    </td>
                  </tr>
                ) : (
                  workOrders.map((w) => (
                    <tr key={w.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                        {w.order_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900 line-clamp-1">{w.description}</div>
                        {w.project_name && (
                          <div className="text-[11px] text-zinc-500">Obra: {w.project_name}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(w.status)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-zinc-900">
                        {Number(w.budget).toLocaleString("pt-MZ")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-zinc-500">
                        {Number(w.actual_cost).toLocaleString("pt-MZ")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {Number(w.profit).toLocaleString("pt-MZ")} MZN
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-zinc-500">
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
    </div>
  );
}
