"use client";

import React from "react";
import { AlertTriangle, Calendar, DollarSign, UserCheck } from "lucide-react";

interface PartialPaymentWarningProps {
  totalAmount: number;
  payingAmount: number;
  customerName?: string;
  dueDate: string;
  onDueDateChange: (date: string) => void;
}

export const PartialPaymentWarning: React.FC<PartialPaymentWarningProps> = ({
  totalAmount,
  payingAmount,
  customerName = "O cliente",
  dueDate,
  onDueDateChange,
}) => {
  const remaining = Math.max(0, totalAmount - payingAmount);

  return (
    <div className="p-4 bg-amber-950/40 border border-amber-500/50 rounded-2xl space-y-3 animate-fade-in shadow-lg shadow-amber-950/30">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/30">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 text-sm">Aviso de Pagamento Parcial</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Fiado / A Dever
            </span>
          </div>
          <p className="text-zinc-700 mt-1">
            {customerName} pagará apenas <strong className="text-white">{payingAmount.toLocaleString("pt-MZ")} MT</strong> agora.
          </p>
          <p className="text-amber-200 font-bold text-sm mt-1">
            Ficará a dever: <span className="text-amber-400 font-black">{remaining.toLocaleString("pt-MZ")} MT</span>
          </p>
        </div>
      </div>

      {/* Due Date Selector */}
      <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <label className="text-zinc-700 font-medium flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          Data prometida para quitação:
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
          className="px-3 py-1.5 bg-white border border-amber-500/40 rounded-xl text-zinc-900 text-xs font-semibold focus:outline-none focus:border-amber-400"
        />
      </div>
    </div>
  );
};
