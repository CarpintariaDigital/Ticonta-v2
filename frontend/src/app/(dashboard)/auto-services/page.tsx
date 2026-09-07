"use client";

import React, { useEffect, useState } from "react";
import {
  Wrench,
  Car,
  Flame,
  Gauge,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Clock,
  TrendingUp,
  FileCheck,
  Zap,
  Palette,
  CheckCircle2,
} from "lucide-react";
import { useAutoServicesStore } from "@/store/auto_services.store";
import { WorkshopKanban } from "@/components/auto/WorkshopKanban";
import { ServiceOrderModal } from "@/components/auto/ServiceOrderModal";
import { DiagnosticScannerModal } from "@/components/auto/DiagnosticScannerModal";
import { PaintTuningCustomizer } from "@/components/auto/PaintTuningCustomizer";
import { ServiceOrderReceipt } from "@/components/auto/ServiceOrderReceipt";
import { ServiceOrder } from "@/types/auto_services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AutoServicesPage() {
  const {
    vehicles,
    serviceOrders,
    stats,
    isLoading,
    fetchVehicles,
    fetchServiceOrders,
    fetchStats,
    createServiceOrder,
    updateOrderStatus,
    convertOrderToSale,
    filterStatus,
    filterServiceType,
    searchQuery,
    setFilterStatus,
    setFilterServiceType,
    setSearchQuery,
  } = useAutoServicesStore();

  const [activeTab, setActiveTab] = useState<"kanban" | "vehicles" | "tuning">("kanban");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [activeDiagnosticOrder, setActiveDiagnosticOrder] = useState<ServiceOrder | null>(null);
  const [activePaintTuningOrder, setActivePaintTuningOrder] = useState<ServiceOrder | null>(null);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<ServiceOrder | null>(null);

  useEffect(() => {
    fetchVehicles();
    fetchServiceOrders();
    fetchStats();
  }, [fetchVehicles, fetchServiceOrders, fetchStats]);

  const handleInvoiceOrder = async (order: ServiceOrder) => {
    try {
      await convertOrderToSale(order.id, "mpesa");
      setActiveReceiptOrder(null);
      fetchServiceOrders();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white/80 backdrop-blur-md p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-semibold">
              Módulo Oficina & Bate-Chapa
            </Badge>
            <span className="text-xs text-zinc-500 font-mono">OBD-II • Dyno • Estufa</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2.5">
            <Wrench className="h-7 w-7 text-emerald-700" />
            Oficina & Serviços Automóveis
          </h1>
          <p className="text-xs text-zinc-600 max-w-xl">
            Gestão completa de boxes mecânicas, diagnóstico eletrónico, cabine de pintura, preparação estética e faturamento integrado com POS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchVehicles();
              fetchServiceOrders();
              fetchStats();
            }}
            className="border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 text-xs h-9 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Button
            size="sm"
            onClick={() => setIsOrderModalOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Nova Ordem de Serviço (OS)
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium uppercase text-zinc-500 block">Viaturas em Box</span>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">
            {stats?.in_boxes_count || serviceOrders.filter((o) => o.status === "in_progress").length}
          </p>
          <span className="text-[10px] text-zinc-400">Trabalhos em curso</span>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium uppercase text-zinc-500 block">Estufa de Pintura</span>
          <p className="text-2xl font-black text-rose-600 font-mono mt-1">
            {stats?.in_paint_booth_count || serviceOrders.filter((o) => o.status === "paint_booth").length}
          </p>
          <span className="text-[10px] text-zinc-400">Cabine & Secagem</span>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium uppercase text-zinc-500 block">Diagnósticos OBD</span>
          <p className="text-2xl font-black text-purple-600 font-mono mt-1">
            {stats?.in_diagnosis_count || serviceOrders.filter((o) => o.service_type === "diagnosis").length}
          </p>
          <span className="text-[10px] text-zinc-400">Eletrónica & Sensores</span>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium uppercase text-zinc-500 block">Projetos Tuning</span>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {stats?.in_tuning_count || serviceOrders.filter((o) => o.service_type === "tuning").length}
          </p>
          <span className="text-[10px] text-zinc-400">Stage 1/2 & Escape</span>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium uppercase text-zinc-500 block">Viaturas Registadas</span>
          <p className="text-2xl font-black text-zinc-900 font-mono mt-1">
            {stats?.total_vehicles_registered || vehicles.length}
          </p>
          <span className="text-[10px] text-zinc-400">Histórico no ERP</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 shadow-xs">
          <span className="text-[11px] font-medium uppercase text-emerald-800 block font-semibold">
            Faturação Estimada
          </span>
          <p className="text-2xl font-black text-emerald-800 font-mono mt-1">
            {Number(stats?.estimated_revenue_mzn || 0).toLocaleString("pt-MZ")} <span className="text-xs">MT</span>
          </p>
          <span className="text-[10px] text-emerald-700">OS ativas com IVA</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-xl border border-emerald-900/10 bg-white/80 backdrop-blur-md p-3 shadow-xs">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar matrícula, viatura, OS..."
              className="bg-white border-zinc-200 pl-9 text-xs text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          <select
            value={filterServiceType}
            onChange={(e) => setFilterServiceType(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 font-medium shadow-xs focus:border-emerald-600 focus:outline-none"
          >
            <option value="all">Todos os Serviços</option>
            <option value="maintenance">Mecânica Geral</option>
            <option value="bodywork_chapa">Bate-Chapa</option>
            <option value="diagnosis">Diagnóstico OBD</option>
            <option value="painting">Pintura Estufa</option>
            <option value="tuning">Tuning & ECU</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "kanban"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            Quadro de Boxes (Kanban)
          </button>

          <button
            onClick={() => setActiveTab("vehicles")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "vehicles"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            Parque de Viaturas ({vehicles.length})
          </button>
        </div>
      </div>

      {/* Main Tab: Kanban Board */}
      {activeTab === "kanban" && (
        <WorkshopKanban
          orders={serviceOrders}
          onSelectOrder={(order) => handleInvoiceOrder(order)}
          onUpdateStatus={(orderId, status) => updateOrderStatus(orderId, status)}
          onOpenDiagnostic={(order) => setActiveDiagnosticOrder(order)}
          onOpenPaintTuning={(order) => setActivePaintTuningOrder(order)}
          onOpenReceipt={(order) => setActiveReceiptOrder(order)}
        />
      )}

      {/* Tab: Lista de Viaturas */}
      {activeTab === "vehicles" && (
        <div className="rounded-2xl border border-emerald-900/10 bg-white/80 backdrop-blur-md p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Car className="h-4 w-4 text-emerald-700" />
              Viaturas Cadastradas no TiConta ERP
            </h3>
            <span className="text-xs text-zinc-500">{vehicles.length} viaturas registadas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 space-y-2 hover:border-emerald-500/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                    {v.license_plate}
                  </span>
                  <Badge className="bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] uppercase font-semibold">
                    {v.fuel_type}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">
                    {v.make} {v.model}
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    {v.year || "Ano N/D"} • {v.mileage_km?.toLocaleString() || 0} KM • {v.color || "Cor N/D"}
                  </p>
                </div>

                {v.engine_size && (
                  <p className="text-[11px] text-zinc-500">Motorização: {v.engine_size}</p>
                )}

                <div className="pt-2 border-t border-zinc-100 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsOrderModalOpen(true)}
                    className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-[11px] h-7 shadow-xs"
                  >
                    + Abrir Nova OS
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modais Operacionais */}
      <ServiceOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        vehicles={vehicles}
        onSubmit={async (data) => {
          await createServiceOrder(data);
        }}
      />

      <DiagnosticScannerModal
        isOpen={Boolean(activeDiagnosticOrder)}
        onClose={() => setActiveDiagnosticOrder(null)}
        order={activeDiagnosticOrder}
      />

      <PaintTuningCustomizer
        isOpen={Boolean(activePaintTuningOrder)}
        onClose={() => setActivePaintTuningOrder(null)}
        order={activePaintTuningOrder}
      />

      <ServiceOrderReceipt
        isOpen={Boolean(activeReceiptOrder)}
        onClose={() => setActiveReceiptOrder(null)}
        order={activeReceiptOrder}
        onInvoicePOS={() => activeReceiptOrder && handleInvoiceOrder(activeReceiptOrder)}
      />
    </div>
  );
}
