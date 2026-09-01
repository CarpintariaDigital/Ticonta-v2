"use client";

import React, { useState } from "react";
import { MortalityRecordInput, Flock } from "@/types/poultry";
import { AlertTriangle, X, CheckCircle2 } from "lucide-react";

interface MortalityFormProps {
  flock: Flock;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (flockId: number, data: MortalityRecordInput) => Promise<any>;
}

const CAUSE_OPTIONS = [
  { id: "heat_stress", label: "Estresse Térmico / Calor" },
  { id: "smothering", label: "Amontoamento / Asfixia" },
  { id: "disease", label: "Doença / Suspeita Infecciosa" },
  { id: "predator", label: "Predador / Rato / Cão" },
  { id: "unknown", label: "Causa Desconhecida" },
];

export const MortalityForm: React.FC<MortalityFormProps> = ({
  flock,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const [quantity, setQuantity] = useState<number>(2);
  const [cause, setCause] = useState<string>("heat_stress");
  const [recordDate, setRecordDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");

  const newQuantityAfter = Math.max(0, flock.quantity_current - quantity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    await onSubmit(flock.id, {
      record_date: recordDate,
      quantity,
      cause,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-zinc-200/80 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Registo de Mortalidade / Baixas</h3>
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
              Data da Ocorrência
            </label>
            <input
              type="date"
              required
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Quantidade de Aves Mortas *
            </label>
            <input
              type="number"
              min="1"
              max={flock.quantity_current}
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-base font-black focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Current vs After Indicator */}
          <div className="p-3 bg-white border border-zinc-200 rounded-xl text-xs space-y-1 text-zinc-700">
            <div className="flex justify-between">
              <span>Efetivo Atual:</span>
              <strong className="text-white">{flock.quantity_current} aves</strong>
            </div>
            <div className="flex justify-between pt-1 border-t border-zinc-200 text-rose-300 font-bold">
              <span>Novo Efetivo Vivo após registo:</span>
              <span>{newQuantityAfter} aves</span>
            </div>
          </div>

          {/* Cause Selector */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Causa Provável
            </label>
            <select
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs focus:outline-none focus:border-rose-500"
            >
              {CAUSE_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
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
              disabled={isLoading || quantity <= 0}
              className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? "A registar..." : "Abater Baixas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
