"use client";

import { useState } from "react";
import {
  Phone,
  Video,
  Mail,
  MessageSquare,
  FileText,
  Clock,
  Plus,
  Send,
  UserCheck,
} from "lucide-react";
import { CreateInteractionInput, Interaction } from "@/types/crm";
import { Button } from "@/components/ui/button";

interface InteractionTimelineProps {
  leadId: number;
  interactions: Interaction[];
  onAddInteraction: (data: CreateInteractionInput) => Promise<void>;
}

export default function InteractionTimeline({
  leadId,
  interactions,
  onAddInteraction,
}: InteractionTimelineProps) {
  const [type, setType] = useState<CreateInteractionInput["type"]>("call");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddInteraction({
        type,
        description: description.trim(),
      });
      setDescription("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case "call":
        return <Phone className="h-3.5 w-3.5 text-blue-400" />;
      case "meeting":
        return <Video className="h-3.5 w-3.5 text-purple-400" />;
      case "email":
        return <Mail className="h-3.5 w-3.5 text-amber-400" />;
      case "whatsapp":
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />;
      case "proposal":
        return <FileText className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 space-y-3">
        <span className="text-xs font-bold text-white uppercase tracking-wider block">
          Registar Novo Contacto / Ação
        </span>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "call", label: "Ligação", icon: Phone },
              { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
              { id: "meeting", label: "Reunião", icon: Video },
              { id: "email", label: "Email", icon: Mail },
              { id: "note", label: "Nota Interna", icon: FileText },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setType(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                type === item.id
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <item.icon className="h-3 w-3" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Descreva o que foi tratado com o cliente..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Button
            type="submit"
            disabled={isSubmitting || !description.trim()}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-8 px-3"
          >
            <Send className="h-3.5 w-3.5 mr-1" />
            Registar
          </Button>
        </div>
      </form>

      {/* Timeline List */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
        {interactions.length === 0 ? (
          <div className="text-xs text-zinc-500 py-3">Nenhum histórico registrado até ao momento.</div>
        ) : (
          interactions.map((interaction) => (
            <div key={interaction.id} className="relative space-y-1">
              {/* Dot Icon */}
              <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700">
                {getTypeIcon(interaction.type)}
              </div>

              {/* Content Box */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-semibold text-zinc-200">
                    {interaction.user_name || "Operador Comercial"}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <Clock className="h-3 w-3 text-zinc-500" />
                    <span>{new Date(interaction.date).toLocaleString("pt-MZ")}</span>
                  </div>
                </div>

                <p className="text-zinc-300 font-sans">{interaction.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
