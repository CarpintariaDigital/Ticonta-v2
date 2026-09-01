"use client";

import React, { useState } from "react";
import { PaymentMethod, ProcessPaymentInput } from "@/types/payment";
import { PartialPaymentWarning } from "./PartialPaymentWarning";
import {
  Banknote,
  Smartphone,
  Wallet,
  CreditCard,
  Building,
  Layers,
  CheckCircle2,
  X,
  Clock,
  User,
  Phone,
  FileText,
} from "lucide-react";

interface PaymentFormProps {
  saleId: number;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  moduleSource?: string;
  invoiceNumber?: string;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: ProcessPaymentInput) => Promise<any>;
  onOpenSplitPayment: () => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: any; color: string }[] = [
  { id: "cash", label: "Dinheiro (Caixa)", icon: Banknote, color: "from-emerald-600 to-teal-600" },
  { id: "mpesa", label: "M-Pesa (Vodacom)", icon: Smartphone, color: "from-red-600 to-rose-600" },
  { id: "emola", label: "E-Mola (Movitel)", icon: Wallet, color: "from-amber-500 to-yellow-600" },
  { id: "card", label: "Cartão / POS Bancário", icon: CreditCard, color: "from-blue-600 to-indigo-600" },
  { id: "transfer", label: "Transferência (IBAN)", icon: Building, color: "from-purple-600 to-indigo-700" },
];

export const PaymentForm: React.FC<PaymentFormProps> = ({
  saleId,
  totalAmount,
  customerName = "Cliente Geral",
  customerPhone = "",
  moduleSource = "pos",
  invoiceNumber = "",
  isLoading = false,
  onClose,
  onSubmit,
  onOpenSplitPayment,
}) => {
  const [payingAmount, setPayingAmount] = useState<number>(totalAmount);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );

  const isPartial = payingAmount < totalAmount;
  const remaining = Math.max(0, totalAmount - payingAmount);

  const handleQuickPercent = (pct: number) => {
    setPayingAmount(Math.round((totalAmount * pct) / 100));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payingAmount <= 0) {
      alert("O valor do pagamento deve ser maior que zero.");
      return;
    }

    const payload: ProcessPaymentInput = {
      amount_paid: payingAmount,
      payment_method: paymentMethod,
      transaction_id: transactionId.trim() || undefined,
      notes: notes.trim() || undefined,
      due_date: isPartial ? new Date(dueDate).toISOString() : null,
      amount_total: totalAmount,
      module_source: moduleSource,
      invoice_number: invoiceNumber || undefined,
      customer_name: customerName,
      customer_phone: customerPhone || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white border border-zinc-200/80 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 bg-zinc-50/70">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
              Módulo {moduleSource.toUpperCase()} • Venda #{saleId}
            </span>
            <h3 className="text-base md:text-lg font-black text-white">Processar Pagamento</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Customer & Total Strip */}
          <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 border border-zinc-200 rounded-2xl flex items-center justify-between shadow-inner">
            <div className="space-y-0.5">
              <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-400" /> {customerName}
              </span>
              {customerPhone && (
                <span className="text-[11px] text-zinc-500 block">{customerPhone}</span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                Total da Conta
              </span>
              <span className="text-xl font-black text-emerald-400">
                {totalAmount.toLocaleString("pt-MZ")} MT
              </span>
            </div>
          </div>

          {/* Amount Input & Quick Percentages */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Valor a Pagar Agora *
              </label>
              <div className="flex gap-1">
                {[
                  { label: "100%", pct: 100 },
                  { label: "50%", pct: 50 },
                  { label: "25%", pct: 25 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleQuickPercent(p.pct)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-zinc-700 text-[10px] font-bold rounded-lg transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="1"
                max={totalAmount}
                required
                value={payingAmount}
                onChange={(e) => setPayingAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-white text-lg font-black focus:outline-none focus:border-indigo-500 shadow-inner"
              />
              <span className="absolute right-4 top-3.5 text-zinc-500 font-bold text-sm">MT</span>
            </div>
          </div>

          {/* Partial Payment Warning if Amount < Total */}
          {isPartial && (
            <PartialPaymentWarning
              totalAmount={totalAmount}
              payingAmount={payingAmount}
              customerName={customerName}
              dueDate={dueDate}
              onDueDateChange={setDueDate}
            />
          )}

          {/* Payment Method Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Forma de Pagamento
              </label>
              <button
                type="button"
                onClick={onOpenSplitPayment}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" /> Dividir em Vários Métodos
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-950/50 font-bold"
                        : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-200"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg bg-white border border-zinc-200 ${
                        isSelected ? "text-white bg-indigo-700 border-indigo-400" : "text-zinc-500"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* External Transaction Reference / Notes */}
          {(paymentMethod === "mpesa" ||
            paymentMethod === "emola" ||
            paymentMethod === "card" ||
            paymentMethod === "transfer") && (
            <div className="space-y-1 animate-fade-in">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Referência / ID da Transação ({paymentMethod.toUpperCase()})
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Ex: MP260817001 ou código do POS..."
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

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
              disabled={isLoading || payingAmount <= 0}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading
                ? "A processar..."
                : isPartial
                ? `Confirmar Parcial (${payingAmount.toLocaleString("pt-MZ")} MT)`
                : `Liquidar Conta (${payingAmount.toLocaleString("pt-MZ")} MT)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
