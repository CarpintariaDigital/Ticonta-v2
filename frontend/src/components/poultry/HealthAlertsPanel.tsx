"use client";

import React from "react";
import { HeartPulse, Plus, ShieldCheck, DollarSign, Calendar } from "lucide-react";

interface HealthRecordItem {
  disease: string;
  treatment: string;
  cost: number;
  date: string;
  birdsAffected?: number;
}

interface HealthAlertsPanelProps {
  records?: HealthRecordItem[];
  onOpenNewHealth: () => void;
}

export const HealthAlertsPanel: React.FC<HealthAlertsPanelProps> = ({
  records = [
    {
      disease: "Vacinação Newcastle + Gumboro",
      treatment: "Vacina na água de beber com corante azul",
      cost: 1500,
      date: new Date(Date.now() - 15 * 86400000).toISOString().split("T")[0],
      birdsAffected: 1000,
    },
    {
      disease: "Prevenção Coccidiose",
      treatment: "Suplementação vitamínica + coccidiostático",
      cost: 850,
      date: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
      birdsAffected: 0,
    },
  ],
  onOpenNewHealth,
}) => {
  return (
    <div className="bg-white/80 border border-zinc-200 rounded-2xl p-4 md:p-5 shadow-xl backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Histórico Sanitário & Vacinação</h3>
            <p className="text-xs text-zinc-500">Tratamentos preventivos e curativos</p>
          </div>
        </div>

        <button
          onClick={onOpenNewHealth}
          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow"
        >
          <Plus className="w-3.5 h-3.5" /> Registar Vacina
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {records.map((r, idx) => (
          <div
            key={idx}
            className="p-3 bg-white border border-zinc-200 rounded-xl flex items-center justify-between text-xs gap-2"
          >
            <div className="space-y-0.5">
              <span className="font-bold text-white block">{r.disease}</span>
              <span className="text-zinc-500 text-[11px] block">{r.treatment}</span>
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {r.date}
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-black text-teal-400 block">{r.cost} MT</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-end gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Aplicado
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
