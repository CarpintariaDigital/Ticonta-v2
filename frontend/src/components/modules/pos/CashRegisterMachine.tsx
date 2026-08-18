"use client";

import React, { useState } from "react";
import { Banknote, Smartphone, CreditCard, RotateCcw, Delete, CornerDownLeft, Sparkles, Percent } from "lucide-react";
import { SaleSummary, CartItem, PaymentMethod } from "@/types/pos";

interface CashRegisterMachineProps {
  cart: CartItem[];
  summary: SaleSummary;
  onAddItemByValue: (val: number, name?: string) => void;
  onUpdateDiscount: (pct: number) => void;
  onClear: () => void;
  onCompleteSale: (method: PaymentMethod) => void;
  isProcessing?: boolean;
}

export default function CashRegisterMachine({
  cart,
  summary,
  onAddItemByValue,
  onUpdateDiscount,
  onClear,
  onCompleteSale,
  isProcessing,
}: CashRegisterMachineProps) {
  const [currentInput, setCurrentInput] = useState<string>("");
  const [trocoInput, setTrocoInput] = useState<string | null>(null);
  const [activeOperator, setActiveOperator] = useState<string | null>(null);
  const [storedValue, setStoredValue] = useState<number | null>(null);

  const pressKey = (key: string) => {
    if (key === "." && currentInput.includes(".")) return;
    if (currentInput.length >= 10) return;
    setCurrentInput((prev) => prev + key);
  };

  const clearLast = () => {
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  const clearAll = () => {
    setCurrentInput("");
    setTrocoInput(null);
    setActiveOperator(null);
    setStoredValue(null);
    onClear();
  };

  const handleOperator = (op: string) => {
    const val = parseFloat(currentInput);
    if (!isNaN(val)) {
      setStoredValue(val);
      setActiveOperator(op);
      setCurrentInput("");
    }
  };

  const handleAddDirectItem = () => {
    const val = parseFloat(currentInput);
    if (val && val > 0) {
      onAddItemByValue(val, `Artigo Caixa #${cart.length + 1}`);
      setCurrentInput("");
    } else if (storedValue !== null && activeOperator) {
      const current = parseFloat(currentInput) || 0;
      let res = storedValue;
      if (activeOperator === "+") res += current;
      if (activeOperator === "-") res -= current;
      if (activeOperator === "×") res *= current;
      if (activeOperator === "÷" && current !== 0) res /= current;
      if (res > 0) {
        onAddItemByValue(res, `Cálculo Caixa #${cart.length + 1}`);
      }
      setStoredValue(null);
      setActiveOperator(null);
      setCurrentInput("");
    }
  };

  const handleDiscount10 = () => {
    onUpdateDiscount(10);
  };

  const handleIVA = () => {
    // se houver valor digitado, adiciona ao carrinho
    if (currentInput) {
      handleAddDirectItem();
    }
  };

  const handleCalculateTroco = () => {
    const pago = parseFloat(currentInput);
    if (!isNaN(pago) && summary.netTotal > 0) {
      const troco = pago - summary.netTotal;
      setTrocoInput(troco >= 0 ? `${troco.toFixed(2)} MT` : `Faltam ${Math.abs(troco).toFixed(2)} MT`);
      setCurrentInput("");
    }
  };

  const displayAmount = currentInput
    ? parseFloat(currentInput).toLocaleString("pt-MZ", {
        minimumFractionDigits: currentInput.includes(".") ? currentInput.split(".")[1].length : 0,
        maximumFractionDigits: 2,
      })
    : summary.netTotal.toLocaleString("pt-MZ", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

  return (
    <div className="machine w-full max-w-[480px] mx-auto p-4 sm:p-5 rounded-3xl bg-[#101c2e] border-4 border-[#09121f] shadow-2xl font-mono select-none flex flex-col justify-between">
      {/* Machine Top Brand Plate */}
      <div className="flex items-center justify-between bg-[#08121f] rounded-2xl p-2 px-3.5 mb-3 border border-[#162942]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1b2d4f] to-[#1d9e75] flex items-center justify-center font-black text-xs text-white border border-[#2dc4a0] shadow-sm">
            Ti
          </div>
          <div>
            <div className="text-xs font-black text-[#2dc4a0] tracking-widest uppercase">
              TICONTA POS
            </div>
            <div className="text-[8px] text-[#4a7a9b] tracking-wider uppercase">
              MÁQUINA REGISTRADORA MZ
            </div>
          </div>
        </div>

        <div className="screws-cluster">
          <div className="screw" />
          <div className="screw" />
          <div className="screw" />
        </div>
      </div>

      {/* VFD Glowing Precision Display Unit */}
      <div className="vfd-display p-3.5 mb-3.5 rounded-2xl border-2 border-[#09121f]">
        <div className="vfd-scanlines absolute inset-0 opacity-25" />
        <div className="flex justify-between items-center text-[9px] text-[#4a7a9b] uppercase tracking-widest relative z-10 mb-1">
          <span>{currentInput ? "ENTRADA MANUAL DE VALOR" : "TOTAL DA VENDA"}</span>
          <span className="text-[#2dc4a0] font-bold">MZN MOÇAMBIQUE</span>
        </div>

        <div className="text-3xl sm:text-4xl font-black vfd-text tracking-wider min-h-[44px] flex items-baseline justify-end relative z-10">
          <span>{displayAmount}</span>
          <span className="text-sm font-semibold text-[#4a7a9b] ml-1.5">MT</span>
        </div>

        <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#13243a] text-[10px] text-[#4a7a9b] relative z-10">
          <div>
            ITENS: <span className="text-[#2dc4a0] font-bold">{summary.itemCount}</span>
          </div>
          <div>
            TROCO: <span className="text-amber-400 font-bold">{trocoInput || "0.00 MT"}</span>
          </div>
          <div>
            IVA 16%: <span className="text-[#2dc4a0] font-bold">{summary.taxAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Mini Receipt Tape Preview (if items in cart) */}
      {cart.length > 0 && (
        <div className="receipt-strip mb-3 p-2.5 text-xs text-[#1b2d4f] max-h-24 overflow-y-auto">
          <div className="text-center font-bold text-[10px] tracking-wider mb-1 border-b border-dashed border-[#ccc]">
            *** FITA DE CAIXA EM CURSO ***
          </div>
          {cart.map((item, idx) => (
            <div key={item.product.id} className="flex justify-between text-[10px]">
              <span className="truncate max-w-[200px]">
                {item.quantity}x {item.product.name}
              </span>
              <span className="font-bold">{(item.quantity * item.unit_price).toFixed(2)} MT</span>
            </div>
          ))}
        </div>
      )}

      {/* 3D Physical Mechanical Keypad (Numpad & Operators) */}
      <div className="grid grid-cols-4 gap-2 mb-2.5">
        <button
          type="button"
          className="key-mechanical key-num h-12 text-base"
          onClick={() => pressKey("7")}
        >
          7<span className="text-[7px] text-[#4a7a9b] uppercase -mt-1 font-sans">pqrs</span>
        </button>
        <button
          type="button"
          className="key-mechanical key-num h-12 text-base"
          onClick={() => pressKey("8")}
        >
          8<span className="text-[7px] text-[#4a7a9b] uppercase -mt-1 font-sans">tuv</span>
        </button>
        <button
          type="button"
          className="key-mechanical key-num h-12 text-base"
          onClick={() => pressKey("9")}
        >
          9<span className="text-[7px] text-[#4a7a9b] uppercase -mt-1 font-sans">wxyz</span>
        </button>
        <button
          type="button"
          className={`key-mechanical h-12 text-lg ${
            activeOperator === "+" ? "bg-[#28cfa0] text-black" : "key-op"
          }`}
          onClick={() => handleOperator("+")}
        >
          +
        </button>

        <button
          type="button"
          className="key-mechanical key-num h-12 text-base"
          onClick={() => pressKey("4")}
        >
          4<span className="text-[7px] text-[#4a7a9b] uppercase -mt-1 font-sans">ghi</span>
        </button>
        <button
          type="button"
          className="key-mechanical key-num h-12 text-base"
          onClick={() => pressKey("5")}
        >
          5<span className="text-[7px] text-[#4a7a9b] uppercase -mt-1 font-sans">jkl</span>
        </button>
        <button
          type="button"
          className="key-mechanical key-num h-12 text-base"
          onClick={() => pressKey("6")}
        >
          6<span className="text-[7px] text-[#4a7a9b] uppercase -mt-1 font-sans">mno</span>
        </button>
        <button
          type="button"
          className={`key-mechanical h-12 text-lg ${
            activeOperator === "-" ? "bg-[#28cfa0] text-black" : "key-op"
          }`}
          onClick={() => handleOperator("-")}
        >
          −
        </button>

        <button
          type="button"
          className="key-mechanical key-num h-12 text-base"
          onClick={() => pressKey("1")}
        >
          1<span className="text-[7px] text-[#4a7a9b] uppercase -mt-1 font-sans">abc</span>
        </button>
        <button
          type="button"
          className="key-mechanical key-num h-12 text-base"
          onClick={() => pressKey("2")}
        >
          2<span className="text-[7px] text-[#4a7a9b] uppercase -mt-1 font-sans">def</span>
        </button>
        <button
          type="button"
          className="key-mechanical key-num h-12 text-base"
          onClick={() => pressKey("3")}
        >
          3<span className="text-[7px] text-[#4a7a9b] uppercase -mt-1 font-sans">ghi</span>
        </button>
        <button
          type="button"
          className={`key-mechanical h-12 text-lg ${
            activeOperator === "×" ? "bg-[#28cfa0] text-black" : "key-op"
          }`}
          onClick={() => handleOperator("×")}
        >
          ×
        </button>

        <button
          type="button"
          className="key-mechanical key-num h-12 text-base col-span-2"
          onClick={() => pressKey("0")}
        >
          0
        </button>
        <button
          type="button"
          className="key-mechanical key-num h-12 text-base"
          onClick={() => pressKey(".")}
        >
          .
        </button>
        <button
          type="button"
          className={`key-mechanical h-12 text-lg ${
            activeOperator === "÷" ? "bg-[#28cfa0] text-black" : "key-op"
          }`}
          onClick={() => handleOperator("÷")}
        >
          ÷
        </button>

        <button
          type="button"
          className="key-mechanical key-clear h-11 text-xs"
          onClick={clearLast}
        >
          ⌫ DEL
        </button>
        <button
          type="button"
          className="key-mechanical key-clear h-11 text-xs"
          onClick={clearAll}
        >
          C LIMPAR
        </button>
        <button
          type="button"
          className="key-mechanical key-enter h-11 text-xs col-span-2 font-black uppercase tracking-wider"
          onClick={handleAddDirectItem}
        >
          ADICIONAR ITEM ↵
        </button>
      </div>

      {/* Register Function Keys (% Desconto, IVA 16%, Troco) */}
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        <button
          type="button"
          className="key-mechanical key-action h-10 text-[10px] uppercase font-bold tracking-wider"
          onClick={handleDiscount10}
        >
          % DESCONTO
        </button>
        <button
          type="button"
          className="key-mechanical key-action h-10 text-[10px] uppercase font-bold tracking-wider"
          onClick={handleIVA}
        >
          IVA 16%
        </button>
        <button
          type="button"
          className="key-mechanical key-action h-10 text-[10px] uppercase font-bold tracking-wider text-[#2dc4a0]"
          onClick={handleCalculateTroco}
        >
          TROCO
        </button>
      </div>

      {/* Direct Settlement Keys (Dinheiro, M-Pesa, Cartão) */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <button
          type="button"
          disabled={summary.itemCount === 0 && !currentInput}
          onClick={() => {
            if (currentInput) handleAddDirectItem();
            onCompleteSale("cash");
          }}
          className="key-mechanical key-cash h-12 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          <Banknote className="h-4 w-4" />
          DINHEIRO
        </button>
        <button
          type="button"
          disabled={summary.itemCount === 0 && !currentInput}
          onClick={() => {
            if (currentInput) handleAddDirectItem();
            onCompleteSale("mpesa");
          }}
          className="key-mechanical key-mpesa h-12 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          <Smartphone className="h-4 w-4" />
          M-PESA
        </button>
        <button
          type="button"
          disabled={summary.itemCount === 0 && !currentInput}
          onClick={() => {
            if (currentInput) handleAddDirectItem();
            onCompleteSale("card");
          }}
          className="key-mechanical key-card h-12 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          <CreditCard className="h-4 w-4" />
          CARTÃO
        </button>
      </div>

      {/* Machine Footer Plate */}
      <div className="flex items-center justify-between pt-2 border-t border-[#13243a] text-[8px] text-[#4a7a9b] uppercase tracking-wider">
        <span>CARPINTARIA DIGITAL © 2026</span>
        <div className="flex items-center gap-1.5">
          <div className="status-led" />
          <span className="text-[#2dc4a0] font-bold">ONLINE POS</span>
        </div>
        <span>NUIT: 400123456</span>
      </div>
    </div>
  );
}
