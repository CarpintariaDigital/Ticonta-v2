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
          bg: "bg-emerald-50/70 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100/70",
          glow: "group-hover:shadow-md",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
          indicator: "bg-emerald-600 shadow-[0_0_8px_#10b981]",
          label: "Disponível",
          titleColor: "text-emerald-950",
          btnColor: "text-emerald-800 hover:text-emerald-950 hover:bg-emerald-200/60",
        };
      case "occupied":
        return {
          bg: "bg-blue-50/70 border-blue-300 hover:border-blue-500 hover:bg-blue-100/70",
          glow: "group-hover:shadow-md",
          badge: "bg-blue-100 text-blue-800 border-blue-300",
          indicator: "bg-blue-600 shadow-[0_0_8px_#3b82f6]",
          label: "Ocupada",
          titleColor: "text-blue-950",
          btnColor: "text-blue-800 hover:text-blue-950 hover:bg-blue-200/60",
        };
      case "reserved":
        return {
          bg: "bg-amber-50/70 border-amber-300 hover:border-amber-500 hover:bg-amber-100/70",
          glow: "group-hover:shadow-md",
          badge: "bg-amber-100 text-amber-800 border-amber-300",
          indicator: "bg-amber-600 shadow-[0_0_8px_#f59e0b]",
          label: "Reservada",
          titleColor: "text-amber-950",
          btnColor: "text-amber-800 hover:text-amber-950 hover:bg-amber-200/60",
        };
      case "dirty":
        return {
          bg: "bg-zinc-100/80 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-200/60",
          glow: "group-hover:shadow-md",
          badge: "bg-zinc-200 text-zinc-700 border-zinc-300",
          indicator: "bg-zinc-500 shadow-[0_0_8px_#71717a]",
          label: "Aguardando Limpeza",
          titleColor: "text-zinc-900",
          btnColor: "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-300/60",
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
    <div className="flex flex-col h-full bg-white/85 rounded-2xl border border-emerald-900/10 p-4 backdrop-blur shadow-xs overflow-hidden">
      {/* Top Header: Floor Map Title & Location Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold tracking-tight text-emerald-950">
              Mapa de Salão & Mesas
            </h2>
          </div>
          <p className="text-xs text-zinc-500">
            Arraste para organizar ou toque para abrir comanda
          </p>
        </div>

        {/* Location Filter Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          {(["all", "indoor", "outdoor", "bar"] as const).map((loc) => {
            const labels = {
              all: "Todas",
              indoor: "Interior",
              outdoor: "Esplanada",
              bar: "Bar",
            };
            const icons = {
              all: Maximize2,
              indoor: MapPin,
              outdoor: Coffee,
              bar: UtensilsCrossed,
            };
            const Icon = icons[loc];
            const isActive = filterLocation === loc;

            return (
              <button
                key={loc}
                onClick={() => onFilterLocationChange(loc)}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? "bg-white text-emerald-950 shadow-xs border border-zinc-200 font-bold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{labels[loc]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Legend Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
        <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-[0_0_8px_#10b981]" />
            <span className="text-xs font-medium text-emerald-800">Disponíveis</span>
          </div>
          <span className="text-xs font-bold text-emerald-900 font-mono">{availableCount}</span>
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_#3b82f6]" />
            <span className="text-xs font-medium text-blue-800">Ocupadas</span>
          </div>
          <span className="text-xs font-bold text-blue-900 font-mono">{occupiedCount}</span>
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shadow-[0_0_8px_#f59e0b]" />
            <span className="text-xs font-medium text-amber-800">Reservadas</span>
          </div>
          <span className="text-xs font-bold text-amber-900 font-mono">{reservedCount}</span>
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-100 border border-zinc-200 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
            <span className="text-xs font-medium text-zinc-700">Limpeza</span>
          </div>
          <span className="text-xs font-bold text-zinc-900 font-mono">{dirtyCount}</span>
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
                className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                  config.bg
                } ${config.glow} ${
                  isSelected
                    ? "ring-2 ring-emerald-600 ring-offset-2 ring-offset-[#FAF8F5] scale-[1.02] shadow-md"
                    : "hover:scale-[1.01]"
                }`}
              >
                {/* Header: Table Number & Status Indicator */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${config.indicator}`} />
                    <span className={`text-lg font-black tracking-tight ${config.titleColor} font-mono`}>
                      Mesa {table.table_number}
                    </span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 rounded-lg ${config.badge}`}>
                    {config.label}
                  </Badge>
                </div>

                {/* Body Details: Capacity & Location */}
                <div className="my-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{table.capacity} lugares</span>
                    <span className="text-zinc-500">•</span>
                    <span className="capitalize">{table.location}</span>
                  </div>

                  {/* Reservation details if reserved */}
                  {table.status === "reserved" && table.reserved_for && (
                    <div className="text-[11px] text-amber-800 font-semibold truncate pt-1">
                      👤 {table.reserved_for}
                    </div>
                  )}

                  {/* Dirty status helper */}
                  {table.status === "dirty" && (
                    <div className="text-[11px] text-zinc-500 italic pt-1">
                      Aguardando higienização
                    </div>
                  )}
                </div>

                {/* Quick Action Footer */}
                <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between gap-1">
                  {table.status === "available" && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-7 px-2 text-[11px] font-bold ${config.btnColor} w-full`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTable(table);
                        }}
                      >
                        Abrir Pedido
                      </Button>
                      <button
                        title="Reservar mesa"
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-amber-800 hover:bg-amber-100"
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
                      className={`h-7 px-2 text-[11px] font-bold ${config.btnColor} w-full`}
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
                      className={`h-7 px-2 text-[11px] font-bold ${config.btnColor} w-full`}
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
                      className="h-7 px-2 text-[11px] font-bold border-zinc-300 text-zinc-800 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 w-full rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCleanTable(table.id);
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
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
