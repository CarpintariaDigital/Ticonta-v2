"use client";

import React, { useState, useEffect } from "react";
import { TakeawayOrder, DeliveryStatus } from "@/types/takeaway";
import {
  Bike,
  Navigation,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrackingMapProps {
  pendingDeliveries: TakeawayOrder[];
  onUpdateDeliveryStatus: (orderId: number, status: DeliveryStatus, notes?: string) => Promise<any>;
  onOpenTracking: (order: TakeawayOrder) => void;
  onOpenAssignModal: (order: TakeawayOrder) => void;
}

export const TrackingMap: React.FC<TrackingMapProps> = ({
  pendingDeliveries,
  onUpdateDeliveryStatus,
  onOpenTracking,
  onOpenAssignModal,
}) => {
  const [activeTab, setActiveTab] = useState<"active" | "all">("active");

  const inTransitDeliveries = pendingDeliveries.filter(
    (d) => d.status === "in_transit" || d.delivery?.delivery_status === "in_transit"
  );
  const unassignedDeliveries = pendingDeliveries.filter(
    (d) => d.status === "ready" && !d.delivery?.delivery_person_name
  );

  return (
    <div className="bg-white/85 border border-emerald-900/10 rounded-2xl p-4 md:p-6 shadow-xs backdrop-blur flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-emerald-950 font-mono">Radar de Estafetas & GPS</h3>
            <span className="text-xs text-zinc-500">Despacho ativo e monitoramento</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              activeTab === "active" ? "bg-white text-emerald-950 shadow-xs border border-zinc-200" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Na Rua ({inTransitDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              activeTab === "all" ? "bg-white text-emerald-950 shadow-xs border border-zinc-200" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Todas ({pendingDeliveries.length})
          </button>
        </div>
      </div>

      {/* Simulated Live GPS Radar Visual Display */}
      <div className="relative w-full h-48 sm:h-56 bg-zinc-50 rounded-2xl border border-zinc-200 overflow-hidden flex items-center justify-center p-4 shadow-inner">
        {/* Radar Concentric Rings */}
        <div className="absolute w-72 h-72 rounded-full border border-emerald-500/20 pointer-events-none" />
        <div className="absolute w-48 h-48 rounded-full border border-emerald-500/30 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full border border-emerald-500/40 pointer-events-none animate-pulse" />

        {/* Central Restaurant Hub Marker */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-lg">
            <MapPin className="w-5 h-5 fill-white text-emerald-600" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 bg-zinc-800/90 px-2 py-0.5 rounded-lg border border-zinc-200 shadow font-mono">
            Restaurante / Central TiConta
          </span>
        </div>

        {/* Active In-Transit Couriers Simulated Nodes */}
        {inTransitDeliveries.map((del, idx) => {
          const positions = [
            { top: "25%", left: "75%" },
            { top: "70%", left: "30%" },
            { top: "30%", left: "20%" },
            { top: "65%", left: "80%" },
          ];
          const pos = positions[idx % positions.length];

          return (
            <div
              key={del.id}
              style={{ top: pos.top, left: pos.left }}
              onClick={() => onOpenTracking(del)}
              className="absolute z-20 cursor-pointer group flex flex-col items-center transition-all hover:scale-110"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-sky-600 border border-sky-300 text-white flex items-center justify-center shadow-lg">
                  <Bike className="w-4 h-4" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-zinc-900 rounded-full animate-ping" />
              </div>

              <div className="text-[10px] font-bold text-white bg-zinc-50/95 border border-sky-500/40 px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap font-mono">
                #{del.order_number} • {del.delivery?.delivery_person_name?.split(" ")[0] || "Estafeta"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned Deliveries Quick Banner */}
      {unassignedDeliveries.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>{unassignedDeliveries.length} encomenda(s)</strong> pronta(s) aguardando estafeta!
            </span>
          </div>
          <button
            onClick={() => onOpenAssignModal(unassignedDeliveries[0])}
            className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-xs transition-all font-mono"
          >
            Atribuir Agora
          </button>
        </div>
      )}

      {/* Deliveries Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-72">
        {pendingDeliveries.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            Nenhuma entrega ativa no momento.
          </div>
        ) : (
          pendingDeliveries.map((order) => {
            const isInTransit = order.status === "in_transit";
            const riderName = order.delivery?.delivery_person_name;
            const riderPhone = order.delivery?.delivery_person_phone;

            return (
              <div
                key={order.id}
                className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs ${
                      isInTransit ? "bg-sky-600" : "bg-zinc-400"
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-zinc-900 font-mono">{order.order_number}</span>
                      <span className="text-zinc-700 font-semibold truncate">• {order.customer_name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                          isInTransit
                            ? "bg-sky-100 text-sky-800 border border-sky-300"
                            : "bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        {isInTransit ? "Na Rua 🛵" : order.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-500 mt-1 space-y-0.5">
                      <div className="flex items-center gap-1 truncate max-w-sm">
                        <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span className="truncate">{order.delivery_address}</span>
                      </div>
                      {riderName && (
                        <div className="text-sky-800 font-bold">
                          Estafeta: {riderName} {riderPhone && `(${riderPhone})`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200">
                  {!riderName ? (
                    <button
                      onClick={() => onOpenAssignModal(order)}
                      className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs transition-all font-mono"
                    >
                      Atribuir Estafeta
                    </button>
                  ) : isInTransit ? (
                    <button
                      onClick={() => onUpdateDeliveryStatus(order.id, "delivered")}
                      className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 font-mono"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
                    </button>
                  ) : null}

                  <button
                    onClick={() => onOpenTracking(order)}
                    className="p-1.5 bg-white hover:bg-zinc-100 text-zinc-700 rounded-xl border border-zinc-300 shadow-xs"
                    title="Ver Rastreio"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
