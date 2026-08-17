"use client";

import { useState } from "react";
import { Plus, DollarSign, Users, ChevronRight } from "lucide-react";
import { Lead, LeadStage } from "@/types/crm";
import LeadCard from "@/components/modules/crm/LeadCard";
import { Button } from "@/components/ui/button";

interface KanbanBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onMoveStage: (id: number, stage: LeadStage) => void;
  onOpenNewLeadModal: () => void;
}

const STAGES: { id: LeadStage; title: string; color: string; border: string; bg: string }[] = [
  {
    id: "novo",
    title: "1. Novo Lead",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-950/20",
  },
  {
    id: "proposta",
    title: "2. Proposta Enviada",
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-950/20",
  },
  {
    id: "ganho",
    title: "3. Ganho / Fechado",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-950/20",
  },
  {
    id: "perdido",
    title: "4. Perdido",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-950/20",
  },
];

export default function KanbanBoard({
  leads,
  onSelectLead,
  onMoveStage,
  onOpenNewLeadModal,
}: KanbanBoardProps) {
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);

  const getStageLeads = (stage: LeadStage) => leads.filter((l) => l.stage === stage);

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("text/plain", id.toString());
    setDraggedLeadId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData("text/plain");
    const id = parseInt(idStr, 10);
    if (!isNaN(id)) {
      onMoveStage(id, targetStage);
    }
    setDraggedLeadId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {STAGES.map((col) => {
        const colLeads = getStageLeads(col.id);
        const totalValue = colLeads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`rounded-2xl border ${col.border} bg-zinc-950/70 p-3.5 flex flex-col min-h-[550px] transition-all`}
          >
            {/* Column Header */}
            <div className={`rounded-xl ${col.bg} p-3 border ${col.border} mb-3`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${col.color} uppercase tracking-wider`}>
                  {col.title}
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white border border-zinc-800">
                  {colLeads.length}
                </span>
              </div>
              <div className="mt-1.5 text-xs font-mono font-bold text-white">
                {totalValue.toLocaleString("pt-MZ")}{" "}
                <span className="text-[10px] font-normal text-zinc-400">MZN</span>
              </div>
            </div>

            {/* Leads Cards Container */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[650px] pr-1">
              {colLeads.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 text-center p-4 text-[11px] text-zinc-600">
                  <span>Nenhum lead nesta etapa</span>
                </div>
              ) : (
                colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <LeadCard
                      lead={lead}
                      onClick={() => onSelectLead(lead)}
                      onMoveStage={(stage) => onMoveStage(lead.id, stage)}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Quick Action Add */}
            {col.id === "novo" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenNewLeadModal}
                className="mt-3 w-full border border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs h-9"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                Adicionar Lead Rápido
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
