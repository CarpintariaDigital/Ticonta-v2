"use client";

import React from "react";
import { Receipt, Calendar, CreditCard, ShieldCheck, Calculator } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CostBreakdown } from "@/types/premium";

interface CostBreakdownProps {
  breakdown: CostBreakdown;
}

export const CostBreakdownSummary: React.FC<CostBreakdownProps> = ({ breakdown }) => {
  return (
    <div className="chassis-panel p-5 text-zinc-900 shadow-2xl font-mono space-y-4">
      {/* Hardware Header */}
      <div className="chassis-header">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1b2d4f] text-[#2dc4a0] border border-[#2dc4a0]/40">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              CALCULADORA DE SUBSCRIÇÃO & CUSTOS
            </h3>
            <p className="text-[10px] text-[#4a7a9b]">
              Cálculo contínuo baseado nos módulos licenciados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-[#4a7a9b] bg-[#07101d] px-2.5 py-1 rounded-lg border border-[#162942]">
            <Calendar className="h-3 w-3 text-[#2dc4a0]" />
            <span>FATURAÇÃO: {breakdown.next_billing_date}</span>
          </div>
          <div className="screws-cluster hidden sm:flex">
            <div className="screw" />
            <div className="screw" />
          </div>
        </div>
      </div>

      {/* Ledger Tape Lines */}
      <div className="receipt-strip-dark p-4 space-y-2 text-xs">
        <div className="flex items-center justify-between text-zinc-700 py-1 border-b border-[#1c3150]">
          <span className="font-bold text-white uppercase">PLANO BASE ({breakdown.base_plan}):</span>
          <span className="text-[#2dc4a0] font-bold">{breakdown.base_plan_cost_mzn.toLocaleString("pt-MZ")} MT/mês</span>
        </div>

        {breakdown.enabled_features.length > 0 ? (
          breakdown.enabled_features.map((feat) => (
            <div key={feat.name} className="flex items-center justify-between text-[#4a7a9b] py-1 pl-2">
              <span className="uppercase text-[11px]">+ {feat.name.replace(/_/g, " ")}:</span>
              <span className="text-[#2dc4a0] font-semibold">+{feat.cost_mzn.toLocaleString("pt-MZ")} MT</span>
            </div>
          ))
        ) : (
          <div className="text-zinc-500 italic py-1 pl-2 text-[11px]">Nenhum módulo premium adicional ativo</div>
        )}
      </div>

      {/* Total in VFD Display */}
      <div className="vfd-display p-3.5 flex items-center justify-between">
        <div className="vfd-scanlines absolute inset-0 opacity-30" />
        <span className="text-xs font-black text-zinc-700 uppercase tracking-widest relative z-10">
          TOTAL MENSAL ESTIMADO:
        </span>
        <span className="text-2xl font-black vfd-text relative z-10">
          {breakdown.grand_total_monthly_mzn.toLocaleString("pt-MZ")}{" "}
          <span className="text-xs text-[#4a7a9b] font-normal">MZN</span>
        </span>
      </div>

      {/* Payment Security Footer */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#07101d] border border-[#162942] text-[10px] text-[#4a7a9b]">
        <div className="flex items-center gap-2">
          <CreditCard className="h-3.5 w-3.5 text-[#2dc4a0]" />
          <span>CANAL PREDEFINIDO: <b className="text-white">M-Pesa Débito Direto</b></span>
        </div>

        <div className="flex items-center gap-1 text-[#2dc4a0]">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>COBRANÇA SEGURA CERTIFICADA</span>
        </div>
      </div>
    </div>
  );
};

