"use client";

import React, { useState } from "react";
import { FeedConsumptionInput, Flock } from "@/types/poultry";
import { Utensils, X, CheckCircle2, DollarSign } from "lucide-react";

interface FeedConsumptionFormProps {
  flock: Flock;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (flockId: number, data: FeedConsumptionInput) => Promise<any>;
}

export const FeedConsumptionForm: React.FC<FeedConsumptionFormProps> = ({
  flock,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const [bagsUsed, setBagsUsed] = useState<number>(2.0);
  const [costPerBag, setCostPerBag] = useState<number>(1950);
  const [consumptionDate, setConsumptionDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");

  const totalKg = bagsUsed * 50;
  const totalCost = bagsUsed * costPerBag;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bagsUsed <= 0) return;

    await onSubmit(flock.id, {
      consumption_date: consumptionDate,
      bags_used: bagsUsed,
      kg_used: totalKg,
      cost: totalCost,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-zinc-200/80 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Registar Consumo de Ração</h3>
              <p className="text-[11px] text-zinc-500">Lote #{flock.flock_number}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Data do Consumo
            </label>
            <input
              type="date"
              required
              value={consumptionDate}
              onChange={(e) => setConsumptionDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                Sacos Consumidos (50kg) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={bagsUsed}
                onChange={(e) => setBagsUsed(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-white text-base font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                Preço por Saco (MT)
              </label>
              <input
                type="number"
                min="100"
                value={costPerBag}
                onChange={(e) => setCostPerBag(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-white text-base font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1 text-xs text-zinc-700">
            <div className="flex justify-between">
              <span>Peso Total em Ração:</span>
              <strong className="text-white">{totalKg} kg</strong>
            </div>
            <div className="flex justify-between pt-1 border-t border-zinc-200/80">
              <span>Custo Total do Fornecimento:</span>
              <strong className="text-emerald-400 font-bold">{totalCost.toLocaleString("pt-MZ")} MT</strong>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-zinc-700 text-xs font-semibold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || bagsUsed <= 0}
              className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? "A gravar..." : "Confirmar Ração"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
