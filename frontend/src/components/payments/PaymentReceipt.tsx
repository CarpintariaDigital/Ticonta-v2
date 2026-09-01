"use client";

import React from "react";
import { PaymentStatusData } from "@/types/payment";
import {
  Printer,
  Share2,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";

interface PaymentReceiptProps {
  receipt: PaymentStatusData;
  onClose: () => void;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ receipt, onClose }) => {
  const isPartial = receipt.status === "partial" || receipt.amount_owed > 0;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const phone = receipt.customer_phone ? receipt.customer_phone.replace(/\D/g, "") : "";
    const text = `*TiConta - Comprovativo de Pagamento*\nRecibo: ${receipt.invoice_number || receipt.payment_id}\nCliente: ${receipt.customer_name}\nTotal: ${receipt.amount_total} MT\nValor Pago: ${receipt.amount_paid} MT\nSaldo Devedor: ${receipt.amount_owed} MT\nStatus: ${receipt.status.toUpperCase()}`;
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-zinc-200/80 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50/80">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Comprovativo de Pagamento</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Area */}
        <div id="printable-receipt" className="p-5 space-y-4 text-xs font-mono bg-white">
          {/* Logo / Company Header */}
          <div className="text-center space-y-0.5 pb-3 border-b border-dashed border-zinc-200">
            <h2 className="text-base font-black text-white font-sans tracking-wide">TiConta Enterprise</h2>
            <p className="text-[10px] text-zinc-500">Sistema de Gestão & Faturação Certificado AT</p>
            <p className="text-[10px] text-indigo-400 font-bold mt-1">
              RECIBO / FATURA: {receipt.invoice_number || `REC-${receipt.payment_id}`}
            </p>
          </div>

          {/* Customer & Date */}
          <div className="space-y-1 text-zinc-700">
            <div className="flex justify-between">
              <span>Cliente:</span>
              <strong className="text-white font-sans">{receipt.customer_name || "Cliente Balcão"}</strong>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>Data/Hora:</span>
              <span>
                {new Date(receipt.created_at).toLocaleString("pt-MZ", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>Módulo:</span>
              <span className="uppercase">{receipt.module_source}</span>
            </div>
          </div>

          {/* Balances Box */}
          <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1.5 font-sans">
            <div className="flex justify-between text-zinc-500 text-xs">
              <span>Valor Total:</span>
              <span className="font-bold text-white">{receipt.amount_total.toLocaleString("pt-MZ")} MT</span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-emerald-400 font-semibold">Valor Amortizado / Pago:</span>
              <span className="font-extrabold text-emerald-400">
                {receipt.amount_paid.toLocaleString("pt-MZ")} MT
              </span>
            </div>

            {isPartial && (
              <div className="flex justify-between text-xs pt-1 border-t border-zinc-200">
                <span className="text-amber-400 font-bold">Saldo Devedor Restante:</span>
                <span className="font-black text-amber-400">
                  {receipt.amount_owed.toLocaleString("pt-MZ")} MT
                </span>
              </div>
            )}

            {receipt.due_date && (
              <div className="flex justify-between text-[11px] text-zinc-500 pt-1">
                <span>Vencimento do Restante:</span>
                <span className="text-amber-300 font-semibold">
                  {new Date(receipt.due_date).toLocaleDateString("pt-MZ")}
                </span>
              </div>
            )}
          </div>

          {/* Transaction History Breakdown */}
          {receipt.transactions && receipt.transactions.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                Detalhes das Amortizações:
              </span>
              <div className="space-y-1">
                {receipt.transactions.map((tx, idx) => (
                  <div
                    key={tx.id || idx}
                    className="flex justify-between text-[11px] bg-white p-1.5 rounded"
                  >
                    <span className="text-zinc-700 capitalize">
                      {tx.payment_method} {tx.transaction_id && `(${tx.transaction_id})`}
                    </span>
                    <strong className="text-white">{tx.amount.toLocaleString("pt-MZ")} MT</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Stamp */}
          <div className="text-center pt-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-sans uppercase tracking-wider ${
                receipt.status === "paid"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }`}
            >
              {receipt.status === "paid" ? "✅ TOTALMENTE LIQUIDADO" : "⏳ PAGAMENTO PARCIAL REGISTADO"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-zinc-200 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" /> Imprimir Recibo
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <MessageSquare className="w-4 h-4" /> Enviar WhatsApp
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-zinc-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
