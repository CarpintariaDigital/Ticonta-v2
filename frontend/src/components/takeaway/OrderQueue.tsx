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
import { Button } from "@/components/ui/button";

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
    if (order.status === "delivered" || order.status === "picked_up") return "border-zinc-200 bg-zinc-50/50";

    const createdTime = new Date(order.created_at).getTime();
    const elapsedMinutes = Math.floor((Date.now() - createdTime) / 60000);

    if (elapsedMinutes > 15 && order.status !== "ready") {
      return "border-rose-300 bg-rose-50 shadow-xs"; // 🔴 Atrasado
    } else if (elapsedMinutes > 5) {
      return "border-amber-300 bg-amber-50/60"; // 🟡 Em preparo
    }
    return "border-emerald-200 bg-emerald-50/40"; // 🟢 Novo
  };

  return (
    <div className="bg-white/85 border border-emerald-900/10 rounded-2xl p-4 md:p-6 shadow-xs backdrop-blur flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base md:text-lg font-black text-emerald-950 font-mono">Fila de Encomendas & Cozinha</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 font-mono">
              {filteredOrders.length} pedidos
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Acompanhamento em tempo real de pedidos para viagem e delivery
          </p>
        </div>

        <Button
          onClick={onOpenNewOrder}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs font-mono"
        >
          <Plus className="w-4 h-4" /> Novo Pedido
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="my-4 space-y-2.5">
        {/* Type Switcher */}
        <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 self-start">
          {[
            { id: "all", label: "Todos os Tipos" },
            { id: "takeaway", label: "🛍️ Takeaway (Balcão)" },
            { id: "delivery", label: "🛵 Delivery (Entrega)" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => onTypeFilterChange(t.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                typeFilter === t.id
                  ? "bg-white text-emerald-950 shadow-xs border border-zinc-200"
                  : "text-zinc-600 hover:text-zinc-900"
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
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === s.id
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-xs font-mono"
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
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
          <div className="py-16 text-center text-zinc-500">
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
                className={`p-4 rounded-2xl border transition-all duration-200 ${urgencyClass} ${
                  isSelected ? "ring-2 ring-emerald-600 shadow-md" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Code, Type & Customer */}
                  <div
                    onClick={() => onSelectOrder(order)}
                    className="flex items-start gap-3 cursor-pointer flex-1"
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-white text-sm shrink-0 shadow-xs ${
                        order.order_type === "delivery"
                          ? "bg-sky-600"
                          : "bg-emerald-600"
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
                        <span className="font-black text-zinc-900 text-sm md:text-base font-mono">
                          {order.order_number}
                        </span>
                        <span className="text-xs text-zinc-700 font-semibold truncate">
                          • {order.customer_name}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                            order.order_type === "delivery"
                              ? "bg-sky-100 text-sky-800 border border-sky-300"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          }`}
                        >
                          {order.order_type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-zinc-500" /> {order.customer_phone}
                        </span>
                        {order.delivery_address && (
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <MapPin className="w-3 h-3 text-zinc-500" /> {order.delivery_address}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-emerald-800 font-semibold font-mono">
                          <Clock className="w-3 h-3" /> ETA: ~{order.estimated_prep_minutes} min
                        </span>
                      </div>

                      {/* Items Summary Preview */}
                      <div className="mt-2 text-xs text-zinc-800 bg-white p-2 rounded-xl border border-zinc-200">
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
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">
                        Total Pedido
                      </span>
                      <span className="text-base font-black text-emerald-800 block font-mono">
                        {order.total.toLocaleString("pt-MZ")} MT
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                        {order.payment_method} • {order.payment_status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {order.status === "pending" && (
                        <button
                          onClick={() => onAdvanceStatus(order.id, "preparing")}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs font-mono"
                        >
                          Iniciar Preparo
                        </button>
                      )}

                      {order.status === "preparing" && (
                        <button
                          onClick={() => onAdvanceStatus(order.id, "ready")}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs font-mono"
                        >
                          Pronto! 🔔
                        </button>
                      )}

                      {order.status === "ready" && order.order_type === "delivery" && (
                        <button
                          onClick={() => onOpenAssignModal(order)}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 font-mono"
                        >
                          <Bike className="w-3.5 h-3.5" /> Despachar Estafeta
                        </button>
                      )}

                      {order.status === "ready" && order.order_type === "takeaway" && (
                        <button
                          onClick={() => onAdvanceStatus(order.id, "picked_up")}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs font-mono"
                        >
                          Entregar ao Cliente
                        </button>
                      )}

                      {order.status === "in_transit" && (
                        <button
                          onClick={() => onAdvanceStatus(order.id, "delivered")}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs font-mono"
                        >
                          Confirmar Entrega ✅
                        </button>
                      )}

                      <button
                        onClick={() => onOpenTracking(order)}
                        className="px-2.5 py-1 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-300 rounded-xl hover:bg-zinc-100 flex items-center justify-center gap-1"
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
