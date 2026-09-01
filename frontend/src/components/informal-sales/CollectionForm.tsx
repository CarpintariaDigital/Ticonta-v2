"use client";

import React, { useState } from "react";
import { InformalCustomer, Debit, PartialPaymentCreate } from "@/types/informal_sales";
import {
  DollarSign,
  X,
  Smartphone,
  Wallet,
  Banknote,
  CheckCircle2,
  FileText,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

interface CollectionFormProps {
  customer: InformalCustomer;
  debit?: Debit | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmitPayment: (debitId: number, data: PartialPaymentCreate) => Promise<any>;
}

export const CollectionForm: React.FC<CollectionFormProps> = ({
  customer,
  debit,
  isLoading,
  onClose,
  onSubmitPayment,
}) => {
  const targetOwed = debit ? debit.amount_owed : customer.total_owed;
  const targetDebitId = debit ? debit.id : customer.id; // or selected debit

  const [amount, setAmount] = useState<number>(targetOwed);
  const [paymentMethod, setPaymentMethod] = useState<string>("mpesa");
  const [notes, setNotes] = useState<string>("");
  const [sendNotification, setSendNotification] = useState<boolean>(true);

  const handleQuickAmount = (val: number) => {
    setAmount(Math.min(val, targetOwed));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert("Informe um valor maior que zero.");
      return;
    }

    await onSubmitPayment(targetDebitId, {
      amount,
      payment_method: paymentMethod,
      notes: notes.trim() || undefined,
      send_notification: sendNotification,
    });
  };

  const remaining = Math.max(0, targetOwed - amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-zinc-200/80 rounded-2xl w-full max-w-md p-5 md:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Registar Pagamento / Amortização</h3>
              <p className="text-xs text-zinc-500">Recebimento de fiado</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Context Info */}
        <div className="p-3.5 bg-zinc-50/80 border border-zinc-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 block">Cliente:</span>
            <span className="font-bold text-zinc-900 text-sm">{customer.name}</span>
            {customer.phone && <span className="text-xs text-zinc-500 block">{customer.phone}</span>}
          </div>

          <div className="text-right">
            <span className="text-xs text-zinc-500 block">Total a Dever:</span>
            <span className="font-extrabold text-base text-rose-400">
              {targetOwed.toLocaleString("pt-MZ")} MT
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Paying Now */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
              Valor a Pagar / Amortizar Agora (MT)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-bold">MZN</span>
              <input
                type="number"
                max={targetOwed}
                value={amount || ""}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-extrabold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setAmount(targetOwed)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  amount === targetOwed
                    ? "bg-emerald-600 text-zinc-900 border-emerald-500"
                    : "bg-slate-800 text-zinc-700 border-zinc-200 hover:bg-slate-700"
                }`}
              >
                Quitar Tudo ({targetOwed} MT)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAmount(Math.floor(targetOwed / 2))}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-zinc-700 border border-zinc-200 hover:bg-slate-700"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleQuickAmount(500)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-zinc-700 border border-zinc-200 hover:bg-slate-700"
              >
                500 MT
              </button>
              <button
                type="button"
                onClick={() => handleQuickAmount(1000)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-zinc-700 border border-zinc-200 hover:bg-slate-700"
              >
                1.000 MT
              </button>
            </div>
          </div>

          {/* Remaining Calculation Badge */}
          <div className="p-3 bg-white rounded-xl border border-zinc-200 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Saldo Restante Após Pagamento:</span>
            <span
              className={`font-bold text-sm ${
                remaining === 0 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {remaining === 0 ? "0 MT (Totalmente Quitado! 🎉)" : `${remaining.toLocaleString("pt-MZ")} MT`}
            </span>
          </div>

          {/* Payment Method Pills */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
              Meio de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "mpesa", label: "M-Pesa", icon: Smartphone },
                { id: "emola", label: "E-Mola", icon: Wallet },
                { id: "cash", label: "Dinheiro", icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-emerald-600 text-zinc-900 border-emerald-500 shadow-md font-bold"
                        : "bg-white text-zinc-500 border-zinc-200 hover:text-zinc-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Observação / Recibo
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: TxID M-Pesa ou nota de promessa..."
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* WhatsApp Confirmation Toggle */}
          <div className="flex items-center justify-between p-2.5 bg-zinc-50/80 border border-zinc-200 rounded-xl">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-zinc-700">Enviar recibo no WhatsApp do cliente</span>
            </div>
            <input
              type="checkbox"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded bg-white border-zinc-200 focus:ring-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-zinc-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || amount <= 0}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? "A registar..." : "Confirmar Recebimento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
