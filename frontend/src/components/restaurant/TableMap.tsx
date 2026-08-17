"use client";

import React, { useState } from "react";
import {
  Users,
  Clock,
  Sparkles,
  CalendarCheck,
  PlusCircle,
  Coffee,
  CheckCircle2,
  AlertCircle,
  UtensilsCrossed,
  MapPin,
  Maximize2,
} from "lucide-react";
import { Table, TableLocation, TableStatus } from "@/types/restaurant";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TableMapProps {
  tables: Table[];
  selectedTable: Table | null;
  filterLocation: TableLocation | "all";
  onSelectTable: (table: Table) => void;
  onOpenReservationModal: (table: Table) => void;
  onCleanTable: (tableId: number) => void;
  onCreateNewTable?: () => void;
  onFilterLocationChange: (loc: TableLocation | "all") => void;
}

export default function TableMap({
  tables,
  selectedTable,
  filterLocation,
  onSelectTable,
  onOpenReservationModal,
  onCleanTable,
  onCreateNewTable,
  onFilterLocationChange,
}: TableMapProps) {
  const [draggedTableId, setDraggedTableId] = useState<number | null>(null);
  const [localTables, setLocalTables] = useState<Table[]>(tables);

  // Sync if prop tables length or status changes
  React.useEffect(() => {
    setLocalTables(tables);
  }, [tables]);

  const filteredTables = localTables.filter((t) => {
    if (filterLocation === "all") return true;
    return t.location === filterLocation;
  });

  // Table summary counts
  const availableCount = tables.filter((t) => t.status === "available").length;
  const occupiedCount = tables.filter((t) => t.status === "occupied").length;
  const reservedCount = tables.filter((t) => t.status === "reserved").length;
  const dirtyCount = tables.filter((t) => t.status === "dirty").length;

  const getStatusColorConfig = (status: TableStatus) => {
    switch (status) {
      case "available":
        return {
          bg: "bg-emerald-950/40 border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-900/30",
          glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          indicator: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
          label: "Disponível",
        };
      case "occupied":
        return {
          bg: "bg-blue-950/40 border-blue-500/60 hover:border-blue-400 hover:bg-blue-900/30",
          glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
          badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          indicator: "bg-blue-500 shadow-[0_0_8px_#3b82f6]",
          label: "Ocupada",
        };
      case "reserved":
        return {
          bg: "bg-amber-950/40 border-amber-500/60 hover:border-amber-400 hover:bg-amber-900/30",
          glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          indicator: "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
          label: "Reservada",
        };
      case "dirty":
        return {
          bg: "bg-zinc-900/70 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/60",
          glow: "group-hover:shadow-[0_0_15px_rgba(113,113,122,0.2)]",
          badge: "bg-zinc-800 text-zinc-400 border-zinc-700",
          indicator: "bg-zinc-500 shadow-[0_0_8px_#71717a]",
          label: "Aguardando Limpeza",
        };
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedTableId(id);
    e.dataTransfer.setData("text/plain", id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedTableId || draggedTableId === targetId) return;

    const currentList = [...localTables];
    const sourceIdx = currentList.findIndex((t) => t.id === draggedTableId);
    const targetIdx = currentList.findIndex((t) => t.id === targetId);

    if (sourceIdx > -1 && targetIdx > -1) {
      const [moved] = currentList.splice(sourceIdx, 1);
      currentList.splice(targetIdx, 0, moved);
      setLocalTables(currentList);
    }
    setDraggedTableId(null);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 rounded-xl border border-zinc-800/80 p-4 backdrop-blur-sm overflow-hidden">
      {/* Top Header: Floor Map Title & Location Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold tracking-tight text-zinc-100">
              Mapa de Salão & Mesas
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Arraste para organizar ou toque para abrir comanda
          </p>
        </div>

        {/* Location Filter Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800">
          {[
            { id: "all", label: "Todas", icon: Maximize2 },
            { id: "indoor", label: "Interior", icon: MapPin },
            { id: "outdoor", label: "Esplanada", icon: Coffee },
            { id: "bar", label: "Bar", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = filterLocation === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterLocationChange(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  active
                    ? "bg-zinc-800 text-white shadow-sm font-semibold border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Legend Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
        <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-xs font-medium text-emerald-400">Disponíveis</span>
          </div>
          <span className="text-xs font-bold text-emerald-300">{availableCount}</span>
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 bg-blue-950/20 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            <span className="text-xs font-medium text-blue-400">Ocupadas</span>
          </div>
          <span className="text-xs font-bold text-blue-300">{occupiedCount}</span>
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 bg-amber-950/20 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
            <span className="text-xs font-medium text-amber-400">Reservadas</span>
          </div>
          <span className="text-xs font-bold text-amber-300">{reservedCount}</span>
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
            <span className="text-xs font-medium text-zinc-400">Limpeza</span>
          </div>
          <span className="text-xs font-bold text-zinc-300">{dirtyCount}</span>
        </div>
      </div>

      {/* Visual Table Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 py-1">
          {filteredTables.map((table) => {
            const config = getStatusColorConfig(table.status);
            const isSelected = selectedTable?.id === table.id;

            return (
              <div
                key={table.id}
                draggable
                onDragStart={(e) => handleDragStart(e, table.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, table.id)}
                onClick={() => onSelectTable(table)}
                className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                  config.bg
                } ${config.glow} ${
                  isSelected
                    ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-950 scale-[1.02] shadow-xl"
                    : "hover:scale-[1.01]"
                }`}
              >
                {/* Header: Table Number & Status Indicator */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${config.indicator}`} />
                    <span className="text-lg font-black tracking-tight text-white">
                      Mesa {table.table_number}
                    </span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${config.badge}`}>
                    {config.label}
                  </Badge>
                </div>

                {/* Body Details: Capacity & Location */}
                <div className="my-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{table.capacity} lugares</span>
                    <span className="text-zinc-600">•</span>
                    <span className="capitalize">{table.location}</span>
                  </div>

                  {/* Reservation details if reserved */}
                  {table.status === "reserved" && table.reserved_for && (
                    <div className="text-[11px] text-amber-300 font-medium truncate pt-1">
                      👤 {table.reserved_for}
                    </div>
                  )}

                  {/* Dirty status helper */}
                  {table.status === "dirty" && (
                    <div className="text-[11px] text-zinc-400 italic pt-1">
                      Aguardando higienização
                    </div>
                  )}
                </div>

                {/* Quick Action Footer */}
                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-1">
                  {table.status === "available" && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTable(table);
                        }}
                      >
                        Abrir Pedido
                      </Button>
                      <button
                        title="Reservar mesa"
                        className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-amber-300 hover:bg-amber-950/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReservationModal(table);
                        }}
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {table.status === "occupied" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 w-full font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTable(table);
                      }}
                    >
                      Ver Comanda
                    </Button>
                  )}

                  {table.status === "reserved" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTable(table);
                      }}
                    >
                      Ocupar Mesa
                    </Button>
                  )}

                  {table.status === "dirty" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px] border-zinc-700 text-zinc-200 hover:bg-emerald-950/40 hover:text-emerald-400 hover:border-emerald-600/50 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCleanTable(table.id);
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      Pronta para Uso
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
