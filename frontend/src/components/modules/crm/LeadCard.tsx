"use client";

import { Mail, Phone, Clock, ArrowRight, MessageSquare } from "lucide-react";
import { Lead, LeadStage } from "@/types/crm";

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  onMoveStage?: (stage: LeadStage) => void;
}

export default function LeadCard({ lead, onClick, onMoveStage }: LeadCardProps) {
  const getDaysInStage = () => {
    const updated = new Date(lead.updated_at || lead.created_at);
    const now = new Date();
    const diff = Math.floor((now.getTime() - updated.getTime()) / (1000 * 3600 * 24));
    return diff <= 0 ? "Hoje" : `${diff}d atrás`;
  };

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      whatsapp: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      website: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      referral: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      direct: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
      phone: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    return colors[source] || "bg-zinc-800 text-zinc-400";
  };

  return (
    <div
      onClick={onClick}
      className="group relative rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 shadow-sm hover:border-zinc-700 hover:bg-zinc-900 transition-all cursor-pointer space-y-3"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
          {lead.name}
        </h4>
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold border ${getSourceBadge(
            lead.source
          )}`}
        >
          {lead.source}
        </span>
      </div>

      {/* Contacts Info */}
      <div className="space-y-1 text-[11px] text-zinc-400">
        {lead.phone && (
          <div className="flex items-center gap-1.5 truncate">
            <Phone className="h-3 w-3 text-zinc-500 shrink-0" />
            <span className="truncate">{lead.phone}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="h-3 w-3 text-zinc-500 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
      </div>

      {/* Value & Probability */}
      <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2 text-xs font-mono">
        <div>
          <span className="text-[10px] text-zinc-500 block">Valor Estimado</span>
          <span className="font-bold text-white">
            {Number(lead.value).toLocaleString("pt-MZ")} <span className="text-[9px] text-zinc-400">MZN</span>
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-zinc-500 block">Probabilidade</span>
          <span
            className={`font-bold ${
              lead.probability >= 70
                ? "text-emerald-400"
                : lead.probability >= 40
                ? "text-amber-400"
                : "text-zinc-400"
            }`}
          >
            {lead.probability}%
          </span>
        </div>
      </div>

      {/* Footer / Interaction preview */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{getDaysInStage()}</span>
        </div>

        {lead.interactions && lead.interactions.length > 0 && (
          <div className="flex items-center gap-1 text-zinc-400">
            <MessageSquare className="h-3 w-3" />
            <span>{lead.interactions.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
