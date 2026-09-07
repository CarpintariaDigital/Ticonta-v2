"use client";

import React from "react";
import { Egg, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface EggProductionChartProps {
  totalEggs: number;
  layingRatePercent: number;
  qualityBreakdown?: { grade_a: number; grade_b: number; grade_c: number };
}

export const EggProductionChart: React.FC<EggProductionChartProps> = ({
  totalEggs,
  layingRatePercent,
  qualityBreakdown = { grade_a: 85, grade_b: 12, grade_c: 3 },
}) => {
  // Simulated historical 7-day trend values
  const mockDailyTrend = [
    { day: "Seg", eggs: 680, rate: 86.5 },
    { day: "Ter", eggs: 695, rate: 87.2 },
    { day: "Qua", eggs: 705, rate: 88.0 },
    { day: "Qui", eggs: 690, rate: 87.0 },
    { day: "Sex", eggs: 715, rate: 89.2 },
    { day: "Sáb", eggs: 720, rate: 90.0 },
    { day: "Hoje", eggs: totalEggs || 710, rate: layingRatePercent || 88.5 },
  ];

  const maxEggs = Math.max(...mockDailyTrend.map((d) => d.eggs), 800);

  return (
    <div className="bg-white/80 border border-zinc-200 rounded-2xl p-4 md:p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Egg className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Produção Diária de Ovos & Postura</h3>
            <p className="text-xs text-zinc-500">Curva de rendimento e controle de qualidade</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Taxa de Postura</span>
          <span className="text-lg font-black text-amber-400">{layingRatePercent || 88.5}%</span>
        </div>
      </div>

      {/* 7-Day Bar Histogram Visual */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
          Colheita dos Últimos 7 Dias (Ovos/Dia)
        </span>

        <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2 bg-zinc-50/80 rounded-xl border border-zinc-200/80">
          {mockDailyTrend.map((item, idx) => {
            const barHeight = Math.max(15, Math.round((item.eggs / maxEggs) * 100));
            const isToday = idx === mockDailyTrend.length - 1;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.eggs}
                </span>
                <div
                  style={{ height: `${barHeight}%` }}
                  className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                    isToday
                      ? "bg-gradient-to-t from-amber-600 to-yellow-400 shadow-lg shadow-amber-950/50"
                      : "bg-gradient-to-t from-slate-700 to-amber-600/70 hover:from-amber-600 hover:to-amber-500"
                  }`}
                />
                <span className={`text-[10px] font-bold ${isToday ? "text-amber-400" : "text-zinc-500"}`}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quality Classification Breakdown */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
        <div className="p-2 bg-white rounded-xl border border-zinc-200 text-center">
          <span className="text-[10px] text-zinc-500 block">Grau A (Perfeito)</span>
          <span className="text-sm font-extrabold text-emerald-400">{qualityBreakdown.grade_a}%</span>
        </div>

        <div className="p-2 bg-white rounded-xl border border-zinc-200 text-center">
          <span className="text-[10px] text-zinc-500 block">Grau B (Médio)</span>
          <span className="text-sm font-extrabold text-amber-400">{qualityBreakdown.grade_b}%</span>
        </div>

        <div className="p-2 bg-white rounded-xl border border-zinc-200 text-center">
          <span className="text-[10px] text-zinc-500 block">Grau C (Quebrados)</span>
          <span className="text-sm font-extrabold text-rose-400">{qualityBreakdown.grade_c}%</span>
        </div>
      </div>
    </div>
  );
};
