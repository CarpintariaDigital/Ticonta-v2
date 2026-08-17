"use client";

import React from "react";
import { Receipt, Calendar, CreditCard, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CostBreakdown } from "@/types/premium";

interface CostBreakdownProps {
  breakdown: CostBreakdown;
}

export const CostBreakdownSummary: React.FC<CostBreakdownProps> = ({ breakdown }) => {
  return (
    <Card className="border-zinc-800 bg-zinc-900/90 text-zinc-100 shadow-xl">
      <CardHeader className="pb-3 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-400" />
              Resumo da Subscrição Mensal
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Valores calculados em tempo real de acordo com os módulos ativos
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
            <Calendar className="h-3.5 w-3.5 text-emerald-400" />
            <span>Próxima Fatura: {breakdown.next_billing_date}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Discriminativo */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-300 py-1 border-b border-zinc-800/60">
            <span className="font-semibold text-white">Plano Base ({breakdown.base_plan}):</span>
            <span className="font-mono">{breakdown.base_plan_cost_mzn.toLocaleString("pt-MZ")} MZN/mês</span>
          </div>

          {breakdown.enabled_features.length > 0 ? (
            breakdown.enabled_features.map((feat) => (
              <div key={feat.name} className="flex items-center justify-between text-zinc-400 py-1 pl-2">
                <span className="capitalize">+ {feat.name.replace(/_/g, " ")}:</span>
                <span className="font-mono text-emerald-400">+{feat.cost_mzn.toLocaleString("pt-MZ")} MZN</span>
              </div>
            ))
          ) : (
            <div className="text-zinc-500 italic py-1 pl-2">Nenhum módulo premium adicional ativo</div>
          )}

          <div className="flex items-center justify-between text-base font-bold text-white pt-3 border-t border-zinc-700">
            <span>TOTAL MENSAL:</span>
            <span className="text-emerald-400 font-mono text-xl">
              {breakdown.grand_total_monthly_mzn.toLocaleString("pt-MZ")} MZN
            </span>
          </div>
        </div>

        {/* Informações de Pagamento */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-400" />
            <span>Método predefinido: <b>M-Pesa Direct Debit</b></span>
          </div>

          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Cobrança Segura</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
