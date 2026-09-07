"use client";

import React, { useState } from "react";
import { useTakeaway } from "@/hooks/useTakeaway";
import { OrderQueue } from "@/components/takeaway/OrderQueue";
import { TrackingMap } from "@/components/takeaway/TrackingMap";
import { TakeawayOrderForm } from "@/components/takeaway/TakeawayOrderForm";
import { CustomerTracking } from "@/components/takeaway/CustomerTracking";
import { AssignCourierModal } from "@/components/takeaway/AssignCourierModal";
import { TakeawayOrder } from "@/types/takeaway";
import {
  ShoppingBag,
  Bike,
  Clock,
  TrendingUp,
  DollarSign,
  Plus,
  Compass,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TakeawayPage() {
  const {
    orders,
    selectedOrder,
    pendingDeliveries,
    trackingData,
    stats,
    statusFilter,
    typeFilter,
    isNewOrderModalOpen,
    isAssignModalOpen,
    isTrackingModalOpen,
    orderForAction,
    isLoading,
    setSelectedOrder,
    setStatusFilter,
    setTypeFilter,
    setIsNewOrderModalOpen,
    setIsAssignModalOpen,
    setIsTrackingModalOpen,
    setOrderForAction,
    createTakeawayOrder,
    updateOrderStatus,
    assignDelivery,
    updateDeliveryStatus,
    trackOrder,
  } = useTakeaway();

  const handleOpenAssignModal = (order: TakeawayOrder) => {
    setOrderForAction(order);
    setIsAssignModalOpen(true);
  };

  const handleOpenTracking = async (order: TakeawayOrder) => {
    await trackOrder(String(order.id));
  };

  // KPIs
  const totalOrdersToday = stats?.total_orders_today || orders.length;
  const takeawayCount = stats?.takeaway_count || orders.filter((o) => o.order_type === "takeaway").length;
  const deliveryCount = stats?.delivery_count || orders.filter((o) => o.order_type === "delivery").length;
  const totalRevenue = stats?.total_revenue_today || orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="w-full space-y-6 text-zinc-900">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 shadow-xs">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-emerald-950 flex items-center gap-2 font-mono">
              Takeaway & Encomendas para Entrega
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300 font-mono">
                Delivery & Balcão
              </span>
            </h1>
            <p className="text-xs text-zinc-500">
              Gestão de pedidos para viagem, despacho de estafetas e rastreamento ao vivo
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs font-mono"
        >
          <Plus className="w-4 h-4" /> Novo Pedido Takeaway / Delivery
        </Button>
      </div>

      {/* Top Quick Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 bg-white/80 border border-emerald-900/10 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] text-zinc-500 font-medium block mb-1">Pedidos de Hoje</span>
          <span className="text-lg md:text-2xl font-black text-emerald-950 font-mono">{totalOrdersToday}</span>
        </div>

        <div className="p-4 bg-white/80 border border-emerald-900/10 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] text-zinc-500 font-medium block mb-1">🛍️ Takeaway (Balcão)</span>
          <span className="text-lg md:text-2xl font-black text-indigo-700 font-mono">{takeawayCount}</span>
        </div>

        <div className="p-4 bg-white/80 border border-emerald-900/10 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] text-zinc-500 font-medium block mb-1">🛵 Entregas (Delivery)</span>
          <span className="text-lg md:text-2xl font-black text-sky-700 font-mono">{deliveryCount}</span>
        </div>

        <div className="p-4 bg-white/80 border border-emerald-900/10 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] text-zinc-500 font-medium block mb-1">Faturamento de Hoje</span>
          <span className="text-lg md:text-2xl font-black text-emerald-800 font-mono">
            {totalRevenue.toLocaleString("pt-MZ")} MT
          </span>
        </div>
      </div>

      {/* Main 2-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Order Queue (Left) */}
        <div className="lg:col-span-7 h-full">
          <OrderQueue
            orders={orders}
            selectedOrder={selectedOrder}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            onSelectOrder={setSelectedOrder}
            onStatusFilterChange={setStatusFilter}
            onTypeFilterChange={setTypeFilter}
            onAdvanceStatus={updateOrderStatus}
            onOpenAssignModal={handleOpenAssignModal}
            onOpenTracking={handleOpenTracking}
            onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
          />
        </div>

        {/* Column 2: Live Delivery Tracking Radar & Courier Management (Right) */}
        <div className="lg:col-span-5 h-full">
          <TrackingMap
            pendingDeliveries={pendingDeliveries}
            onUpdateDeliveryStatus={updateDeliveryStatus}
            onOpenTracking={handleOpenTracking}
            onOpenAssignModal={handleOpenAssignModal}
          />
        </div>
      </div>

      {/* MODAL 1: New Takeaway / Delivery Order Form */}
      {isNewOrderModalOpen && (
        <TakeawayOrderForm
          isLoading={isLoading}
          onClose={() => setIsNewOrderModalOpen(false)}
          onSubmit={createTakeawayOrder}
        />
      )}

      {/* MODAL 2: Assign Courier Modal */}
      {isAssignModalOpen && orderForAction && (
        <AssignCourierModal
          order={orderForAction}
          isLoading={isLoading}
          onClose={() => {
            setIsAssignModalOpen(false);
            setOrderForAction(null);
          }}
          onAssign={assignDelivery}
        />
      )}

      {/* MODAL 3: Real-Time Customer Tracking Modal */}
      {isTrackingModalOpen && trackingData && (
        <CustomerTracking
          tracking={trackingData}
          onClose={() => setIsTrackingModalOpen(false)}
        />
      )}
    </div>
  );
}
