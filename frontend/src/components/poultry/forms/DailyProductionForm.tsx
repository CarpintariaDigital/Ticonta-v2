"use client";

import React, { useState } from "react";
import { EggProductionInput, EggQuality, Flock } from "@/types/poultry";
import { Egg, X, CheckCircle2 } from "lucide-react";

interface DailyProductionFormProps {
  flock: Flock;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (flockId: number, data: EggProductionInput) => Promise<any>;
}

export const DailyProductionForm: React.FC<DailyProductionFormProps> = ({
  flock,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const [quantity, setQuantity] = useState<number>(300);
  const [quality, setQuality] = useState<EggQuality>("grade_a");
  const [brokenQuantity, setBrokenQuantity] = useState<number>(0);
  const [productionDate, setProductionDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");

  const totalTrays = Math.floor(quantity / 30);
  const remainderEggs = quantity % 30;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 0) return;

    await onSubmit(flock.id, {
      production_date: productionDate,
      quantity,
      quality,
      broken_quantity: brokenQuantity,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Egg className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Registo Diário de Ovos</h3>
              <p className="text-[11px] text-slate-400">Lote #{flock.flock_number}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Data da Colheita
            </label>
            <input
              type="date"
              required
              value={productionDate}
              onChange={(e) => setProductionDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Total de Ovos *
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-base font-black focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Rachados / Rejeitados
              </label>
              <input
                type="number"
                min="0"
                value={brokenQuantity}
                onChange={(e) => setBrokenQuantity(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-base font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Tray Equivalent Helper */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex justify-between items-center text-slate-300">
            <span>Equivalente em Cartelas:</span>
            <span className="font-extrabold text-amber-400">
              {totalTrays} cartelas (30 ovos) {remainderEggs > 0 ? `+ ${remainderEggs} ovos` : ""}
            </span>
          </div>

          {/* Quality Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Classificação da Casca / Qualidade
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: "grade_a", label: "Grau A (Excelente)" },
                { id: "grade_b", label: "Grau B (Normal)" },
                { id: "grade_c", label: "Grau C (Industrial)" },
              ].map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuality(q.id as EggQuality)}
                  className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                    quality === q.id
                      ? "bg-amber-600 text-white border-amber-500 font-bold shadow"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? "A gravar..." : "Registar Colheita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
