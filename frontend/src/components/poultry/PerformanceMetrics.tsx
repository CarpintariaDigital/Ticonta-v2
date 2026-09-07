"use client";

import React from "react";
import { FlockPerformance } from "@/types/poultry";
import {
  TrendingUp,
  Scale,
  Egg,
  DollarSign,
  HeartPulse,
  Activity,
  Layers,
} from "lucide-react";

interface PerformanceMetricsProps {
  performance: FlockPerformance | null;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ performance }) => {
  if (!performance) return null;

  return (
    <div className="bg-white/80 border border-zinc-200 rounded-2xl p-4 md:p-5 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Painel Zootécnico & Rentabilidade #{performance.flock_number}
            </h3>
            <p className="text-xs text-zinc-500">
              Idade do Lote: <strong className="text-indigo-300">{performance.age_in_days} dias</strong> •{" "}
              {performance.quantity_current} aves vivas
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
          Custo: {performance.cost_per_bird_accumulated} MT/ave
        </span>
      </div>

      {/* 4 Big KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-zinc-200 space-y-1">
          <span className="text-[11px] text-zinc-500 block flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-indigo-400" /> Conversão (FCR)
          </span>
          <span className="text-xl font-black text-white">{performance.feed_conversion_ratio_fcr}</span>
          <span className="text-[10px] text-zinc-500 block">kg ração / kg carne</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-zinc-200 space-y-1">
          <span className="text-[11px] text-zinc-500 block flex items-center gap-1">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> Mortalidade
          </span>
          <span className="text-xl font-black text-rose-400">{performance.mortality_rate_percent}%</span>
          <span className="text-[10px] text-zinc-500 block">{performance.cumulative_mortality} baixas</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-zinc-200 space-y-1">
          <span className="text-[11px] text-zinc-500 block flex items-center gap-1">
            <Egg className="w-3.5 h-3.5 text-amber-400" /> Taxa de Postura
          </span>
          <span className="text-xl font-black text-amber-400">
            {performance.laying_percentage_current}%
          </span>
          <span className="text-[10px] text-zinc-500 block">
            {performance.total_eggs_collected} ovos totais
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-zinc-200 space-y-1">
          <span className="text-[11px] text-zinc-500 block flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Custo Total Lote
          </span>
          <span className="text-xl font-black text-emerald-400">
            {performance.total_accumulated_cost.toLocaleString("pt-MZ")} MT
          </span>
          <span className="text-[10px] text-zinc-500 block">Aves + Ração + Sanidade</span>
        </div>
      </div>

      {/* Cost Breakdown Progress Bar */}
      <div className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200 space-y-1.5 text-xs">
        <span className="text-[11px] font-semibold text-zinc-700 block">Composição dos Custos</span>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
          <div style={{ width: "35%" }} className="h-full bg-blue-500" title="Pintos de 1 dia" />
          <div style={{ width: "55%" }} className="h-full bg-amber-500" title="Ração" />
          <div style={{ width: "10%" }} className="h-full bg-teal-500" title="Vacinas e Sanidade" />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500 pt-0.5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Pintos (35%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Ração (55%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" /> Sanidade (10%)
          </span>
        </div>
      </div>
    </div>
  );
};
