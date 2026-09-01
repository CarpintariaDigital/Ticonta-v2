"use client";

import React, { useState } from "react";
import {
  Split,
  Users,
  DollarSign,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Smartphone,
  Wallet,
} from "lucide-react";
import { RestaurantOrder, SplitBillResponse } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BillSplitterProps {
  order: RestaurantOrder;
  onSplitBill: (numBills?: number, customSplits?: any[]) => Promise<any>;
  onClose: () => void;
}

export default function BillSplitter({
  order,
  onSplitBill,
  onClose,
}: BillSplitterProps) {
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");
  const [numPeople, setNumPeople] = useState<number>(order.guest_count || 2);
  const [customPeople, setCustomPeople] = useState<
    Array<{ guest_name: string; amount: number; payment_method: string }>
  >([
    { guest_name: "Pessoa 1", amount: Math.round(order.total / 2), payment_method: "mpesa" },
    { guest_name: "Pessoa 2", amount: Math.round(order.total - Math.round(order.total / 2)), payment_method: "pos" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [splitResult, setSplitResult] = useState<SplitBillResponse | null>(null);

  const totalAmount = Number(order.total);
  const equalSplitAmount = numPeople > 0 ? (totalAmount / numPeople).toFixed(2) : "0.00";

  const customTotal = customPeople.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const customRemaining = totalAmount - customTotal;

  const handleAddCustomPerson = () => {
    const nextIdx = customPeople.length + 1;
    const remainingToGive = Math.max(0, customRemaining);
    setCustomPeople([
      ...customPeople,
      { guest_name: `Pessoa ${nextIdx}`, amount: remainingToGive, payment_method: "cash" },
    ]);
  };

  const handleRemoveCustomPerson = (index: number) => {
    if (customPeople.length <= 1) return;
    setCustomPeople(customPeople.filter((_, i) => i !== index));
  };

  const handleUpdateCustomPerson = (index: number, field: string, value: any) => {
    const updated = [...customPeople];
    updated[index] = { ...updated[index], [field]: value };
    setCustomPeople(updated);
  };

  const handleConfirmSplit = async () => {
    setIsSubmitting(true);
    try {
      if (splitMode === "equal") {
        const res = await onSplitBill(numPeople, undefined);
        setSplitResult(res);
      } else {
        const res = await onSplitBill(undefined, customPeople);
        setSplitResult(res);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-2xl space-y-5 text-zinc-900 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-950 font-mono">
                Dividir Conta • Comanda {order.order_number}
              </h3>
              <p className="text-xs text-zinc-500">
                Total da Comanda: <strong className="text-emerald-800 font-mono">{totalAmount.toFixed(2)} MZN</strong>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-700 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
          <button
            onClick={() => setSplitMode("equal")}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              splitMode === "equal"
                ? "bg-white text-emerald-950 shadow-xs border border-zinc-200 font-bold"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Divisão Igualitária (N pessoas)
          </button>
          <button
            onClick={() => setSplitMode("custom")}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              splitMode === "custom"
                ? "bg-white text-emerald-950 shadow-xs border border-zinc-200 font-bold"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Valores Personalizados
          </button>
        </div>

        {/* EQUAL MODE */}
        {splitMode === "equal" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <span className="text-xs font-semibold text-zinc-600">Número de Pessoas</span>
                  <div className="text-lg font-black text-zinc-900 font-mono">{numPeople} Clientes</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                  className="w-10 h-10 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setNumPeople(numPeople + 1)}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Per-person breakdown preview */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <span className="text-xs text-zinc-500 font-medium">Valor a pagar por pessoa</span>
              <div className="text-3xl font-black text-emerald-800 font-mono">
                {equalSplitAmount} MZN
              </div>
              <p className="text-[11px] text-zinc-500">
                Inclui IVA (16%) e taxa de serviço proporcionais
              </p>
            </div>
          </div>
        )}

        {/* CUSTOM MODE */}
        {splitMode === "custom" && (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {customPeople.map((person, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200"
              >
                <Input
                  value={person.guest_name}
                  onChange={(e) => handleUpdateCustomPerson(idx, "guest_name", e.target.value)}
                  placeholder="Nome"
                  className="w-32 bg-white border-zinc-300 text-xs h-8 text-zinc-900"
                />

                <div className="flex-1 relative">
                  <Input
                    type="number"
                    value={person.amount}
                    onChange={(e) => handleUpdateCustomPerson(idx, "amount", parseFloat(e.target.value) || 0)}
                    placeholder="Valor"
                    className="pl-7 bg-white border-zinc-300 text-xs h-8 text-zinc-900 font-mono"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
                    MZN
                  </span>
                </div>

                <select
                  value={person.payment_method}
                  onChange={(e) => handleUpdateCustomPerson(idx, "payment_method", e.target.value)}
                  className="bg-white border border-zinc-300 rounded-lg text-xs h-8 px-2 text-zinc-900"
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="emola">E-Mola</option>
                  <option value="pos">POS / Cartão</option>
                  <option value="cash">Dinheiro</option>
                </select>

                <button
                  onClick={() => handleRemoveCustomPerson(idx)}
                  className="w-8 h-8 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddCustomPerson}
              className="w-full border-dashed border-zinc-300 text-zinc-700 text-xs h-8 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Adicionar Pessoa
            </Button>

            {/* Custom Remaining Balance Warning */}
            <div className="flex justify-between items-center text-xs pt-1 px-1">
              <span className="text-zinc-500">Total Alocado: <strong className="text-zinc-900 font-mono">{customTotal.toFixed(2)} MZN</strong></span>
              <span className={Math.abs(customRemaining) < 0.01 ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                Falta Alocar: {customRemaining.toFixed(2)} MZN
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="border-zinc-300 text-zinc-700 rounded-xl">
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={isSubmitting}
            onClick={handleConfirmSplit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
          >
            <Split className="w-4 h-4 mr-1.5" />
            {isSubmitting ? "Processando..." : "Confirmar Divisão"}
          </Button>
        </div>
      </div>
    </div>
  );
}
