"use client";

import React from "react";
import { SaleWithDebitResponse } from "@/types/informal_sales";
import {
  CheckCircle2,
  X,
  Printer,
  Share2,
  MessageSquare,
  Receipt,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface ReceiptModalProps {
  receipt: SaleWithDebitResponse;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const formattedAmount = `${receipt.total_amount.toLocaleString("pt-MZ")} MT`;
    const formattedPaid = `${receipt.amount_paid_now.toLocaleString("pt-MZ")} MT`;
    const formattedOwed = `${receipt.amount_owed.toLocaleString("pt-MZ")} MT`;

    const text =
      receipt.amount_owed > 0
        ? `*COMPROVATIVO DE VENDA - TICONTAMZ*\n\n` +
          `Olá *${receipt.customer_name}*!\n` +
          `Fatura: #${receipt.invoice_number}\n` +
          `Total da Compra: ${formattedAmount}\n` +
          `Entrada Paga: ${formattedPaid}\n` +
          `*Saldo a Dever (Fiado): ${formattedOwed}*\n` +
          (receipt.due_date ? `Data Limite: ${new Date(receipt.due_date).toLocaleDateString("pt-MZ")}\n\n` : `\n`) +
          `Agradecemos a sua preferência e confiança!`
        : `*RECIBO DE VENDA - TICONTAMZ*\n\n` +
          `Olá *${receipt.customer_name}*!\n` +
          `Fatura: #${receipt.invoice_number}\n` +
          `Total Pago: ${formattedAmount}\n` +
          `Status: *Totalmente Quitado*\n\n` +
          `Muito obrigado pela preferência!`;

    const phoneClean = receipt.customer_phone ? receipt.customer_phone.replace(/\D/g, "") : "";
    const url = phoneClean
      ? `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm p-5 md:p-6 shadow-2xl space-y-4 text-center">
        {/* Header */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">Venda Registada com Sucesso!</h3>
          <p className="text-xs text-slate-400">Fatura: #{receipt.invoice_number}</p>
        </div>

        {/* Itemized Thermal Receipt Box */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left space-y-2 font-mono text-xs text-slate-300">
          <div className="flex justify-between pb-2 border-b border-slate-800 font-sans">
            <span className="text-slate-400">Cliente:</span>
            <span className="font-bold text-white">{receipt.customer_name}</span>
          </div>

          <div className="flex justify-between pt-1">
            <span className="text-slate-400">Valor Total:</span>
            <span className="font-bold text-white">{receipt.total_amount.toLocaleString("pt-MZ")} MT</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Valor Pago (Entrada):</span>
            <span className="font-bold text-emerald-400">
              {receipt.amount_paid_now.toLocaleString("pt-MZ")} MT
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-800">
            <span className="text-slate-400 font-sans font-bold">Saldo a Dever:</span>
            <span
              className={`font-sans font-extrabold text-sm ${
                receipt.amount_owed > 0 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {receipt.amount_owed > 0
                ? `${receipt.amount_owed.toLocaleString("pt-MZ")} MT (Fiado)`
                : "0 MT (Quitado)"}
            </span>
          </div>

          {receipt.due_date && (
            <div className="flex justify-between pt-1 text-[11px] text-amber-400 font-sans">
              <span>Prometido Para:</span>
              <span>{new Date(receipt.due_date).toLocaleDateString("pt-MZ")}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> Enviar Comprovativo no WhatsApp
          </button>

          <button
            onClick={handlePrint}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Imprimir Talão
          </button>
        </div>
      </div>
    </div>
  );
};
