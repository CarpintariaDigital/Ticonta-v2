"use client";

import React from "react";
import { Flock } from "@/types/poultry";
import {
  Egg,
  HeartPulse,
  TrendingUp,
  Plus,
  Calendar,
  AlertTriangle,
  Layers,
  Sparkles,
  DollarSign,
  Utensils,
} from "lucide-react";

interface FlockOverviewCardsProps {
  flocks: Flock[];
  selectedFlock: Flock | null;
  onSelectFlock: (flock: Flock) => void;
  onOpenNewFlock: () => void;
  onOpenDailyEgg: (flock: Flock) => void;
  onOpenFeedLog: (flock: Flock) => void;
  onOpenMortality: (flock: Flock) => void;
  onOpenHealthLog: (flock: Flock) => void;
}

export const FlockOverviewCards: React.FC<FlockOverviewCardsProps> = ({
  flocks,
  selectedFlock,
  onSelectFlock,
  onOpenNewFlock,
  onOpenDailyEgg,
  onOpenFeedLog,
  onOpenMortality,
  onOpenHealthLog,
}) => {
  const getSpeciesLabel = (species: string) => {
    switch (species) {
      case "chicken_broiler":
        return { label: "Frango de Corte", icon: "🍗", color: "from-amber-600 to-orange-600" };
      case "chicken_layer":
        return { label: "Galinha Poedeira", icon: "🥚", color: "from-yellow-500 to-amber-600" };
      case "quail":
        return { label: "Codorna", icon: "🪶", color: "from-teal-600 to-emerald-600" };
      case "duck":
        return { label: "Pato", icon: "🦆", color: "from-cyan-600 to-blue-600" };
      default:
        return { label: "Aves", icon: "🐔", color: "from-indigo-600 to-purple-600" };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Lotes de Aves Ativos</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
            {flocks.length} lotes
          </span>
        </h2>

        <button
          onClick={onOpenNewFlock}
          className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-950/40 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Novo Lote
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {flocks.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-zinc-500 bg-white border border-zinc-200 rounded-2xl">
            <Egg className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Nenhum lote de aves cadastrado nesta exploração.</p>
          </div>
        ) : (
          flocks.map((flock) => {
            const speciesInfo = getSpeciesLabel(flock.species);
            const isSelected = selectedFlock?.id === flock.id;
            const startD = new Date(flock.start_date);
            const ageInDays = Math.max(1, Math.floor((Date.now() - startD.getTime()) / 86400000));
            const survivalRate =
              flock.quantity_at_start > 0
                ? ((flock.quantity_current / flock.quantity_at_start) * 100).toFixed(1)
                : "100.0";
            const mortalityCount = flock.quantity_at_start - flock.quantity_current;

            return (
              <div
                key={flock.id}
                onClick={() => onSelectFlock(flock)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "bg-white border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-950/40"
                    : "bg-white/80 border-zinc-200 hover:border-zinc-200 hover:bg-white"
                }`}
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${speciesInfo.color} flex items-center justify-center text-xl shadow-md`}
                    >
                      {speciesInfo.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-sm md:text-base">
                          {flock.flock_number}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            flock.status === "producing"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : flock.status === "growing"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-slate-800 text-zinc-500"
                          }`}
                        >
                          {flock.status === "growing" ? "Crescimento" : flock.status === "producing" ? "Em Postura" : flock.status}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500 font-medium">
                        {speciesInfo.label} • Idade: <strong className="text-indigo-300">{ageInDays} dias</strong>
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-zinc-700 bg-white px-2 py-1 rounded-lg border border-zinc-200">
                    {flock.cost_per_bird} MT/pinto
                  </span>
                </div>

                {/* Progress & Live Count */}
                <div className="p-3 bg-white rounded-xl border border-zinc-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-500">Efetivo Vivo / Inicial:</span>
                    <span className="font-extrabold text-white">
                      <strong className="text-emerald-400 text-sm">{flock.quantity_current}</strong> /{" "}
                      {flock.quantity_at_start} aves
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="text-zinc-500">Taxa de Sobrevivência:</span>
                    <span className="font-bold text-emerald-400">{survivalRate}% ({mortalityCount} mortes)</span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${survivalRate}%` }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    />
                  </div>
                </div>

                {/* Quick 1-Click Action Buttons */}
                <div
                  className="grid grid-cols-4 gap-1.5 pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {flock.species === "chicken_layer" ? (
                    <button
                      onClick={() => onOpenDailyEgg(flock)}
                      className="p-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold flex flex-col items-center gap-0.5 transition-colors"
                      title="Registar Ovos"
                    >
                      <Egg className="w-3.5 h-3.5" /> Ovos
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenFeedLog(flock)}
                      className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-bold flex flex-col items-center gap-0.5 transition-colors"
                      title="Ração"
                    >
                      <Utensils className="w-3.5 h-3.5" /> Ração
                    </button>
                  )}

                  <button
                    onClick={() => onOpenFeedLog(flock)}
                    className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-bold flex flex-col items-center gap-0.5 transition-colors"
                    title="Alimentação"
                  >
                    <Utensils className="w-3.5 h-3.5" /> Ração
                  </button>

                  <button
                    onClick={() => onOpenMortality(flock)}
                    className="p-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-[11px] font-bold flex flex-col items-center gap-0.5 transition-colors"
                    title="Mortalidade"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Baixas
                  </button>

                  <button
                    onClick={() => onOpenHealthLog(flock)}
                    className="p-1.5 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-lg text-[11px] font-bold flex flex-col items-center gap-0.5 transition-colors"
                    title="Sanidade / Vacina"
                  >
                    <HeartPulse className="w-3.5 h-3.5" /> Vacina
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
