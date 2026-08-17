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
          cardBg: "bg-red-950/40 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse",
          headerBg: "bg-red-900/60 text-red-100",
          timeBadge: "bg-red-500 text-white font-bold animate-bounce",
          label: "URGENTE",
        };
      case "yellow":
        return {
          cardBg: "bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
          headerBg: "bg-amber-900/50 text-amber-100",
          timeBadge: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
          label: "NORMAL",
        };
      case "green":
      default:
        return {
          cardBg: "bg-emerald-950/20 border-emerald-500/40",
          headerBg: "bg-emerald-900/40 text-emerald-100",
          timeBadge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
          label: "NOVO",
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-xl border border-zinc-800 p-4 text-zinc-100 select-none overflow-hidden font-sans">
      {/* Top Header with KDS Stats & Live Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white">
                KDS • Monitor de Cozinha
              </h2>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px]">
                <span className={`w-2 h-2 rounded-full ${wsConnected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500"}`} />
                <span className="text-zinc-400 font-mono">{wsConnected ? "AO VIVO" : "DESCONECTADO"}</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400">
              Controle de fila de pedidos em tempo real com código de tempo
            </p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
            <span className="text-xs text-zinc-400">Pendentes:</span>
            <span className="text-sm font-bold text-amber-400">{stats.totalPending}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
            <span className="text-xs text-zinc-400">Em Preparo:</span>
            <span className="text-sm font-bold text-blue-400">{stats.totalPreparing}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
            <span className="text-xs text-zinc-400">Prontos:</span>
            <span className="text-sm font-bold text-emerald-400">{stats.totalReady}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
            <span className="text-xs text-zinc-400">Média de Espera:</span>
            <span className="text-sm font-bold text-zinc-200">{stats.averageWaitTime} min</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="border-zinc-700 text-zinc-300 hover:text-white h-9"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 py-3 overflow-x-auto shrink-0 border-b border-zinc-800/60">
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
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
              selectedCategory === cat.id
                ? "bg-zinc-800 text-white font-semibold border border-zinc-700"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
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
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-zinc-300">Cozinha em dia!</h3>
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
                  className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all ${urgency.cardBg}`}
                >
                  {/* Ticket Header: Table & Time Elapsed */}
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                      <div>
                        <span className="text-xs font-mono font-bold text-zinc-400">
                          {item.order_number}
                        </span>
                        <div className="text-base font-black text-white">
                          Mesa {item.table_number || "Balcão"}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${urgency.timeBadge}`}>
                          ⏱️ {item.elapsed_minutes} min
                        </span>
                        <div className="text-[10px] text-zinc-400 mt-1 uppercase font-semibold">
                          {urgency.label}
                        </div>
                      </div>
                    </div>

                    {/* Dish Title and Quantity */}
                    <div className="my-3">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl font-black text-amber-400 font-mono">
                          {item.quantity}x
                        </span>
                        <span className="text-base font-bold text-zinc-100 leading-tight">
                          {item.menu_item_name}
                        </span>
                      </div>

                      {/* Special Requests / Allergies in Kitchen Banner */}
                      {item.special_requests && (
                        <div className="mt-2.5 p-2 rounded-lg bg-black/50 border border-amber-500/40 text-amber-300 text-xs font-mono font-medium flex items-start gap-1.5">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                          <span>OBS: {item.special_requests}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button: State Progression */}
                  <div className="pt-2 border-t border-zinc-800/60">
                    {item.preparation_status === "pending" && (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 shadow-md shadow-blue-950/40"
                        onClick={() => onUpdateStatus(item.order_item_id, "preparing")}
                      >
                        <Flame className="w-4 h-4 mr-1.5" />
                        Iniciar Preparo
                      </Button>
                    )}

                    {item.preparation_status === "preparing" && (
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 shadow-md shadow-emerald-950/40"
                        onClick={() => onUpdateStatus(item.order_item_id, "ready")}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Marcar como Pronto
                      </Button>
                    )}

                    {item.preparation_status === "ready" && (
                      <Button
                        variant="outline"
                        className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-medium text-xs h-9"
                        onClick={() => onUpdateStatus(item.order_item_id, "served")}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
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
