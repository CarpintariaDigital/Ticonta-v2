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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 my-auto">
        {/* Receipt Header */}
        <div className="p-6 bg-gradient-to-b from-zinc-800/80 to-zinc-900 border-b border-zinc-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Conta de Mesa • {bill.order_number}
              </h2>
              <p className="text-xs text-zinc-400">
                Mesa: <strong>{bill.table_number || "Balcão"}</strong> • {bill.guest_count} Clientes
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Company & Restaurant Tax Header */}
          <div className="text-center pb-3 border-b border-dashed border-zinc-700/80 space-y-0.5">
            <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wide">
              TiConta Restaurante & Bar Lda
            </h3>
            <p className="text-[11px] text-zinc-400">NUIT: 400123789 • Maputo, Moçambique</p>
            <p className="text-[10px] text-zinc-500 font-mono">
              Comanda: {bill.order_number} • Aberta: {new Date(bill.opened_at).toLocaleString()}
            </p>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-12 text-zinc-400 font-semibold border-b border-zinc-800 pb-1.5">
              <span className="col-span-6">Descrição</span>
              <span className="col-span-2 text-center">Qtd</span>
              <span className="col-span-2 text-right">Preço</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {bill.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 py-1 text-zinc-200 border-b border-zinc-800/40">
                <div className="col-span-6 pr-1">
                  <span className="font-medium">{item.menu_item_name}</span>
                  {item.special_requests && (
                    <span className="block text-[10px] text-amber-400 font-mono">
                      * {item.special_requests}
                    </span>
                  )}
                </div>
                <span className="col-span-2 text-center font-mono">{item.quantity}</span>
                <span className="col-span-2 text-right font-mono">{Number(item.unit_price).toFixed(2)}</span>
                <span className="col-span-2 text-right font-mono font-bold text-emerald-400">
                  {Number(item.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Totals Calculation */}
          <div className="pt-2 border-t border-dashed border-zinc-700/80 space-y-1.5 text-xs text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-400">Subtotal dos Itens:</span>
              <span className="font-mono">{Number(bill.subtotal).toFixed(2)} MZN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">IVA ({Number(bill.tax_percent)}%):</span>
              <span className="font-mono">{Number(bill.tax_amount).toFixed(2)} MZN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Taxa de Serviço ({Number(bill.service_charge_percent)}%):</span>
              <span className="font-mono">{Number(bill.service_charge_amount).toFixed(2)} MZN</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-700 text-base font-bold text-white">
              <span>Total a Liquidar:</span>
              <span className="text-emerald-400 font-mono text-lg">
                {Number(bill.total).toFixed(2)} MZN
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-4 border-t border-zinc-800 space-y-2">
            <label className="text-xs font-semibold text-zinc-300">
              Selecione o Método de Pagamento:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "mpesa", label: "M-Pesa", icon: Smartphone },
                { id: "emola", label: "E-Mola", icon: Smartphone },
                { id: "pos", label: "POS / Cartão", icon: CreditCard },
                { id: "cash", label: "Dinheiro", icon: Wallet },
              ].map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      active
                        ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-md"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
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
              <label className="text-xs font-medium text-zinc-400">Valor Recebido (MZN):</label>
              <Input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="bg-zinc-950 border-zinc-800 text-sm font-mono text-zinc-100 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Troco Calculado:</label>
              <div className="h-10 rounded-md bg-zinc-950 border border-zinc-800 flex items-center px-3 font-mono font-bold text-sm text-emerald-400 mt-1">
                {change.toFixed(2)} MZN
              </div>
            </div>
          </div>

          {/* Table cleaning option */}
          <div className="flex items-center gap-2 pt-2 text-xs text-zinc-300">
            <input
              type="checkbox"
              id="autoClean"
              checked={autoClean}
              onChange={(e) => setAutoClean(e.target.checked)}
              className="rounded bg-zinc-950 border-zinc-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="autoClean" className="cursor-pointer">
              Mesa já foi limpa e está pronta imediatamente para o próximo cliente
            </label>
          </div>

          {/* Print & Email Toolbar */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-zinc-700 text-zinc-300 text-xs h-9"
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
                className="bg-zinc-950 border-zinc-800 text-xs h-9"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendEmail}
                className="border-zinc-700 text-zinc-300 h-9"
              >
                <Mail className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          {isEmailSent && (
            <p className="text-[11px] text-emerald-400 text-right">
              Recibo enviado por email com sucesso!
            </p>
          )}
        </div>

        {/* Footer Payment Action */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300">
            Voltar
          </Button>

          <Button
            disabled={isProcessing || amountPaid < Number(bill.total)}
            onClick={handleProcessPayment}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 h-10 shadow-lg shadow-emerald-950/50"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {isProcessing ? "Confirmando..." : "Confirmar Pagamento & Fechar Mesa"}
          </Button>
        </div>
      </div>
    </div>
  );
}
