"use client";

import React, { useState } from "react";
import { Sparkles, Shield, RefreshCw, Zap, CheckCircle2, AlertCircle, Layers } from "lucide-react";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { PremiumFeatureDetails } from "@/components/PremiumFeatureDetails";
import { CostBreakdownSummary } from "@/components/CostBreakdown";
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures";
import { PremiumFeature } from "@/types/premium";
import { Button } from "@/components/ui/button";

export default function PremiumMarketplacePage() {
  const {
    features,
    costBreakdown,
    isLoading,
    actionLoading,
    error,
    enableFeature,
    disableFeature,
    refetch,
    clearError,
  } = usePremiumFeatures();

  const [selectedFeature, setSelectedFeature] = useState<PremiumFeature | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleToggle = async (featureName: string, enable: boolean) => {
    clearError();
    setSuccessNotice(null);
    try {
      if (enable) {
        await enableFeature(featureName);
        setSuccessNotice(`✅ Módulo '${featureName.replace(/_/g, " ")}' ativado com sucesso!`);
      } else {
        await disableFeature(featureName);
        setSuccessNotice(`ℹ️ Módulo '${featureName.replace(/_/g, " ")}' foi desativado.`);
      }
      if (isDetailsOpen) {
        setIsDetailsOpen(false);
      }
    } catch {
      // Erro tratado pela store
    }
  };

  const handleOpenDetails = (feature: PremiumFeature) => {
    setSelectedFeature(feature);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-8 max-w-7xl mx-auto">
      {/* 1. Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            MARKETPLACE DE RECURSOS PREMIUM
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Potencialize o seu TiConta
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Ative funcionalidades avançadas sob demanda. Pague apenas pelo que a sua empresa realmente utiliza, com cálculo de mensalidade transparente e em tempo real.
          </p>
        </div>

        <div className="absolute right-6 bottom-6 hidden lg:flex items-center gap-4 text-emerald-400/20">
          <Layers className="h-32 w-32" />
        </div>
      </div>

      {/* Alertas de Ação */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between text-xs text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={clearError} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {successNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* 2. Grid de Features & Resumo de Custos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Recursos (2 Colunas) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-400" />
              Módulos Disponíveis ({features.length})
            </h2>

            <Button
              size="sm"
              variant="outline"
              onClick={refetch}
              disabled={isLoading}
              className="border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:text-white h-8"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <PremiumFeatureCard
                key={feature.name}
                feature={feature}
                onToggle={handleToggle}
                onOpenDetails={handleOpenDetails}
                isLoading={actionLoading === feature.name}
              />
            ))}
          </div>
        </div>

        {/* Resumo da Mensalidade (1 Coluna) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            Faturação & Subscrição
          </h2>

          {costBreakdown && <CostBreakdownSummary breakdown={costBreakdown} />}
        </div>
      </div>

      {/* Modal de Detalhes */}
      <PremiumFeatureDetails
        feature={selectedFeature}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onToggle={handleToggle}
        isLoading={selectedFeature ? actionLoading === selectedFeature.name : false}
      />
    </div>
  );
}
