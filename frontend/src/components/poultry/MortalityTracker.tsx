"use client";

import React from "react";
import { AlertTriangle, ShieldCheck, HeartPulse, Activity } from "lucide-react";

interface MortalityTrackerProps {
  quantityStart: number;
  quantityCurrent: number;
  mortalityRatePercent: number;
  cumulativeMortality: number;
}

export const MortalityTracker: React.FC<MortalityTrackerProps> = ({
  quantityStart,
  quantityCurrent,
  mortalityRatePercent,
  cumulativeMortality,
}) => {
  const isHighMortality = mortalityRatePercent > 5.0;

  return (
    <div className="bg-white/80 border border-zinc-200 rounded-2xl p-4 md:p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              isHighMortality
                ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {isHighMortality ? (
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Biossegurança & Sobrevivência</h3>
            <p className="text-xs text-zinc-500">Controle sanitário de baixas e mortalidade</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
            isHighMortality
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
          }`}
        >
          {mortalityRatePercent}% mortalidade
        </span>
      </div>

      {/* High Mortality Warning */}
      {isHighMortality && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-xs text-rose-200 space-y-1">
          <span className="font-bold block flex items-center gap-1 text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" /> ALERTA CRÍTICO: Taxa &gt; 5%
          </span>
          <p className="text-[11px] text-zinc-700">
            Recomenda-se visita técnica veterinária e avaliação da ventilação, qualidade da água e vacinação.
          </p>
        </div>
      )}

      {/* Stats Breakdown */}
      <div className="grid grid-cols-3 gap-2 text-xs text-center">
        <div className="p-2.5 bg-white rounded-xl border border-zinc-200">
          <span className="text-[10px] text-zinc-500 block">Pintos Iniciais</span>
          <span className="text-sm font-black text-white">{quantityStart}</span>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-zinc-200">
          <span className="text-[10px] text-zinc-500 block">Efetivo Vivo</span>
          <span className="text-sm font-black text-emerald-400">{quantityCurrent}</span>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-zinc-200">
          <span className="text-[10px] text-zinc-500 block">Total de Mortes</span>
          <span className="text-sm font-black text-rose-400">{cumulativeMortality}</span>
        </div>
      </div>
    </div>
  );
};
