"use client";

import React, { useState } from "react";
import { HealthRecordInput, Flock } from "@/types/poultry";
import { HeartPulse, X, CheckCircle2 } from "lucide-react";

interface HealthFormProps {
  flock: Flock;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (flockId: number, data: HealthRecordInput) => Promise<any>;
}

const COMMON_VACCINES = [
  "Vacinação Newcastle (NDV) + Gumboro (IBD)",
  "Vacina Bronquite Infecciosa (IB)",
  "Tratamento Coccidiose (Amprólio / Sulfas)",
  "Complexo Vitamínico Anti-Stress",
  "Desparasitação / Vermífugo",
];

export const HealthForm: React.FC<HealthFormProps> = ({
  flock,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const [disease, setDisease] = useState<string>(COMMON_VACCINES[0]);
  const [treatment, setTreatment] = useState<string>(
    "Administração via água de beber com corante azul indicador"
  );
  const [birdsAffected, setBirdsAffected] = useState<number>(0);
  const [cost, setCost] = useState<number>(1500);
  const [recordDate, setRecordDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disease.trim() || !treatment.trim()) return;

    await onSubmit(flock.id, {
      record_date: recordDate,
      disease: disease.trim(),
      treatment: treatment.trim(),
      birds_affected: birdsAffected,
      cost,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-zinc-200/80 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Registo Sanitário & Vacina</h3>
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
              Data da Aplicação
            </label>
            <input
              type="date"
              required
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Doença / Tipo de Vacinação *
            </label>
            <input
              type="text"
              required
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
              list="vaccine-suggestions"
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs focus:outline-none focus:border-teal-500"
            />
            <datalist id="vaccine-suggestions">
              {COMMON_VACCINES.map((v, idx) => (
                <option key={idx} value={v} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Tratamento / Medicamento Administrado *
            </label>
            <textarea
              rows={2}
              required
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                Aves Tratadas / Afetadas
              </label>
              <input
                type="number"
                min="0"
                value={birdsAffected}
                onChange={(e) => setBirdsAffected(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs font-bold focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                Custo do Tratamento (MT)
              </label>
              <input
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs font-bold focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-xs font-semibold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !disease.trim()}
              className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? "A gravar..." : "Registar Sanidade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
