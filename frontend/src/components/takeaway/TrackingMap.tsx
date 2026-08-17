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
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Radar de Entregas em Tempo Real</h3>
            <p className="text-xs text-slate-400">
              {inTransitDeliveries.length} estafeta(s) na rua • {unassignedDeliveries.length} aguardando estafeta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              activeTab === "active" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Na Rua ({inTransitDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              activeTab === "all" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Todas ({pendingDeliveries.length})
          </button>
        </div>
      </div>

      {/* Simulated Live GPS Radar Visual Display */}
      <div className="relative w-full h-48 sm:h-56 bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-4 shadow-inner">
        {/* Radar Concentric Rings */}
        <div className="absolute w-72 h-72 rounded-full border border-purple-500/10 pointer-events-none" />
        <div className="absolute w-48 h-48 rounded-full border border-purple-500/20 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full border border-purple-500/30 pointer-events-none animate-pulse" />

        {/* Central Restaurant Hub Marker */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-indigo-600 border-2 border-white text-white flex items-center justify-center shadow-xl shadow-indigo-900/50">
            <MapPin className="w-5 h-5 fill-white text-indigo-600" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700 shadow">
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
                <div className="w-8 h-8 rounded-full bg-purple-600 border border-purple-400 text-white flex items-center justify-center shadow-lg shadow-purple-950/60">
                  <Bike className="w-4 h-4" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-ping" />
              </div>

              <div className="text-[10px] font-bold text-white bg-slate-900/95 border border-purple-500/40 px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap">
                #{del.order_number} • {del.delivery?.delivery_person_name?.split(" ")[0] || "Estafeta"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned Deliveries Quick Banner */}
      {unassignedDeliveries.length > 0 && (
        <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>
              <strong>{unassignedDeliveries.length} encomenda(s)</strong> pronta(s) aguardando estafeta!
            </span>
          </div>
          <button
            onClick={() => onOpenAssignModal(unassignedDeliveries[0])}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow transition-all"
          >
            Atribuir Agora
          </button>
        </div>
      )}

      {/* Deliveries Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-72">
        {pendingDeliveries.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
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
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                      isInTransit ? "bg-purple-600" : "bg-slate-800"
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white">{order.order_number}</span>
                      <span className="text-slate-300 font-medium truncate">• {order.customer_name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isInTransit
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {isInTransit ? "Na Rua 🛵" : order.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
                      <div className="flex items-center gap-1 truncate max-w-sm">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{order.delivery_address}</span>
                      </div>
                      {riderName && (
                        <div className="text-purple-300 font-medium">
                          Estafeta: {riderName} {riderPhone && `(${riderPhone})`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  {!riderName ? (
                    <button
                      onClick={() => onOpenAssignModal(order)}
                      className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow transition-all"
                    >
                      Atribuir Estafeta
                    </button>
                  ) : isInTransit ? (
                    <button
                      onClick={() => onUpdateDeliveryStatus(order.id, "delivered")}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
                    </button>
                  ) : null}

                  <button
                    onClick={() => onOpenTracking(order)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
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
