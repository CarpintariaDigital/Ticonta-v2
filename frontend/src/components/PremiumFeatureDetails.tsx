"use client";

import React from "react";
import { X, CheckCircle2, HelpCircle, Sparkles, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumFeature } from "@/types/premium";

interface PremiumFeatureDetailsProps {
  feature: PremiumFeature | null;
  isOpen: boolean;
  onClose: () => void;
  onToggle: (featureName: string, enable: boolean) => void;
  isLoading?: boolean;
}

export const PremiumFeatureDetails: React.FC<PremiumFeatureDetailsProps> = ({
  feature,
  isOpen,
  onClose,
  onToggle,
  isLoading = false,
}) => {
  if (!isOpen || !feature) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-900 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white uppercase">
                {feature.name.replace(/_/g, " ")}
              </h3>
              <p className="text-xs text-zinc-500">Módulo Premium Adicional</p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="py-4 space-y-4 text-xs">
          <div>
            <h4 className="font-semibold text-white mb-1">Descrição do Recurso</h4>
            <p className="text-zinc-700 leading-relaxed">{feature.description}</p>
          </div>

          {/* Vantagens / Casos de Uso */}
          <div>
            <h4 className="font-semibold text-white mb-2">Principais Benefícios</h4>
            <ul className="space-y-2 text-zinc-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Totalmente integrado ao fluxo de faturação e POS do TiConta</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Ativação instantânea sem necessidade de reinstalação</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Sem contratos de fidelização — cancele ou reative quando desejar</span>
              </li>
            </ul>
          </div>

          {/* Custo */}
          <div className="p-3.5 rounded-xl bg-white border border-zinc-200 flex items-center justify-between">
            <div>
              <span className="text-zinc-500 block text-[11px]">Investimento Mensal</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                +{feature.monthly_cost_mzn.toLocaleString("pt-MZ")} MZN/mês
              </span>
            </div>
            <span className="text-[11px] text-zinc-500">Cobrado na mensalidade da empresa</span>
          </div>

          {/* FAQ Simples */}
          <div className="space-y-2 pt-2 border-t border-zinc-200">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-emerald-400" /> Perguntas Frequentes
            </h4>
            <div className="space-y-2 text-zinc-500 text-[11px]">
              <p>
                <b>Posso cancelar a qualquer momento?</b> Sim, o custo é recalculado na hora e não haverá cobrança na fatura seguinte.
              </p>
              <p>
                <b>Preciso de configuração adicional?</b> Não, ao clicar em ativar o módulo fica imediatamente disponível para todos os operadores da empresa.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-200 bg-white text-zinc-700 hover:text-zinc-900 text-xs"
          >
            Fechar
          </Button>

          <Button
            onClick={() => onToggle(feature.name, !feature.enabled)}
            disabled={isLoading}
            className={`text-xs font-semibold ${
              feature.enabled
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : feature.enabled ? (
              "Desativar Recurso"
            ) : (
              "Ativar Recurso Agora"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
