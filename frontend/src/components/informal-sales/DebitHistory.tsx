"use client";

import React, { useEffect } from "react";
import { InformalCustomer, Debit } from "@/types/informal_sales";
import {
  History,
  X,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  ChevronRight,
  Receipt,
  Smartphone,
} from "lucide-react";

interface DebitHistoryProps {
  customer: InformalCustomer;
  debits: Debit[];
  isLoading: boolean;
  onClose: () => void;
  onOpenCollection: (debit: Debit) => void;
}

export const DebitHistory: React.FC<DebitHistoryProps> = ({
  customer,
  debits,
  isLoading,
  onClose,
  onOpenCollection,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white">Extrato & Histórico de Fiados</h3>
              <p className="text-xs text-slate-400">{customer.name} • {customer.phone || "Sem telefone"}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Totals Summary */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-950/60 border-b border-slate-800/80 text-center">
          <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Comprado</span>
            <span className="text-sm font-bold text-white">
              {customer.total_purchases.toLocaleString("pt-MZ")} MT
            </span>
          </div>
          <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Saldo Devedor</span>
            <span
              className={`text-sm font-extrabold ${
                customer.total_owed > 0 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {customer.total_owed.toLocaleString("pt-MZ")} MT
            </span>
          </div>
          <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Limite de Fiado</span>
            <span className="text-sm font-bold text-indigo-300">
              {customer.trusted_credit_limit.toLocaleString("pt-MZ")} MT
            </span>
          </div>
        </div>

        {/* Debits Timeline List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Carregando histórico...</div>
          ) : debits.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Nenhum fiado registrado para este cliente.</p>
            </div>
          ) : (
            debits.map((debit) => {
              const percentPaid =
                debit.total_amount > 0 ? Math.round((debit.amount_paid / debit.total_amount) * 100) : 100;
              const isOverdue = debit.status === "overdue" || debit.is_overdue;

              return (
                <div
                  key={debit.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isOverdue
                      ? "bg-rose-950/20 border-rose-500/40"
                      : debit.status === "paid"
                      ? "bg-slate-950/40 border-slate-800/80 opacity-80"
                      : "bg-slate-950/70 border-slate-800"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-semibold text-white">
                        {new Date(debit.created_at).toLocaleDateString("pt-MZ", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                      {/* Status Badge */}
                      {debit.status === "paid" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Quitado
                        </span>
                      ) : isOverdue ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Atrasado ({debit.days_overdue} dias)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> A Pagar
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Falta Pagar:</span>
                        <span
                          className={`text-sm font-extrabold ${
                            debit.amount_owed > 0 ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {debit.amount_owed.toLocaleString("pt-MZ")} MT
                        </span>
                      </div>

                      {debit.amount_owed > 0 && (
                        <button
                          onClick={() => onOpenCollection(debit)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow active:scale-95 transition-all flex items-center gap-1 ml-2"
                        >
                          <DollarSign className="w-3 h-3" /> Cobrar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar of Amortization */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Total: {debit.total_amount.toLocaleString("pt-MZ")} MT</span>
                      <span>Amortizado: {debit.amount_paid.toLocaleString("pt-MZ")} MT ({percentPaid}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentPaid === 100
                            ? "bg-emerald-500"
                            : isOverdue
                            ? "bg-rose-500"
                            : "bg-indigo-500"
                        }`}
                        style={{ width: `${percentPaid}%` }}
                      />
                    </div>
                  </div>

                  {debit.notes && (
                    <p className="text-xs text-slate-300 italic mb-3 bg-slate-900/60 p-2 rounded border border-slate-800">
                      "{debit.notes}"
                    </p>
                  )}

                  {/* Partial Payments History Accordion / List */}
                  {debit.partial_payments && debit.partial_payments.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        Histórico de Amortizações:
                      </span>
                      {debit.partial_payments.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs p-1.5 bg-slate-900/40 rounded border border-slate-800/50"
                        >
                          <div className="flex items-center gap-2 text-slate-400">
                            <span>{new Date(p.paid_at).toLocaleDateString("pt-MZ")}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 uppercase">
                              {p.payment_method}
                            </span>
                            {p.notes && <span className="text-slate-500 truncate max-w-xs">- {p.notes}</span>}
                          </div>
                          <span className="font-bold text-emerald-400">
                            +{p.amount.toLocaleString("pt-MZ")} MT
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
