"use client";

import React, { useEffect, useState } from "react";
import { usePayment } from "@/hooks/usePayment";
import { OutstandingPaymentItem } from "@/types/payment";
import {
  DollarSign,
  AlertCircle,
  Clock,
  X,
  User,
  Phone,
  FileText,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

interface OutstandingPaymentsModalProps {
  onClose: () => void;
  onPayItem: (item: OutstandingPaymentItem) => void;
}

export const OutstandingPaymentsModal: React.FC<OutstandingPaymentsModalProps> = ({
  onClose,
  onPayItem,
}) => {
  const { outstandingPayments, fetchOutstandingPayments, isLoading } = usePayment();
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  useEffect(() => {
    fetchOutstandingPayments(1, moduleFilter === "all" ? undefined : moduleFilter);
  }, [fetchOutstandingPayments, moduleFilter]);

  const items = outstandingPayments?.items || [];
  const totalOutstanding = outstandingPayments?.total_outstanding_amount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Vendas com Pagamentos Pendentes</h3>
              <p className="text-xs text-slate-400">
                Saldos a receber de POS, Restaurante, Takeaway e Vendas Informais
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Outstanding Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-400 block">Total a Receber ({items.length} registos)</span>
            <span className="text-xl font-black text-amber-400">
              {totalOutstanding.toLocaleString("pt-MZ")} MT
            </span>
          </div>

          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: "all", label: "Todos" },
              { id: "pos", label: "POS" },
              { id: "restaurant", label: "Mesa" },
              { id: "takeaway", label: "Takeaway" },
              { id: "informal", label: "Fiado" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setModuleFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  moduleFilter === f.id ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Outstanding Items */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
              Nenhum pagamento pendente em aberto.
            </div>
          ) : (
            items.map((item) => {
              return (
                <div
                  key={item.payment_id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                    item.is_overdue
                      ? "bg-rose-950/20 border-rose-500/40"
                      : "bg-slate-950/80 border-slate-800"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.invoice_number || `#${item.payment_id}`}</span>
                      <span className="text-slate-300">• {item.customer_name || "Cliente"}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                        {item.module_source}
                      </span>
                      {item.is_overdue && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Vencido
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Total: {item.amount_total.toLocaleString("pt-MZ")} MT</span>
                      <span>Pago: {item.amount_paid.toLocaleString("pt-MZ")} MT</span>
                      {item.due_date && (
                        <span className="flex items-center gap-1 text-amber-300">
                          <Clock className="w-3 h-3" /> Vence em:{" "}
                          {new Date(item.due_date).toLocaleDateString("pt-MZ")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block">Falta Pagar</span>
                      <span className="text-sm font-extrabold text-amber-400 block">
                        {item.amount_owed.toLocaleString("pt-MZ")} MT
                      </span>
                    </div>

                    <button
                      onClick={() => onPayItem(item)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow transition-all flex items-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Amortizar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
