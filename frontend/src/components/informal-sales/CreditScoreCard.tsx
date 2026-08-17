"use client";

import React from "react";
import { InformalCustomer } from "@/types/informal_sales";
import { Star, ShieldCheck, ShieldAlert, TrendingUp, CheckCircle2 } from "lucide-react";

interface CreditScoreCardProps {
  customer: InformalCustomer;
}

export const CreditScoreCard: React.FC<CreditScoreCardProps> = ({ customer }) => {
  const score = customer.payment_reliability;
  const starsCount = Math.round(score);

  const getScoreBadge = () => {
    if (score >= 4.5) {
      return {
        label: "Cliente Confiável / VIP",
        color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        desc: "Excelente histórico de pagamentos e pontualidade.",
        icon: ShieldCheck,
      };
    } else if (score >= 3.0) {
      return {
        label: "Risco Moderado",
        color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        desc: "Paga as contas, com pequenos atrasos ocasionais.",
        icon: ShieldCheck,
      };
    } else {
      return {
        label: "Alto Risco / Atenção",
        color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        desc: "Histórico de dívidas vencidas ou inadimplência.",
        icon: ShieldAlert,
      };
    }
  };

  const badge = getScoreBadge();
  const Icon = badge.icon;

  return (
    <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Score de Confiabilidade
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}>
            <Icon className="w-3 h-3" /> {badge.label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-4 h-4 ${
                s <= starsCount ? "fill-amber-400 text-amber-400" : "fill-slate-800 text-slate-700"
              }`}
            />
          ))}
          <span className="text-sm font-extrabold text-white ml-1">{score.toFixed(1)}/5.0</span>
        </div>
      </div>

      <p className="text-xs text-slate-400">{badge.desc}</p>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
        <div className="p-2 bg-slate-950/60 rounded-lg">
          <span className="text-[10px] text-slate-500 block">Total Comprado</span>
          <span className="font-bold text-slate-200">{customer.total_purchases.toLocaleString("pt-MZ")} MT</span>
        </div>
        <div className="p-2 bg-slate-950/60 rounded-lg">
          <span className="text-[10px] text-slate-500 block">Limite de Fiado Autorizado</span>
          <span className="font-bold text-indigo-300">{customer.trusted_credit_limit.toLocaleString("pt-MZ")} MT</span>
        </div>
      </div>
    </div>
  );
};
