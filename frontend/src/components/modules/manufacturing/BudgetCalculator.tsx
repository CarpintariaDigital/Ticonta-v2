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
      <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider border-b border-zinc-200 pb-2 flex items-center gap-2 font-mono">
          <Calculator className="h-4 w-4 text-emerald-600" />
          Parâmetros de Custo Direto & Mão de Obra
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-600 font-semibold">Custo de Materiais (MZN)</label>
            <Input
              type="number"
              value={materialCost}
              onChange={(e) => setMaterialCost(e.target.value)}
              className="bg-white border-zinc-300 font-mono text-zinc-900 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-600 font-semibold">Horas Estimadas de Trabalho</label>
            <Input
              type="number"
              value={laborHours}
              onChange={(e) => setLaborHours(e.target.value)}
              className="bg-white border-zinc-300 font-mono text-zinc-900 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-600 font-semibold">Taxa Horária Mão de Obra (MZN/h)</label>
            <Input
              type="number"
              value={laborRate}
              onChange={(e) => setLaborRate(e.target.value)}
              className="bg-white border-zinc-300 font-mono text-zinc-900 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-600 font-semibold">Custos Indiretos / Overhead (%)</label>
            <Input
              type="number"
              value={overheadPct}
              onChange={(e) => setOverheadPct(e.target.value)}
              className="bg-white border-zinc-300 font-mono text-zinc-900 rounded-xl"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-zinc-600 font-semibold">Margem de Lucro Desejada (%)</label>
            <Input
              type="number"
              value={marginPct}
              onChange={(e) => setMarginPct(e.target.value)}
              className="bg-white border-zinc-300 font-mono text-zinc-900 rounded-xl"
            />
          </div>
        </div>

        {onCreateWorkOrder && (
          <div className="pt-3 border-t border-zinc-200 space-y-2">
            <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider block font-mono">
              Converter Orçamento em Ordem de Produção (OP)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Descrição da Encomenda (ex: 8 Balcões de Atendimento)"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-white border-zinc-300 text-xs text-zinc-900 rounded-xl"
              />
              <Button
                size="sm"
                onClick={handleSaveAsWorkOrder}
                className="bg-amber-700 hover:bg-amber-800 text-white font-bold shrink-0 rounded-xl font-mono shadow-xs"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                Criar OP
              </Button>
            </div>
            {savedSuccess && (
              <p className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ordem de produção criada com sucesso!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Real-time Calculation Breakdown Preview */}
      <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider border-b border-zinc-200 pb-2 flex items-center gap-2 font-mono">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Desdobramento Financeiro do Orçamento
          </h4>

          {result ? (
            <div className="space-y-2.5 pt-3 text-xs text-zinc-700">
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Custo Total de Materiais:</span>
                <span className="font-mono font-medium text-zinc-900">
                  {result.material_cost.toLocaleString("pt-MZ")} MZN
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Custo Total de Mão de Obra:</span>
                <span className="font-mono font-medium text-zinc-900">
                  {result.labor_cost.toLocaleString("pt-MZ")} MZN
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Custos Indiretos (Overhead):</span>
                <span className="font-mono font-medium text-zinc-900">
                  {result.overhead_cost.toLocaleString("pt-MZ")} MZN
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200 font-bold text-zinc-900">
                <span>Custo Real de Produção:</span>
                <span className="font-mono text-zinc-900">
                  {(result.total_direct_cost + result.overhead_cost).toLocaleString("pt-MZ")} MZN
                </span>
              </div>
              <div className="flex justify-between py-1 text-emerald-800 font-bold">
                <span>Margem de Lucro Bruto ({marginPct}%):</span>
                <span className="font-mono">
                  + {result.profit.toLocaleString("pt-MZ")} MZN
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-6 text-center">A calcular...</p>
          )}
        </div>

        {result && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center space-y-1">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider font-mono">
              Preço Final Proposto ao Cliente
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
              {result.final_price.toLocaleString("pt-MZ")}{" "}
              <span className="text-sm font-normal text-emerald-800">MZN</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
