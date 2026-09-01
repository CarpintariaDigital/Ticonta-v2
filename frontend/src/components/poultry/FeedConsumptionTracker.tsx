"use client";

import React from "react";
import { Utensils, AlertCircle, TrendingUp, Package, Clock } from "lucide-react";

interface FeedConsumptionTrackerProps {
  totalFeedConsumedKg: number;
  averageFeedPerBirdDayGrams: number;
  fcr: number;
  feedType?: string;
  stockBags?: number;
}

export const FeedConsumptionTracker: React.FC<FeedConsumptionTrackerProps> = ({
  totalFeedConsumedKg,
  averageFeedPerBirdDayGrams,
  fcr,
  feedType = "Ração Crescimento 50kg",
  stockBags = 45,
}) => {
  const isLowStock = stockBags < 15;
  const estimatedDaysOfStock = Math.max(1, Math.round(stockBags / 4.5));

  return (
    <div className="bg-white/80 border border-zinc-200 rounded-2xl p-4 md:p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Alimentação & Conversão (FCR)</h3>
            <p className="text-xs text-zinc-500">Eficiência alimentar e estoque de ração</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
          FCR: {fcr || 1.62} kg/kg
        </span>
      </div>

      {/* Low Stock Alert if needed */}
      {isLowStock && (
        <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Atenção:</strong> Estoque de ração em nível crítico ({stockBags} sacos).
          </span>
        </div>
      )}

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-0.5">
          <span className="text-[11px] text-zinc-500 block flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-indigo-400" /> Em Armazém
          </span>
          <span className="text-base font-extrabold text-white">{stockBags} sacos</span>
          <span className="text-[10px] text-zinc-500 block truncate">{feedType}</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-0.5">
          <span className="text-[11px] text-zinc-500 block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Autonomia
          </span>
          <span className="text-base font-extrabold text-amber-400">~{estimatedDaysOfStock} dias</span>
          <span className="text-[10px] text-zinc-500 block">Consumo: ~4.5 sacos/dia</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-0.5 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-zinc-500 block flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Consumo Médio
          </span>
          <span className="text-base font-extrabold text-emerald-400">
            {averageFeedPerBirdDayGrams || 95.5} g/ave/dia
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Total Lote: {totalFeedConsumedKg || 2850} kg
          </span>
        </div>
      </div>
    </div>
  );
};
