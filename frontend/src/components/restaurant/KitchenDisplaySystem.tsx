"use client";

import React, { useState } from "react";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Maximize2,
  Minimize2,
  Volume2,
  Wifi,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { KitchenDisplayItem, ItemPrepStatus } from "@/types/restaurant";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface KitchenDisplaySystemProps {
  items: KitchenDisplayItem[];
  stats: {
    totalPending: number;
    totalPreparing: number;
    totalReady: number;
    averageWaitTime: number;
  };
  wsConnected: boolean;
  onUpdateStatus: (itemId: number, status: ItemPrepStatus) => void;
  onRefresh: () => void;
}

export default function KitchenDisplaySystem({
  items,
  stats,
  wsConnected,
  onUpdateStatus,
  onRefresh,
}: KitchenDisplaySystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  const getUrgencyConfig = (color: "green" | "yellow" | "red", elapsed: number) => {
    switch (color) {
      case "red":
        return {
          cardBg: "bg-red-50 border-red-300 shadow-md",
          headerBg: "bg-red-100 text-red-900",
          timeBadge: "bg-red-600 text-white font-bold animate-pulse",
          label: "URGENTE",
        };
      case "yellow":
        return {
          cardBg: "bg-amber-50 border-amber-300 shadow-xs",
          headerBg: "bg-amber-100 text-amber-900",
          timeBadge: "bg-amber-100 text-amber-800 border border-amber-300",
          label: "NORMAL",
        };
      case "green":
      default:
        return {
          cardBg: "bg-emerald-50/70 border-emerald-200 shadow-xs",
          headerBg: "bg-emerald-100 text-emerald-900",
          timeBadge: "bg-emerald-100 text-emerald-800 border border-emerald-300",
          label: "RECENTE",
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/85 rounded-2xl border border-emerald-900/10 p-4 backdrop-blur shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-emerald-950 font-mono">
                Ecrã de Cozinha (KDS)
              </h2>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-[10px]">
                <span className={`w-2 h-2 rounded-full ${wsConnected ? "bg-emerald-600" : "bg-rose-500"}`} />
                <span className="text-zinc-600 font-mono font-bold">{wsConnected ? "AO VIVO" : "DESCONECTADO"}</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Controle de fila de pedidos em tempo real com código de tempo
            </p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-xs text-amber-800">Pendentes:</span>
            <span className="text-sm font-black text-amber-900 font-mono">{stats.totalPending}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
            <span className="text-xs text-blue-800">Em Preparo:</span>
            <span className="text-sm font-black text-blue-900 font-mono">{stats.totalPreparing}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-xs text-emerald-800">Prontos:</span>
            <span className="text-sm font-black text-emerald-900 font-mono">{stats.totalReady}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 border border-zinc-200 rounded-xl">
            <span className="text-xs text-zinc-600">Média de Espera:</span>
            <span className="text-sm font-bold text-zinc-900 font-mono">{stats.averageWaitTime} min</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 h-9 rounded-xl"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 py-3 overflow-x-auto shrink-0 border-b border-zinc-200">
        {[
          { id: "all", label: "Todos os Pedidos" },
          { id: "mains", label: "Pratos Quentes & Grelha" },
          { id: "appetizers", label: "Entradas & Petiscos" },
          { id: "drinks", label: "Bebidas & Bar" },
          { id: "desserts", label: "Sobremesas" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition-all ${
              selectedCategory === cat.id
                ? "bg-emerald-700 text-white font-bold shadow-xs font-mono"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tickets Queue Grid */}
      <div className="flex-1 overflow-y-auto py-3 pr-1">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 py-16">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3 border border-emerald-200 text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-emerald-950">Cozinha em dia!</h3>
            <p className="text-xs text-zinc-500 max-w-xs mt-1">
              Nenhum pedido pendente ou em preparo no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredItems.map((item) => {
              const urgency = getUrgencyConfig(item.urgency_color, item.elapsed_minutes);

              return (
                <div
                  key={item.order_item_id}
                  className={`flex flex-col justify-between rounded-2xl border p-3.5 transition-all ${urgency.cardBg}`}
                >
                  {/* Ticket Header: Table & Time Elapsed */}
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                      <div>
                        <span className="text-xs font-mono font-bold text-zinc-500">
                          {item.order_number}
                        </span>
                        <div className="text-base font-black text-emerald-950 font-mono">
                          Mesa {item.table_number || "Balcão"}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${urgency.timeBadge}`}>
                          ⏱️ {item.elapsed_minutes} min
                        </span>
                        <div className="text-[10px] text-zinc-500 mt-1 uppercase font-bold font-mono">
                          {urgency.label}
                        </div>
                      </div>
                    </div>

                    {/* Dish Title and Quantity */}
                    <div className="my-3">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl font-black text-amber-700 font-mono">
                          {item.quantity}x
                        </span>
                        <span className="text-base font-bold text-zinc-900 leading-tight">
                          {item.menu_item_name}
                        </span>
                      </div>

                      {/* Special Requests / Allergies in Kitchen Banner */}
                      {item.special_requests && (
                        <div className="mt-2.5 p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-mono font-medium flex items-start gap-1.5">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                          <span>OBS: {item.special_requests}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button: State Progression */}
                  <div className="pt-2 border-t border-zinc-200">
                    {item.preparation_status === "pending" && (
                      <Button
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs h-9 shadow-xs rounded-xl font-mono"
                        onClick={() => onUpdateStatus(item.order_item_id, "preparing")}
                      >
                        <Flame className="w-4 h-4 mr-1.5" />
                        Iniciar Preparo
                      </Button>
                    )}

                    {item.preparation_status === "preparing" && (
                      <Button
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-9 shadow-xs rounded-xl font-mono"
                        onClick={() => onUpdateStatus(item.order_item_id, "ready")}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Marcar como Pronto
                      </Button>
                    )}

                    {item.preparation_status === "ready" && (
                      <Button
                        variant="outline"
                        className="w-full border-zinc-300 hover:bg-zinc-100 text-zinc-800 font-bold text-xs h-9 rounded-xl"
                        onClick={() => onUpdateStatus(item.order_item_id, "served")}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                        Pronto • Entregar à Mesa
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
