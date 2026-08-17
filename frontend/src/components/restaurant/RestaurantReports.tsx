"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Clock,
  DollarSign,
  UtensilsCrossed,
  Award,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { RestaurantReportsResponse } from "@/types/restaurant";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RestaurantReportsProps {
  reports: RestaurantReportsResponse | null;
  onFetchReports: (startDate?: string, endDate?: string) => Promise<any>;
}

export default function RestaurantReports({
  reports,
  onFetchReports,
}: RestaurantReportsProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    onFetchReports();
  }, [onFetchReports]);

  const handleFilter = () => {
    onFetchReports(startDate || undefined, endDate || undefined);
  };

  if (!reports) {
    return (
      <div className="flex items-center justify-center h-full p-12 text-zinc-500 text-sm">
        Carregando dados estatísticos e analíticos do restaurante...
      </div>
    );
  }

  // Find max hourly revenue for chart scaling
  const maxHourlyRevenue = Math.max(
    ...reports.peak_hours.map((h) => Number(h.revenue || 0)),
    100
  );

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-xl border border-zinc-800 p-5 text-zinc-100 overflow-y-auto space-y-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-black text-white tracking-tight">
              Relatórios & Análise de Desempenho
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Métricas de horários de pico, pratos mais vendidos e tempo médio de permanência
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200"
          />
          <span className="text-zinc-600">até</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200"
          />
          <Button size="sm" onClick={handleFilter} className="bg-emerald-600 hover:bg-emerald-500 text-xs h-8">
            Filtrar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Faturamento Total</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {Number(reports.total_revenue).toFixed(2)} MZN
          </div>
          <div className="text-[11px] text-zinc-500">Pedidos finalizados</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total de Pedidos</span>
            <UtensilsCrossed className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {reports.total_orders}
          </div>
          <div className="text-[11px] text-zinc-500">Mesas atendidas</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Ticket Médio</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">
            {Number(reports.average_order_value).toFixed(2)} MZN
          </div>
          <div className="text-[11px] text-zinc-500">Por mesa</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Giro Médio de Mesa</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {reports.average_table_time_minutes} min
          </div>
          <div className="text-[11px] text-zinc-500">Tempo de permanência</div>
        </div>
      </div>

      {/* Peak Hours Histogram Chart */}
      <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Distribuição de Horários de Pico (00:00 - 23:00)
          </h3>
          <span className="text-xs text-zinc-500">Volume de Vendas por Hora</span>
        </div>

        <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 px-1 border-b border-zinc-800">
          {reports.peak_hours.map((hour) => {
            const heightPercent = maxHourlyRevenue > 0 ? (Number(hour.revenue) / maxHourlyRevenue) * 100 : 0;
            const hasActivity = hour.order_count > 0;

            return (
              <div
                key={hour.hour}
                className="flex-1 flex flex-col items-center group relative h-full justify-end"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-zinc-700 text-[10px] p-1.5 rounded pointer-events-none whitespace-nowrap z-20 shadow-xl">
                  <strong>{hour.hour_label}</strong>
                  <br />
                  {Number(hour.revenue).toFixed(2)} MZN ({hour.order_count} pedidos)
                </div>

                <div
                  style={{ height: `${Math.max(4, heightPercent)}%` }}
                  className={`w-full rounded-t transition-all ${
                    hasActivity
                      ? "bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300"
                      : "bg-zinc-800/40"
                  }`}
                />
                <span className="text-[9px] font-mono text-zinc-500 mt-1">
                  {hour.hour % 2 === 0 ? `${hour.hour}h` : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two columns: Top Dishes Ranking + Revenue by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 10 Dishes */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Top 10 Pratos & Bebidas Mais Vendidos
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {reports.top_dishes.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs">
                Nenhum prato vendido no período selecionado.
              </div>
            ) : (
              reports.top_dishes.map((dish, idx) => (
                <div
                  key={dish.menu_item_id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-amber-400 font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-xs text-zinc-100">{dish.name}</h4>
                      <span className="text-[10px] text-zinc-500 capitalize">{dish.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400 font-mono">
                      {Number(dish.total_revenue).toFixed(2)} MZN
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {dish.quantity_sold} pedidos
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Faturamento por Categoria
          </h3>

          <div className="space-y-2.5 pt-1">
            {Object.entries(reports.revenue_by_category).map(([category, revenue]) => {
              const totalRev = Number(reports.total_revenue) || 1;
              const percent = ((Number(revenue) / totalRev) * 100).toFixed(1);

              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="capitalize text-zinc-300">{category}</span>
                    <span className="font-mono text-zinc-100">
                      {Number(revenue).toFixed(2)} MZN ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      style={{ width: `${percent}%` }}
                      className="bg-emerald-500 h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
