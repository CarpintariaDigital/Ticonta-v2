"use client";

import { useEffect, useState } from "react";
import { Calculator, DollarSign, TrendingUp, Save, CheckCircle2 } from "lucide-react";
import { BudgetCalculationInput, BudgetCalculationResult } from "@/types/manufacturing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BudgetCalculatorProps {
  onCalculate: (input: BudgetCalculationInput) => Promise<BudgetCalculationResult>;
  onCreateWorkOrder?: (description: string, budget: number) => Promise<any>;
}

export default function BudgetCalculator({
  onCalculate,
  onCreateWorkOrder,
}: BudgetCalculatorProps) {
  const [materialCost, setMaterialCost] = useState("15000");
  const [laborHours, setLaborHours] = useState("24");
  const [laborRate, setLaborRate] = useState("250");
  const [overheadPct, setOverheadPct] = useState("15");
  const [marginPct, setMarginPct] = useState("30");
  const [result, setResult] = useState<BudgetCalculationResult | null>(null);
  const [projectName, setProjectName] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const runCalculation = async () => {
    const mat = parseFloat(materialCost) || 0;
    const hours = parseFloat(laborHours) || 0;
    const rate = parseFloat(laborRate) || 0;
    const overhead = parseFloat(overheadPct) || 0;
    const margin = parseFloat(marginPct) || 0;

    const res = await onCalculate({
      material_cost: mat,
      labor_hours: hours,
      labor_rate: rate,
      overhead_percentage: overhead,
      margin_percentage: margin,
    });
    setResult(res);
  };

  useEffect(() => {
    runCalculation();
  }, [materialCost, laborHours, laborRate, overheadPct, marginPct]);

  const handleSaveAsWorkOrder = async () => {
    if (!projectName.trim() || !result || !onCreateWorkOrder) return;
    await onCreateWorkOrder(projectName.trim(), result.final_price);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
      {/* Input Parameters Form */}
      <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-emerald-400" />
          Parâmetros de Custo de Fabrico
        </h4>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">
              Custo de Matéria-Prima & Insumos (MZN)
            </label>
            <Input
              type="number"
              value={materialCost}
              onChange={(e) => setMaterialCost(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-xs font-mono"
            />
            <span className="text-[10px] text-zinc-500">Madeira, MDF, colas, puxadores e ferragens</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Horas de Mão de Obra</label>
              <Input
                type="number"
                value={laborHours}
                onChange={(e) => setLaborHours(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Taxa Horária (MZN/h)</label>
              <Input
                type="number"
                value={laborRate}
                onChange={(e) => setLaborRate(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Encargos / Overhead (%)</label>
              <Input
                type="number"
                value={overheadPct}
                onChange={(e) => setOverheadPct(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs font-mono"
              />
              <span className="text-[10px] text-zinc-500">Energia, desgaste de ferramentas</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Margem por Dentro (%)</label>
              <Input
                type="number"
                value={marginPct}
                onChange={(e) => setMarginPct(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs font-mono"
              />
              <span className="text-[10px] text-zinc-500">Margem líquida de lucro</span>
            </div>
          </div>
        </div>

        {onCreateWorkOrder && (
          <div className="pt-4 border-t border-zinc-800 space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Converter em Ordem de Produção (OP)</label>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da peça (ex: Balcão Caixa em Madeira Chanfuta)"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs flex-1"
              />
              <Button
                size="sm"
                onClick={handleSaveAsWorkOrder}
                disabled={!projectName.trim() || !result}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                Criar OP
              </Button>
            </div>
            {savedSuccess && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Ordem de produção criada com sucesso!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Real-time Calculation Breakdown Cards */}
      {result && (
        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
              Demonstrativo Financeiro do Orçamento
            </h4>

            <div className="space-y-3 pt-3">
              <div className="flex justify-between text-xs py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400">1. Custo Matéria-Prima:</span>
                <span className="font-mono text-white">
                  {Number(result.material_cost).toLocaleString("pt-MZ")} MZN
                </span>
              </div>

              <div className="flex justify-between text-xs py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400">
                  2. Mão de Obra ({result.labor_hours}h × {result.labor_rate} MZN):
                </span>
                <span className="font-mono text-white">
                  {Number(result.labor_cost).toLocaleString("pt-MZ")} MZN
                </span>
              </div>

              <div className="flex justify-between text-xs py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400">
                  3. Encargos / Desgaste ({result.overhead_percentage}%):
                </span>
                <span className="font-mono text-white">
                  {Number(result.overhead_cost).toLocaleString("pt-MZ")} MZN
                </span>
              </div>

              <div className="flex justify-between text-xs py-1.5 border-b border-zinc-800 font-bold">
                <span className="text-zinc-300">Custo Total de Produção:</span>
                <span className="font-mono text-amber-400">
                  {Number(result.total_direct_cost).toLocaleString("pt-MZ")} MZN
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-400">
                Preço Final Sugerido ao Cliente
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                Margem: {result.margin_percentage}%
              </span>
            </div>
            <p className="text-2xl font-black text-white font-mono">
              {Number(result.final_price).toLocaleString("pt-MZ")}{" "}
              <span className="text-xs font-normal text-zinc-400">MZN</span>
            </p>
            <div className="text-xs text-emerald-400/90 pt-1 flex justify-between border-t border-emerald-500/20 font-mono">
              <span>Lucro Bruto Previsto:</span>
              <span className="font-bold">+{Number(result.profit).toLocaleString("pt-MZ")} MZN</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
