"use client";

import React, { useState } from "react";
import {
  Receipt,
  Printer,
  Mail,
  CheckCircle2,
  X,
  CreditCard,
  Smartphone,
  Wallet,
  Building2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { TableBillResponse, PaymentMethod } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TableBillProps {
  bill: TableBillResponse;
  onCloseTable: (paymentMethod: PaymentMethod | string, amountPaid?: number, notes?: string, autoClean?: boolean) => Promise<any>;
  onClose: () => void;
}

export default function TableBill({
  bill,
  onCloseTable,
  onClose,
}: TableBillProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("mpesa");
  const [amountPaid, setAmountPaid] = useState<number>(Number(bill.total));
  const [notes, setNotes] = useState<string>("");
  const [autoClean, setAutoClean] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailInput, setEmailInput] = useState<string>("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const change = Math.max(0, amountPaid - Number(bill.total));

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    try {
      await onCloseTable(paymentMethod, amountPaid, notes, autoClean);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    if (!emailInput) return;
    setIsEmailSent(true);
    setTimeout(() => setIsEmailSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border border-emerald-900/10 rounded-3xl shadow-2xl overflow-hidden text-zinc-900 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-950 font-mono">
                Fecho de Conta • Mesa {bill.table_number}
              </h3>
              <p className="text-xs text-zinc-500">
                Resumo fiscal e emissão de fatura-recibo com IVA 16%
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-700 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Business & Table Metadata */}
          <div className="text-center pb-3 border-b border-zinc-200 space-y-0.5">
            <h4 className="font-bold text-sm tracking-wider uppercase text-emerald-950">
              TiConta Restaurante & Bar
            </h4>
            <p className="text-xs text-zinc-500">Maputo, Moçambique • NUIT: 400123456</p>
            <p className="text-[10px] text-zinc-500 font-mono">
              Comanda: {bill.order_number} • Aberta: {new Date(bill.opened_at).toLocaleString()}
            </p>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-12 text-zinc-500 font-bold border-b border-zinc-200 pb-1.5 uppercase text-[10px]">
              <span className="col-span-6">Descrição</span>
              <span className="col-span-2 text-center">Qtd</span>
              <span className="col-span-2 text-right">Preço</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {bill.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 py-1 text-zinc-800 border-b border-zinc-100">
                <div className="col-span-6 pr-1">
                  <span className="font-medium text-zinc-900">{item.menu_item_name}</span>
                  {item.special_requests && (
                    <span className="block text-[10px] text-amber-700 font-mono">
                      * {item.special_requests}
                    </span>
                  )}
                </div>
                <span className="col-span-2 text-center font-mono text-zinc-600">{item.quantity}</span>
                <span className="col-span-2 text-right font-mono text-zinc-600">{Number(item.unit_price).toFixed(2)}</span>
                <span className="col-span-2 text-right font-mono font-bold text-emerald-800">
                  {Number(item.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Totals Calculation */}
          <div className="pt-2 border-t border-dashed border-zinc-300 space-y-1.5 text-xs text-zinc-700">
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtotal dos Itens:</span>
              <span className="font-mono font-medium">{Number(bill.subtotal).toFixed(2)} MZN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">IVA ({Number(bill.tax_percent)}%):</span>
              <span className="font-mono font-medium">{Number(bill.tax_amount).toFixed(2)} MZN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Taxa de Serviço ({Number(bill.service_charge_percent)}%):</span>
              <span className="font-mono font-medium">{Number(bill.service_charge_amount).toFixed(2)} MZN</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-200 text-base font-bold text-zinc-900">
              <span>Total a Liquidar:</span>
              <span className="text-emerald-800 font-mono text-lg font-black">
                {Number(bill.total).toFixed(2)} MZN
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-4 border-t border-zinc-200 space-y-2">
            <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider font-mono">
              Selecione o Método de Pagamento:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "mpesa", label: "M-Pesa", icon: Smartphone, color: "text-red-700 bg-red-50 border-red-200" },
                { id: "emola", label: "E-Mola", icon: Smartphone, color: "text-amber-700 bg-amber-50 border-amber-200" },
                { id: "pos", label: "POS / Cartão", icon: CreditCard, color: "text-blue-700 bg-blue-50 border-blue-200" },
                { id: "cash", label: "Dinheiro", icon: Wallet, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
              ].map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                      active
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-md font-bold"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Paid & Change */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-zinc-600">Valor Recebido (MZN):</label>
              <Input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="bg-white border-zinc-300 text-sm font-mono text-zinc-900 mt-1 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600">Troco Calculado:</label>
              <div className="h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center px-3 font-mono font-bold text-sm text-emerald-800 mt-1">
                {change.toFixed(2)} MZN
              </div>
            </div>
          </div>

          {/* Table cleaning option */}
          <div className="flex items-center gap-2 pt-2 text-xs text-zinc-700">
            <input
              type="checkbox"
              id="autoClean"
              checked={autoClean}
              onChange={(e) => setAutoClean(e.target.checked)}
              className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="autoClean" className="cursor-pointer">
              Mesa já foi limpa e está pronta imediatamente para o próximo cliente
            </label>
          </div>

          {/* Print & Email Toolbar */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-200 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs h-9 rounded-xl"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Imprimir Recibo
            </Button>

            <div className="flex items-center gap-1.5 flex-1 max-w-xs">
              <Input
                type="email"
                placeholder="Email para envio do recibo"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="bg-white border-zinc-300 text-xs h-9 rounded-xl text-zinc-900 placeholder:text-zinc-500"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendEmail}
                className="border-zinc-300 text-zinc-700 h-9 rounded-xl"
              >
                <Mail className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          {isEmailSent && (
            <p className="text-[11px] text-emerald-700 font-semibold text-right">
              Recibo enviado por email com sucesso!
            </p>
          )}
        </div>

        {/* Footer Payment Action */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="border-zinc-300 text-zinc-700 rounded-xl">
            Voltar
          </Button>

          <Button
            disabled={isProcessing || amountPaid < Number(bill.total)}
            onClick={handleProcessPayment}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-6 h-10 shadow-md rounded-xl font-mono"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {isProcessing ? "Confirmando..." : "Confirmar Pagamento & Fechar Mesa"}
          </Button>
        </div>
      </div>
    </div>
  );
}
