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
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
              Módulo Oficina & Garagem
            </Badge>
            <span className="text-xs text-zinc-400 font-mono">Manutenção • Bate-chapa • OBD-II • Estufa • Tuning</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Wrench className="h-7 w-7 text-emerald-400" />
            Gestão de Serviços Automóvel
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Controlo operacional de boxes, ordens de serviço com checklist 360º, diagnóstico eletrónico, estufa de pintura e faturação com IVA.
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
            className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Button
            size="sm"
            onClick={() => setIsOrderModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Nova Ordem de Serviço (OS)
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
          <span className="text-[11px] font-medium uppercase text-zinc-400 block">Viaturas em Box</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">
            {stats?.in_boxes_count || serviceOrders.filter((o) => o.status === "in_progress").length}
          </p>
          <span className="text-[10px] text-zinc-500">Trabalhos em curso</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
          <span className="text-[11px] font-medium uppercase text-zinc-400 block">Estufa de Pintura</span>
          <p className="text-2xl font-black text-rose-400 font-mono mt-1">
            {stats?.in_paint_booth_count || serviceOrders.filter((o) => o.status === "paint_booth").length}
          </p>
          <span className="text-[10px] text-zinc-500">Cabine & Secagem</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
          <span className="text-[11px] font-medium uppercase text-zinc-400 block">Diagnósticos OBD</span>
          <p className="text-2xl font-black text-purple-400 font-mono mt-1">
            {stats?.in_diagnosis_count || serviceOrders.filter((o) => o.service_type === "diagnosis").length}
          </p>
          <span className="text-[10px] text-zinc-500">Eletrónica & Sensores</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
          <span className="text-[11px] font-medium uppercase text-zinc-400 block">Projetos Tuning</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {stats?.in_tuning_count || serviceOrders.filter((o) => o.service_type === "tuning").length}
          </p>
          <span className="text-[10px] text-zinc-500">Stage 1/2 & Escape</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
          <span className="text-[11px] font-medium uppercase text-zinc-400 block">Viaturas Registadas</span>
          <p className="text-2xl font-black text-white font-mono mt-1">
            {stats?.total_vehicles_registered || vehicles.length}
          </p>
          <span className="text-[10px] text-zinc-500">Histórico no ERP</span>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
          <span className="text-[11px] font-medium uppercase text-emerald-400 block font-semibold">
            Faturação Estimada
          </span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {Number(stats?.estimated_revenue_mzn || 0).toLocaleString("pt-MZ")} <span className="text-xs">MT</span>
          </p>
          <span className="text-[10px] text-emerald-300">OS ativas com IVA</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar matrícula, viatura, OS..."
              className="bg-zinc-950 border-zinc-800 pl-9 text-xs text-white"
            />
          </div>

          <select
            value={filterServiceType}
            onChange={(e) => setFilterServiceType(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300"
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
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Quadro de Boxes (Kanban)
          </button>

          <button
            onClick={() => setActiveTab("vehicles")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "vehicles"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                : "text-zinc-400 hover:text-white"
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
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Car className="h-4 w-4 text-emerald-400" />
              Viaturas Cadastradas no TiConta ERP
            </h3>
            <span className="text-xs text-zinc-400">{vehicles.length} viaturas registadas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-xs">
                    {v.license_plate}
                  </span>
                  <Badge className="bg-zinc-900 text-zinc-400 text-[10px] uppercase">
                    {v.fuel_type}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">
                    {v.make} {v.model}
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {v.year || "Ano N/D"} • {v.mileage_km?.toLocaleString() || 0} KM • {v.color || "Cor N/D"}
                  </p>
                </div>

                {v.engine_size && (
                  <p className="text-[11px] text-zinc-500">Motorização: {v.engine_size}</p>
                )}

                <div className="pt-2 border-t border-zinc-900 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsOrderModalOpen(true)}
                    className="border-zinc-800 text-[11px] h-7"
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
