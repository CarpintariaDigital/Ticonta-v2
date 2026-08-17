"use client";

import React, { useMemo } from "react";
import { TakeawayOrder, TakeawayStatus } from "@/types/takeaway";
import {
  ShoppingBag,
  Bike,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  User,
  Phone,
  MapPin,
  Send,
  Eye,
  Plus,
} from "lucide-react";

interface OrderQueueProps {
  orders: TakeawayOrder[];
  selectedOrder: TakeawayOrder | null;
  statusFilter: string;
  typeFilter: "all" | "takeaway" | "delivery";
  onSelectOrder: (order: TakeawayOrder) => void;
  onStatusFilterChange: (filter: string) => void;
  onTypeFilterChange: (type: "all" | "takeaway" | "delivery") => void;
  onAdvanceStatus: (orderId: number, nextStatus: TakeawayStatus) => void;
  onOpenAssignModal: (order: TakeawayOrder) => void;
  onOpenTracking: (order: TakeawayOrder) => void;
  onOpenNewOrder: () => void;
}

export const OrderQueue: React.FC<OrderQueueProps> = ({
  orders,
  selectedOrder,
  statusFilter,
  typeFilter,
  onSelectOrder,
  onStatusFilterChange,
  onTypeFilterChange,
  onAdvanceStatus,
  onOpenAssignModal,
  onOpenTracking,
  onOpenNewOrder,
}) => {
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (typeFilter !== "all" && o.order_type !== typeFilter) return false;
      return true;
    });
  }, [orders, statusFilter, typeFilter]);

  const getUrgencyColor = (order: TakeawayOrder) => {
    if (order.status === "delivered" || order.status === "picked_up") return "border-slate-800 bg-slate-950/40";

    const createdTime = new Date(order.created_at).getTime();
    const elapsedMinutes = Math.floor((Date.now() - createdTime) / 60000);

    if (elapsedMinutes > 15 && order.status !== "ready") {
      return "border-rose-500/50 bg-rose-950/20 shadow-rose-950/30 shadow-lg"; // 🔴 Atrasado
    } else if (elapsedMinutes > 5) {
      return "border-amber-500/40 bg-amber-950/20"; // 🟡 Em preparo
    }
    return "border-emerald-500/40 bg-emerald-950/15"; // 🟢 Novo
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base md:text-lg font-bold text-white">Fila de Encomendas & Cozinha</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
              {filteredOrders.length} pedidos
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Acompanhamento em tempo real de pedidos para viagem e delivery
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/40 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Pedido
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="my-4 space-y-2.5">
        {/* Type Switcher */}
        <div className="flex bg-slate-950/70 p-1 rounded-xl border border-slate-800 self-start">
          {[
            { id: "all", label: "Todos os Tipos" },
            { id: "takeaway", label: "🛍️ Takeaway (Balcão)" },
            { id: "delivery", label: "🛵 Delivery (Entrega)" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => onTypeFilterChange(t.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === t.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "Todos" },
            { id: "pending", label: "Pendente" },
            { id: "preparing", label: "Em Preparo" },
            { id: "ready", label: "Pronto" },
            { id: "in_transit", label: "A Caminho" },
            { id: "delivered", label: "Concluído" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => onStatusFilterChange(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                statusFilter === s.id
                  ? "bg-slate-800 text-white border-slate-600 shadow"
                  : "bg-slate-950/40 text-slate-400 border-slate-800/80 hover:text-slate-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[560px]">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Nenhum pedido encontrado nesta fila.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const urgencyClass = getUrgencyColor(order);
            const isSelected = selectedOrder?.id === order.id;

            return (
              <div
                key={order.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${urgencyClass} ${
                  isSelected ? "ring-2 ring-indigo-500" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Code, Type & Customer */}
                  <div
                    onClick={() => onSelectOrder(order)}
                    className="flex items-start gap-3 cursor-pointer flex-1"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-white text-sm shrink-0 shadow-md ${
                        order.order_type === "delivery"
                          ? "bg-gradient-to-br from-purple-600 to-indigo-700"
                          : "bg-gradient-to-br from-emerald-600 to-teal-700"
                      }`}
                    >
                      {order.order_type === "delivery" ? (
                        <Bike className="w-5 h-5" />
                      ) : (
                        <ShoppingBag className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm md:text-base">
                          {order.order_number}
                        </span>
                        <span className="text-xs text-slate-300 font-medium truncate">
                          • {order.customer_name}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.order_type === "delivery"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {order.order_type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" /> {order.customer_phone}
                        </span>
                        {order.delivery_address && (
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <MapPin className="w-3 h-3 text-slate-500" /> {order.delivery_address}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-indigo-300 font-semibold">
                          <Clock className="w-3 h-3" /> ETA: ~{order.estimated_prep_minutes} min
                        </span>
                      </div>

                      {/* Items Summary Preview */}
                      <div className="mt-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                        {order.items.map((i, idx) => (
                          <span key={i.id} className="inline-block mr-2 font-mono text-[11px]">
                            {i.quantity}x {i.item_name}
                            {idx < order.items.length - 1 ? "," : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Actions & Totals */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Total Pedido
                      </span>
                      <span className="text-base font-extrabold text-emerald-400 block">
                        {order.total.toLocaleString("pt-MZ")} MT
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        {order.payment_method} • {order.payment_status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {order.status === "pending" && (
                        <button
                          onClick={() => onAdvanceStatus(order.id, "preparing")}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow active:scale-95 transition-all"
                        >
                          Iniciar Preparo
                        </button>
                      )}

                      {order.status === "preparing" && (
                        <button
                          onClick={() => onAdvanceStatus(order.id, "ready")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow active:scale-95 transition-all"
                        >
                          Pronto! 🛎️
                        </button>
                      )}

                      {order.status === "ready" && order.order_type === "delivery" && (
                        <button
                          onClick={() => onOpenAssignModal(order)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow active:scale-95 transition-all flex items-center gap-1"
                        >
                          <Bike className="w-3.5 h-3.5" /> Enviar Estafeta
                        </button>
                      )}

                      {order.status === "ready" && order.order_type === "takeaway" && (
                        <button
                          onClick={() => onAdvanceStatus(order.id, "picked_up")}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow active:scale-95 transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Entregar ao Cliente
                        </button>
                      )}

                      {order.status === "in_transit" && (
                        <button
                          onClick={() => onAdvanceStatus(order.id, "delivered")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow active:scale-95 transition-all"
                        >
                          Confirmar Entrega ✅
                        </button>
                      )}

                      <button
                        onClick={() => onOpenTracking(order)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Rastreio
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
