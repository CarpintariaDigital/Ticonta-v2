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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-950/50">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Takeaway & Encomendas para Entrega
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Delivery & Balcão
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Gestão de pedidos para viagem, despacho de estafetas e rastreamento ao vivo
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Pedido Takeaway / Delivery
        </button>
      </div>

      {/* Top Quick Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <span className="text-[11px] text-slate-400 block mb-1">Pedidos de Hoje</span>
          <span className="text-lg md:text-xl font-extrabold text-white">{totalOrdersToday}</span>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <span className="text-[11px] text-slate-400 block mb-1">🛍️ Takeaway (Balcão)</span>
          <span className="text-lg md:text-xl font-extrabold text-indigo-400">{takeawayCount}</span>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <span className="text-[11px] text-slate-400 block mb-1">🛵 Entregas (Delivery)</span>
          <span className="text-lg md:text-xl font-extrabold text-purple-400">{deliveryCount}</span>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <span className="text-[11px] text-slate-400 block mb-1">Faturamento de Hoje</span>
          <span className="text-lg md:text-xl font-extrabold text-emerald-400">
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
