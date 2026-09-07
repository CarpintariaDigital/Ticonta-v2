"use client";

import React, { useState } from "react";
import { FlockCreateInput, PoultrySpecies } from "@/types/poultry";
import { Egg, X, Plus, CheckCircle2, DollarSign, Calendar, Info } from "lucide-react";

interface NewFlockFormProps {
  farmId: number;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: FlockCreateInput) => Promise<any>;
}

const SPECIES_OPTIONS: { id: PoultrySpecies; label: string; icon: string; cycleDays: number; defaultCost: number }[] = [
  { id: "chicken_broiler", label: "Frango de Corte (Broiler)", icon: "🍗", cycleDays: 38, defaultCost: 55 },
  { id: "chicken_layer", label: "Galinha Poedeira (Layer)", icon: "🥚", cycleDays: 130, defaultCost: 110 },
  { id: "quail", label: "Codorna", icon: "🪶", cycleDays: 45, defaultCost: 35 },
  { id: "duck", label: "Pato", icon: "🦆", cycleDays: 60, defaultCost: 90 },
];

export const NewFlockForm: React.FC<NewFlockFormProps> = ({
  farmId,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const [species, setSpecies] = useState<PoultrySpecies>("chicken_broiler");
  const [quantity, setQuantity] = useState<number>(500);
  const [costPerBird, setCostPerBird] = useState<number>(55);
  const [feedType, setFeedType] = useState<string>("Ração Inicial 50kg");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [flockNumber, setFlockNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const handleSpeciesChange = (s: PoultrySpecies) => {
    setSpecies(s);
    const found = SPECIES_OPTIONS.find((o) => o.id === s);
    if (found) {
      setCostPerBird(found.defaultCost);
    }
  };

  const totalInitialCost = quantity * costPerBird;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || costPerBird <= 0) {
      alert("Informe quantidade e custo válidos.");
      return;
    }

    const payload: FlockCreateInput = {
      farm_id: farmId,
      flock_number: flockNumber.trim() || undefined,
      species,
      quantity_at_start: quantity,
      cost_per_bird: costPerBird,
      feed_type: feedType.trim(),
      start_date: startDate,
      notes: notes.trim() || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white border border-zinc-200/80 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Egg className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Criar Novo Lote de Aves</h3>
              <p className="text-xs text-zinc-500">Registo de entrada de pintos no pavilhão</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Species Selection */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
              Espécie de Aves *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SPECIES_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSpeciesChange(opt.id)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all text-xs ${
                    species === opt.id
                      ? "bg-emerald-950/60 border-emerald-500 text-white font-bold shadow-md"
                      : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <div>
                    <span className="block font-semibold">{opt.label}</span>
                    <span className="text-[10px] text-zinc-500">Ciclo: ~{opt.cycleDays} dias</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Cost per Bird */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                Quantidade de Pintos *
              </label>
              <input
                type="number"
                min="10"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-sm font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                Custo por Pinto (MT) *
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={costPerBird}
                onChange={(e) => setCostPerBird(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-sm font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Initial Cost Summary Banner */}
          <div className="p-3 bg-white border border-zinc-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-zinc-500">Investimento Inicial em Pintos:</span>
            <span className="font-extrabold text-emerald-400 text-sm">
              {totalInitialCost.toLocaleString("pt-MZ")} MT
            </span>
          </div>

          {/* Start Date & Feed Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                Data de Entrada *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                Tipo de Ração
              </label>
              <input
                type="text"
                value={feedType}
                onChange={(e) => setFeedType(e.target.value)}
                placeholder="Ex: Ração Inicial 50kg"
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Custom Flock Number / Batch Code */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Código / Nome do Lote (Opcional)
            </label>
            <input
              type="text"
              value={flockNumber}
              onChange={(e) => setFlockNumber(e.target.value)}
              placeholder="Ex: LOTE-2026-003 (Gerado auto se vazio)"
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || quantity <= 0}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? "A registar lote..." : "Confirmar e Iniciar Lote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
