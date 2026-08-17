"use client";

import React, { useState } from "react";
import { Debit } from "@/types/informal_sales";
import {
  AlertTriangle,
  MessageSquare,
  Phone,
  Clock,
  DollarSign,
  Send,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface OverdueAlertsProps {
  overdueDebits: Debit[];
  onSendReminder: (debitId: number, channel: "whatsapp" | "sms", customMessage?: string) => Promise<any>;
  onOpenCollection: (debit: Debit) => void;
}

export const OverdueAlerts: React.FC<OverdueAlertsProps> = ({
  overdueDebits,
  onSendReminder,
  onOpenCollection,
}) => {
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [sentSuccessId, setSentSuccessId] = useState<number | null>(null);

  const handleSend = async (debitId: number, channel: "whatsapp" | "sms") => {
    setSendingId(debitId);
    try {
      await onSendReminder(debitId, channel);
      setSentSuccessId(debitId);
      setTimeout(() => setSentSuccessId(null), 3000);
    } catch (err) {
      alert("Erro ao enviar lembrete.");
    } finally {
      setSendingId(null);
    }
  };

  const totalOverdueAmount = overdueDebits.reduce((acc, d) => acc + d.amount_owed, 0);

  if (overdueDebits.length === 0) {
    return (
      <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Nenhum Fiado Vencido</h4>
            <p className="text-xs text-slate-400">Todos os clientes estão com as contas em dia!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-4 md:p-5 shadow-2xl space-y-4">
      {/* Alert Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-white">
              Alertas de Cobrança & Fiados Vencidos
            </h3>
            <p className="text-xs text-slate-400">
              {overdueDebits.length} conta(s) em atraso • Total:{" "}
              <span className="font-extrabold text-rose-400">
                {totalOverdueAmount.toLocaleString("pt-MZ")} MT
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Items List */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {overdueDebits.map((debit) => {
          const isSent = sentSuccessId === debit.id;
          const isSending = sendingId === debit.id;

          return (
            <div
              key={debit.id}
              className="p-3 bg-slate-950/70 border border-slate-800 hover:border-rose-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center justify-center font-bold text-xs text-rose-300 shrink-0">
                  {debit.customer_name?.slice(0, 2).toUpperCase() || "CL"}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{debit.customer_name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {debit.days_overdue > 0 ? `+${debit.days_overdue} dias atrasado` : "Venceu hoje"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                    {debit.customer_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" /> {debit.customer_phone}
                      </span>
                    )}
                    {debit.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" /> Venceu em:{" "}
                        {new Date(debit.due_date).toLocaleDateString("pt-MZ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Debt Amount & Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                <div className="text-left sm:text-right pr-2">
                  <span className="text-[10px] text-slate-400 block">Valor Vencido</span>
                  <span className="text-sm font-extrabold text-rose-400">
                    {debit.amount_owed.toLocaleString("pt-MZ")} MT
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenCollection(debit)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow active:scale-95 transition-all flex items-center gap-1"
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Cobrar
                  </button>

                  <button
                    disabled={isSending || isSent || !debit.customer_phone}
                    onClick={() => handleSend(debit.id, "whatsapp")}
                    className={`p-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all ${
                      isSent
                        ? "bg-emerald-600 text-white border-emerald-500"
                        : "bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-600/40"
                    }`}
                    title="Lembrar via WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isSent ? "Enviado!" : "WhatsApp"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
