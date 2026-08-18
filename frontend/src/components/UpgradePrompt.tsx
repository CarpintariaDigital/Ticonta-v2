"use client";

import React from "react";
import Link from "next/link";
import { Lock, Sparkles, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
  moduleName?: string;
  requiredPlan?: "Pro" | "Enterprise";
  onClose?: () => void;
}

const PLAN_FEATURES: Record<string, { plan: string; price: string; features: string[] }> = {
  restaurant: {
    plan: "Plano Pro",
    price: "2.500 MZN/mês",
    features: [
      "Gestão de Mesas, Comandas e Divisão de Contas",
      "Ecrã de Cozinha Digital (KDS) em tempo real",
      "Módulo de Takeaway e Integração com Estafetas",
      "Contabilidade PGC e RH / Payroll com INSS",
    ],
  },
  hr: {
    plan: "Plano Pro",
    price: "2.500 MZN/mês",
    features: [
      "Processamento Salarial com cálculo automático de INSS e IRPS",
      "Registo de Assiduidade e Faltas",
      "Emissão de Recibos de Vencimento e Mapas Fiscais",
      "Contabilidade Integrada PGC",
    ],
  },
  accounting: {
    plan: "Plano Pro",
    price: "2.500 MZN/mês",
    features: [
      "Plano Geral de Contabilidade (PGC-NIRF) completo",
      "Lançamentos em Diário e Razão Geral",
      "Balanço, Demonstração de Resultados e Mapas de IVA",
      "Exportação de ficheiro SAF-T Moçambique",
    ],
  },
  crm: {
    plan: "Plano Enterprise",
    price: "5.000 MZN/mês",
    features: [
      "Funil de Vendas Kanban e Gestão de Oportunidades",
      "Histórico de Interacções por WhatsApp e Telefone",
      "Métricas de Conversão e Previsão de Receita",
      "Acesso completo a todos os módulos do ecossistema",
    ],
  },
  poultry: {
    plan: "Plano Enterprise",
    price: "5.000 MZN/mês",
    features: [
      "Controlo de Lotes, Poedeiras e Frangos de Corte",
      "Taxa de Postura diária, Mortalidade e Conversão Alimentar (FCR)",
      "Gestão de Ração e Vacinação com Alertas",
      "Relatórios Zootécnicos e Margem por Ovo/Ave",
    ],
  },
  projects: {
    plan: "Plano Enterprise",
    price: "5.000 MZN/mês",
    features: [
      "Gestão de Obras, Empreitadas e Marcenaria por Fases",
      "Controlo de Despesas Reais vs Orçamento Previsto",
      "Tarefas de Equipa e Prazos de Entrega",
      "Cálculo de Rentabilidade por Projecto",
    ],
  },
  auto_services: {
    plan: "Plano Enterprise",
    price: "5.000 MZN/mês",
    features: [
      "Ordens de Serviço e Kanban de Mecânica/Oficina",
      "Scanner e Diagnóstico OBD-II",
      "Customizador de Pintura e Especificações Técnicas",
      "Emissão de Relatórios Técnicos para Clientes",
    ],
  },
};

export default function UpgradePrompt({
  moduleName = "Módulo Especializado",
  requiredPlan = "Pro",
  onClose,
}: UpgradePromptProps) {
  const modKey = moduleName.toLowerCase().replace(/[^a-z_]/g, "");
  const planInfo = PLAN_FEATURES[modKey] || {
    plan: `Plano ${requiredPlan}`,
    price: requiredPlan === "Enterprise" ? "5.000 MZN/mês" : "2.500 MZN/mês",
    features: [
      "Desbloqueio imediato do módulo seleccionado",
      "Suporte prioritário por WhatsApp e Telefone",
      "Backup automático em nuvem e suporte multi-utilizador",
      "Actualizações contínuas sem custos adicionais",
    ],
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10 text-center max-w-2xl mx-auto rounded-3xl border border-zinc-800/80 bg-zinc-900/90 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-lg shadow-amber-500/10">
        <Lock className="h-8 w-8" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-3">
        <Sparkles className="h-3.5 w-3.5" />
        Módulo Exclusivo — {planInfo.plan}
      </div>

      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
        {moduleName} requer o {planInfo.plan}
      </h2>

      <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
        Este recurso não está activo na sua licença actual. Faça o upgrade para expandir as
        capacidades do seu negócio com activação instantânea.
      </p>

      {/* Benefits Card */}
      <div className="w-full text-left bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 mb-6 space-y-2.5">
        <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60 mb-3">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            O que está incluído no {planInfo.plan}:
          </span>
          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            {planInfo.price}
          </span>
        </div>
        {planInfo.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
        <Link href="/pricing" className="w-full sm:w-auto">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
            <span>Ver Todos os Planos</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <a
          href={`https://wa.me/258840000000?text=Olá!%20Gostaria%20de%20activar%20o%20módulo%20de%20${encodeURIComponent(
            moduleName
          )}%20no%20TiConta.`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto"
        >
          <Button
            variant="outline"
            className="w-full border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 h-11 px-6 rounded-xl font-semibold"
          >
            Falar com Suporte (WhatsApp)
          </Button>
        </a>

        {onClose && (
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto text-zinc-400 hover:text-white text-xs h-11"
          >
            Voltar
          </Button>
        )}
      </div>
    </div>
  );
}
