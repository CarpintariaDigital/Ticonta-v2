"use client";

import React, { useState } from "react";
import { Sparkles, Shield, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingCard } from "@/components/PricingCard";
import { FeatureComparison } from "@/components/FeatureComparison";
import { PRICING_PLANS, ANNUAL_DISCOUNT_PERCENT } from "@/lib/pricing-data";
import { BillingCycle } from "@/types/pricing";
import Link from "next/link";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            Software de Gestão Empresarial Feito para Moçambique
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            Planos Transparentes e à Medida do seu Negócio
          </h1>

          <p className="text-lg text-zinc-400">
            Escolha o plano ideal para a sua empresa. Todos os planos incluem POS Offline-First,
            gestão de stock e faturas em conformidade fiscal.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="pt-6 flex items-center justify-center">
            <div className="relative flex items-center rounded-full border border-zinc-800 bg-zinc-900/90 p-1">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-zinc-800 text-white shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Faturação Mensal
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                  billingCycle === "annual"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>Faturação Anual</span>
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  -{ANNUAL_DISCOUNT_PERCENT}%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} billingCycle={billingCycle} />
          ))}
        </div>

        {/* Detailed Feature Comparison */}
        <div className="pt-12">
          <FeatureComparison />
        </div>

        {/* FAQ & Support Section */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-3xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-white">Tem dúvidas sobre qual o plano ideal?</h3>
          <p className="text-sm text-zinc-400">
            A nossa equipa técnica e comercial está disponível para agendar uma demonstração
            personalizada ou avaliar as necessidades da sua marcenaria, indústria ou loja.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <a
              href="mailto:comercial@carpintaria.digital"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
            >
              Contactar Equipa de Suporte
            </a>
            <Link
              href="/license-activation"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-transparent px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Já tenho uma Chave de Licença
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
