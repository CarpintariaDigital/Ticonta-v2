"use client";

import { useState } from "react";
import {
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Percent,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { PaymentMethod, SaleSummary } from "@/types/pos";
import { Button } from "@/components/ui/button";

interface POSPaymentProps {
  summary: SaleSummary;
  selectedMethod: PaymentMethod;
  discountPercentage: number;
  isProcessing: boolean;
  onSelectMethod: (method: PaymentMethod) => void;
  onSetDiscount: (discount: number) => void;
  onCompleteSale: () => void;
  disabled?: boolean;
}

export default function POSPayment({
  summary,
  selectedMethod,
  discountPercentage,
  isProcessing,
  onSelectMethod,
  onSetDiscount,
  onCompleteSale,
  disabled,
}: POSPaymentProps) {
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [tempDiscount, setTempDiscount] = useState(discountPercentage.toString());

  const paymentMethods: { id: PaymentMethod; label: string; icon: any; color: string }[] = [
    { id: "cash", label: "Dinheiro / Caixa", icon: Banknote, color: "text-emerald-400 border-emerald-500/30" },
    { id: "mpesa", label: "M-Pesa (Vodacom)", icon: Smartphone, color: "text-red-400 border-red-500/30" },
    { id: "emola", label: "e-Mola (Movitel)", icon: Smartphone, color: "text-amber-400 border-amber-500/30" },
    { id: "card", label: "Cartão / POS", icon: CreditCard, color: "text-blue-400 border-blue-500/30" },
  ];

  const handleApplyDiscount = () => {
    const val = parseFloat(tempDiscount) || 0;
    onSetDiscount(val);
    setShowDiscountModal(false);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-4 space-y-4">
      <div className="border-b border-zinc-800 pb-3">
        <h3 className="text-sm font-bold text-white">Forma de Pagamento</h3>
        <p className="text-xs text-zinc-400">Escolha o canal de liquidação</p>
      </div>

      {/* 4 Payment Buttons Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {paymentMethods.map((pm) => {
          const Icon = pm.icon;
          const isSelected = selectedMethod === pm.id;

          return (
            <button
              key={pm.id}
              type="button"
              onClick={() => onSelectMethod(pm.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? "bg-zinc-800 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/30"
                  : "bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className={`h-6 w-6 mb-1.5 ${pm.color}`} />
              <span className={`text-xs font-semibold ${isSelected ? "text-white" : "text-zinc-300"}`}>
                {pm.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Discount Trigger / Quick percentages */}
      <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
            <Percent className="h-3.5 w-3.5 text-amber-400" />
            Desconto Comercial
          </span>
          <span className="text-xs font-bold text-amber-400">{discountPercentage}%</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[0, 5, 10, 15].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => onSetDiscount(pct)}
              className={`py-1 rounded text-xs font-bold border transition-colors ${
                discountPercentage === pct
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Large Total Display */}
      <div className="flex-1 flex flex-col justify-end space-y-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-center">
          <span className="text-xs font-medium uppercase tracking-wider text-emerald-400/80">
            Total Final da Venda
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight mt-1">
            {summary.netTotal.toFixed(2)}{" "}
            <span className="text-sm font-medium text-zinc-400">MZN</span>
          </h2>
        </div>

        {/* Action Button: Concluir Venda */}
        <Button
          type="button"
          disabled={disabled || isProcessing || summary.itemCount === 0}
          onClick={onCompleteSale}
          className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 rounded-xl transition-all disabled:opacity-40"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              A processar venda...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              CONCLUIR VENDA
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
