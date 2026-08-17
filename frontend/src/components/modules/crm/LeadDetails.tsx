"use client";

import { useState } from "react";
import {
  X,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Share2,
  Trash2,
} from "lucide-react";
import { CreateInteractionInput, Lead, LeadStage } from "@/types/crm";
import InteractionTimeline from "@/components/modules/crm/InteractionTimeline";
import { Button } from "@/components/ui/button";

interface LeadDetailsProps {
  lead: Lead;
  onClose: () => void;
  onMoveStage: (id: number, stage: LeadStage) => Promise<void>;
  onDeleteLead: (id: number) => Promise<void>;
  onAddInteraction: (leadId: number, data: CreateInteractionInput) => Promise<any>;
}

export default function LeadDetails({
  lead,
  onClose,
  onMoveStage,
  onDeleteLead,
  onAddInteraction,
}: LeadDetailsProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "info">("timeline");

  const STAGE_LABELS: Record<LeadStage, { label: string; color: string; border: string; bg: string }> = {
    novo: { label: "Novo Lead", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
    proposta: { label: "Proposta", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" },
    ganho: { label: "Ganho", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
    perdido: { label: "Perdido", color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="flex h-[88vh] w-full max-w-3xl flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{lead.name}</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  STAGE_LABELS[lead.stage].bg
                } ${STAGE_LABELS[lead.stage].border} ${STAGE_LABELS[lead.stage].color}`}
              >
                {STAGE_LABELS[lead.stage].label}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Valor: <b className="text-white">{Number(lead.value).toLocaleString("pt-MZ")} MZN</b> •
              Probabilidade: <b className="text-emerald-400">{lead.probability}%</b>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-900/60 px-6 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-zinc-400 mr-1">Mover Estágio:</span>
            {(["novo", "proposta", "ganho", "perdido"] as LeadStage[]).map((st) => (
              <button
                key={st}
                disabled={lead.stage === st}
                onClick={() => onMoveStage(lead.id, st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  lead.stage === st
                    ? "bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed"
                    : st === "ganho"
                    ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600 hover:text-white"
                    : st === "perdido"
                    ? "bg-red-600/20 text-red-300 border-red-500/30 hover:bg-red-600 hover:text-white"
                    : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800"
                }`}
              >
                {STAGE_LABELS[st].label}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteLead(lead.id)}
            className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 text-xs h-8 px-2"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Eliminar
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 px-6 bg-zinc-950/40">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "timeline"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Histórico & Interações ({lead.interactions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "info"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Detalhes do Lead
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "timeline" ? (
            <InteractionTimeline
              leadId={lead.id}
              interactions={lead.interactions || []}
              onAddInteraction={(data) => onAddInteraction(lead.id, data)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Dados de Contacto
                </span>
                <div className="flex justify-between border-b border-zinc-800/40 pb-1.5">
                  <span className="text-zinc-500">Telefone:</span>
                  <span className="font-mono text-white">{lead.phone || "Não informado"}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/40 pb-1.5">
                  <span className="text-zinc-500">Email:</span>
                  <span className="text-white">{lead.email || "Não informado"}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/40 pb-1.5">
                  <span className="text-zinc-500">Canal de Captação:</span>
                  <span className="uppercase text-emerald-400 font-semibold">{lead.source}</span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Métricas da Proposta
                </span>
                <div className="flex justify-between border-b border-zinc-800/40 pb-1.5">
                  <span className="text-zinc-500">Data de Criação:</span>
                  <span className="font-mono text-zinc-300">
                    {new Date(lead.created_at).toLocaleDateString("pt-MZ")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/40 pb-1.5">
                  <span className="text-zinc-500">Última Atualização:</span>
                  <span className="font-mono text-zinc-300">
                    {new Date(lead.updated_at).toLocaleDateString("pt-MZ")}
                  </span>
                </div>
                <div className="pt-2">
                  <span className="text-zinc-500 block mb-1">Notas / Requisitos:</span>
                  <p className="text-zinc-300 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                    {lead.notes || "Nenhuma observação registada."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
