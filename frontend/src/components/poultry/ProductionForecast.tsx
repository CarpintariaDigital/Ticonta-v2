"use client";

import React from "react";
import { FlockForecast } from "@/types/poultry";
import {
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface ProductionForecastProps {
  forecast: FlockForecast | null;
}

export const ProductionForecast: React.FC<ProductionForecastProps> = ({ forecast }) => {
  if (!forecast) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/30 rounded-2xl p-4 md:p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Previsão de Produção & Lucro Projetado</h3>
            <p className="text-xs text-zinc-500">Projeção zootécnica e financeira até a comercialização</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          ROI: +{forecast.projected_roi_percent}%
        </span>
      </div>

      {/* Timeline & Readiness Badge */}
      <div className="p-3.5 bg-white rounded-xl border border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              Prontidão / Abate Estimado
            </span>
            <span className="text-sm font-extrabold text-white">
              {forecast.projected_ready_date
                ? new Date(forecast.projected_ready_date).toLocaleDateString("pt-MZ")
                : "Em breve"}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-zinc-500 block">Tempo Restante</span>
          <span className="text-sm font-black text-amber-400">
            {forecast.days_remaining} dias restantes
          </span>
        </div>
      </div>

      {/* Financial Projections Grid */}
      <div className="grid grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-0.5">
          <span className="text-[10px] text-zinc-500 block">Custo Total Projetado</span>
          <span className="text-sm font-extrabold text-zinc-800">
            {forecast.estimated_total_cost_at_sale.toLocaleString("pt-MZ")} MT
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-0.5">
          <span className="text-[10px] text-zinc-500 block">Faturamento Previsto</span>
          <span className="text-sm font-extrabold text-indigo-400">
            {forecast.projected_revenue_at_sale.toLocaleString("pt-MZ")} MT
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-emerald-500/30 space-y-0.5">
          <span className="text-[10px] text-emerald-400 font-bold block">Lucro Líquido Previsto</span>
          <span className="text-sm font-black text-emerald-400">
            +{forecast.projected_net_profit.toLocaleString("pt-MZ")} MT
          </span>
        </div>
      </div>

      {/* Forecast Notes */}
      {forecast.forecast_notes && forecast.forecast_notes.length > 0 && (
        <div className="space-y-1 pt-1 text-xs text-zinc-700">
          {forecast.forecast_notes.map((note, idx) => (
            <p key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>{note}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
