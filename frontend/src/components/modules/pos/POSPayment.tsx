"use client";

import { useState } from "react";
import {
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Percent,
  Loader2,
  Coins,
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
  const paymentMethods: {
    id: PaymentMethod;
    label: string;
    sub: string;
    icon: any;
    keyClass: string;
    activeBorder: string;
  }[] = [
    {
      id: "cash",
      label: "DINHEIRO",
      sub: "Caixa Física",
      icon: Banknote,
      keyClass: "key-cash",
      activeBorder: "border-[#a3e635] ring-2 ring-[#a3e635]/40",
    },
    {
      id: "mpesa",
      label: "M-PESA",
      sub: "Vodacom MZ",
      icon: Smartphone,
      keyClass: "key-mpesa",
      activeBorder: "border-[#2dc4a0] ring-2 ring-[#2dc4a0]/40",
    },
    {
      id: "emola",
      label: "E-MOLA",
      sub: "Movitel MZ",
      icon: Smartphone,
      keyClass: "key-action",
      activeBorder: "border-[#fbbf24] ring-2 ring-[#fbbf24]/40",
    },
    {
      id: "card",
      label: "CARTÃO",
      sub: "POS / Banco",
      icon: CreditCard,
      keyClass: "key-card",
      activeBorder: "border-[#7dd3fc] ring-2 ring-[#7dd3fc]/40",
    },
  ];

  return (
    <div className="flex flex-col h-full chassis-panel p-4 space-y-3.5 font-mono">
      {/* Header */}
      <div className="chassis-header">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1b2d4f] text-[#2dc4a0] border border-[#2dc4a0]/40 shadow-inner">
            <Coins className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              CANAIS DE LIQUIDAÇÃO
            </h3>
            <p className="text-[10px] text-[#4a7a9b]">Selecione a tecla de pagamento</p>
          </div>
        </div>
        <div className="screws-cluster">
          <div className="screw" />
          <div className="screw" />
        </div>
      </div>

      {/* 4 3D Mechanical Payment Keys Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {paymentMethods.map((pm) => {
          const Icon = pm.icon;
          const isSelected = selectedMethod === pm.id;

          return (
            <button
              key={pm.id}
              type="button"
              onClick={() => onSelectMethod(pm.id)}
              className={`key-mechanical ${pm.keyClass} p-3 h-20 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                isSelected ? `${pm.activeBorder} shadow-lg scale-[1.02]` : "opacity-90"
              }`}
            >
              <Icon className="h-5 w-5 mb-1 opacity-90" />
              <span className="text-xs font-black tracking-wider uppercase">{pm.label}</span>
              <span className="text-[9px] opacity-75 uppercase tracking-tight">{pm.sub}</span>
            </button>
          );
        })}
      </div>

      {/* Discount Tactile Keypad */}
      <div className="space-y-1.5 rounded-xl border border-[#162942] bg-[#09121f]/90 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-700 flex items-center gap-1 uppercase tracking-wider">
            <Percent className="h-3 w-3 text-amber-400" />
            DESCONTO DE BALCÃO
          </span>
          <span className="text-xs font-black text-amber-400">{discountPercentage}%</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[0, 5, 10, 15].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => onSetDiscount(pct)}
              className={`key-mechanical h-8 rounded-lg text-xs font-extrabold tracking-wider ${
                discountPercentage === pct
                  ? "bg-[#d97706] text-white border-b-2 border-[#78350f] shadow-[0_2px_0_#451a03]"
                  : "key-action"
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Giant VFD Screen: Total Final da Venda */}
      <div className="flex-1 flex flex-col justify-end space-y-3">
        <div className="vfd-display p-4 text-center">
          <div className="vfd-scanlines absolute inset-0 opacity-30" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#4a7a9b] relative z-10 block">
            /// TOTAL FINAL DA MÁQUINA
          </span>
          <div className="text-3xl sm:text-4xl font-black vfd-text tracking-wider mt-1 relative z-10">
            {summary.netTotal.toFixed(2)}{" "}
            <span className="text-sm font-semibold text-[#4a7a9b]">MZN</span>
          </div>
        </div>

        {/* Action Button: Concluir Venda (Mechanical Enter Key) */}
        <Button
          type="button"
          variant="retro-primary"
          disabled={disabled || isProcessing || summary.itemCount === 0}
          onClick={onCompleteSale}
          className="w-full h-14 font-black text-base uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>A PROCESSAR REGISTO...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span>REGISTAR VENDA ↵</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

