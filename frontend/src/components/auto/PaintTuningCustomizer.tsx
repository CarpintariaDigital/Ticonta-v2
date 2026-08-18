"use client";

import React, { useState } from "react";
import {
  Flame,
  Palette,
  Zap,
  Gauge,
  Sparkles,
  Volume2,
  Lightbulb,
  X,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceOrder } from "@/types/auto_services";

interface PaintTuningCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  order: ServiceOrder | null;
}

export const PaintTuningCustomizer: React.FC<PaintTuningCustomizerProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!isOpen || !order) return null;

  const spec = order.paint_tuning_specs?.[0] || {
    paint_code: "040 - Super White II Toyota",
    paint_finish: "metallic",
    booth_temp_c: 65,
    coats_applied: 3,
    parts_to_paint: ["Parachoques Dianteiro", "Capot", "Retrovisores Gloss Black"],
    bodywork_straightening_required: true,
    tuning_stage: "stage2",
    ecu_remap_profile: "TiConta Pro Stage 2 Dynamic (+65 HP)",
    dyno_hp_before: 177,
    dyno_hp_after: 242,
    exhaust_modification: "Downpipe Inox 3' 304 com Válvula Eletrónica Cutout",
    suspension_upgrade: "Kit Molas Rebaixadas Eibach -30mm",
    sound_multimedia: "Subwoofer Ativo JBL 1000W + Central Multimédia 10' CarPlay",
    lighting_upgrade: "Faróis Full LED Bi-Xenon 6000K com DRL Dinâmico",
  };

  const hpGain = (spec.dyno_hp_after || 0) - (spec.dyno_hp_before || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 p-2.5 text-rose-400 border border-rose-500/30">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Pintura em Estufa & Projeto Tuning
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs">
                  {spec.tuning_stage ? spec.tuning_stage.toUpperCase() : "CUSTOM"}
                </Badge>
              </h2>
              <p className="text-xs text-zinc-400">
                {order.order_number} • {order.vehicle?.make} {order.vehicle?.model} (
                {order.vehicle?.license_plate})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. SEÇÃO ESTUFA DE PINTURA & BATE-CHAPA */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Palette className="h-4 w-4" />
            1. Cabine de Pintura & Funilaria
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Código de Cor OEM</span>
              <span className="text-sm font-bold text-white font-mono mt-0.5 block">{spec.paint_code || "N/D"}</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Acabamento</span>
              <span className="text-sm font-bold text-rose-300 capitalize mt-0.5 block">{spec.paint_finish}</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Temperatura Estufa</span>
              <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">{spec.booth_temp_c} ºC</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Demãos / Verniz</span>
              <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">{spec.coats_applied} Demãos HS</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-zinc-400 block mb-1.5 font-medium">Partes a Pintar / Tratar:</span>
            <div className="flex flex-wrap gap-1.5">
              {spec.parts_to_paint?.map((p, idx) => (
                <Badge key={idx} className="bg-zinc-950 text-zinc-200 border-zinc-800 text-xs py-1 px-2.5">
                  🎨 {p}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 2. SEÇÃO TUNING & PERFORMANCE */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              2. Reprogramação ECU & Performance (Dinamómetro)
            </h3>
            {hpGain > 0 && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                +{hpGain} HP Ganho de Potência
              </Badge>
            )}
          </div>

          {/* Gráfico / Comparador de Potência */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5">
              <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Potência Original (Stock)</span>
              <p className="text-2xl font-black text-zinc-300 font-mono mt-1">{spec.dyno_hp_before || 0} HP</p>
              <span className="text-[10px] text-zinc-500">Medição de Fábrica</span>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5">
              <span className="text-[11px] text-emerald-400 uppercase block font-semibold">Potência Após Reprogramação</span>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{spec.dyno_hp_after || 0} HP</p>
              <span className="text-[10px] text-emerald-300">Dinamómetro Calibrado</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Mapa Instalado</span>
              <p className="text-xs font-bold text-white mt-1 leading-snug">{spec.ecu_remap_profile || "Stock"}</p>
              <span className="text-[10px] text-zinc-400">Proteção Térmica Ativa</span>
            </div>
          </div>

          {/* Componentes de Personalização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {spec.exhaust_modification && (
              <div className="flex items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <Flame className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-zinc-200 block">Sistema de Escape:</strong>
                  <span className="text-zinc-400">{spec.exhaust_modification}</span>
                </div>
              </div>
            )}

            {spec.suspension_upgrade && (
              <div className="flex items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <Gauge className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-zinc-200 block">Suspensão & Chassi:</strong>
                  <span className="text-zinc-400">{spec.suspension_upgrade}</span>
                </div>
              </div>
            )}

            {spec.sound_multimedia && (
              <div className="flex items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <Volume2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-zinc-200 block">Som & Multimédia:</strong>
                  <span className="text-zinc-400">{spec.sound_multimedia}</span>
                </div>
              </div>
            )}

            {spec.lighting_upgrade && (
              <div className="flex items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <Lightbulb className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-zinc-200 block">Iluminação LED / DRL:</strong>
                  <span className="text-zinc-400">{spec.lighting_upgrade}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs">
            Fechar Especificação
          </Button>
        </div>
      </div>
    </div>
  );
};
