"use client";

import React, { useState } from "react";
import { PaymentMethod, SplitPaymentInput, SplitPaymentItemInput } from "@/types/payment";
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Banknote,
  Smartphone,
  Wallet,
  CreditCard,
  Building,
} from "lucide-react";

interface SplitPaymentFormProps {
  saleId: number;
  totalAmount: number;
  customerName?: string;
  moduleSource?: string;
  invoiceNumber?: string;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: SplitPaymentInput) => Promise<any>;
}

const AVAILABLE_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "cash", label: "Dinheiro (Caixa)" },
  { id: "mpesa", label: "M-Pesa (Vodacom)" },
  { id: "emola", label: "E-Mola (Movitel)" },
  { id: "card", label: "Cartão / POS" },
  { id: "transfer", label: "Transferência Bancária" },
];

export const SplitPaymentForm: React.FC<SplitPaymentFormProps> = ({
  saleId,
  totalAmount,
  customerName = "Cliente Geral",
  moduleSource = "pos",
  invoiceNumber = "",
  isLoading = false,
  onClose,
  onSubmit,
}) => {
  const [rows, setRows] = useState<SplitPaymentItemInput[]>([
    { amount: Math.round(totalAmount / 2), payment_method: "cash" },
    { amount: totalAmount - Math.round(totalAmount / 2), payment_method: "mpesa" },
  ]);

  const handleAddRow = () => {
    const currentSum = rows.reduce((acc, r) => acc + (r.amount || 0), 0);
    const diff = Math.max(0, totalAmount - currentSum);
    setRows([...rows, { amount: diff > 0 ? diff : 100, payment_method: "emola" }]);
  };

  const handleRemoveRow = (idx: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== idx));
  };

  const handleUpdateRow = (idx: number, field: keyof SplitPaymentItemInput, value: any) => {
    setRows(rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const currentTotal = rows.reduce((acc, r) => acc + (parseFloat(String(r.amount)) || 0), 0);
  const diff = totalAmount - currentTotal;
  const isExact = diff === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTotal <= 0) {
      alert("Informe pelo menos um valor válido.");
      return;
    }

    const payload: SplitPaymentInput = {
      payments: rows.map((r) => ({
        amount: parseFloat(String(r.amount)) || 0,
        payment_method: r.payment_method,
        transaction_id: r.transaction_id?.trim() || undefined,
        notes: r.notes?.trim() || undefined,
      })),
      amount_total: totalAmount,
      module_source: moduleSource,
      invoice_number: invoiceNumber || undefined,
      customer_name: customerName,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white border border-zinc-200/80 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                {moduleSource.toUpperCase()} • Venda #{saleId}
              </span>
              <h3 className="text-base md:text-lg font-black text-white">Dividir Pagamento (Split)</h3>
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
          {/* Target Total Strip */}
          <div className="p-3.5 bg-white border border-zinc-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              Total Esperado: <strong className="text-white">{totalAmount.toLocaleString("pt-MZ")} MT</strong>
            </span>

            <span
              className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                isExact
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : diff > 0
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              {isExact
                ? "Soma 100% Exata ✅"
                : diff > 0
                ? `Falta alocar: ${diff.toLocaleString("pt-MZ")} MT`
                : `Excesso: ${Math.abs(diff).toLocaleString("pt-MZ")} MT`}
            </span>
          </div>

          {/* Allocation Rows */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 uppercase tracking-wider">
              <span>Métodos Selecionados ({rows.length})</span>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 normal-case"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Método
              </button>
            </div>

            {rows.map((row, idx) => (
              <div
                key={idx}
                className="p-3 bg-white border border-zinc-200 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <select
                    value={row.payment_method}
                    onChange={(e) =>
                      handleUpdateRow(idx, "payment_method", e.target.value as PaymentMethod)
                    }
                    className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-white font-semibold focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    {AVAILABLE_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>

                  <div className="relative w-36">
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      value={row.amount}
                      onChange={(e) =>
                        handleUpdateRow(idx, "amount", parseFloat(e.target.value) || 0)
                      }
                      className="w-full pl-3 pr-7 py-2 bg-white border border-zinc-200 rounded-lg text-white font-bold text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-zinc-500 font-bold">
                      MT
                    </span>
                  </div>

                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="p-2 text-zinc-500 hover:text-rose-400 bg-white rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Optional Ref Input */}
                <input
                  type="text"
                  value={row.transaction_id || ""}
                  onChange={(e) => handleUpdateRow(idx, "transaction_id", e.target.value)}
                  placeholder="ID da transação / código do comprovativo (opcional)..."
                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-700 text-[11px] placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-zinc-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || currentTotal <= 0}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950/50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? "A registar..." : `Processar Split (${currentTotal.toLocaleString("pt-MZ")} MT)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
