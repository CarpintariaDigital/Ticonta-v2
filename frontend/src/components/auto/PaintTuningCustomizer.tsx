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
    ecu_remap_profile: "Stage 2 Eco & Torque Boost Maputo",
    dyno_hp_before: 177,
    dyno_hp_after: 225,
    exhaust_modification: "Downpipe Inox 304 + Ponteiras Duplas",
    suspension_upgrade: "Kit Molas Eibach Pro-Kit (-30mm)",
    sound_multimedia: "Apple CarPlay 10\" + Módulo Amplificador Pioneer",
    lighting_upgrade: "Faróis Bi-LED Matrix + Fita DRL Sequencial",
  };

  const hpGain = (spec.dyno_hp_after || 0) - (spec.dyno_hp_before || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-emerald-900/10 bg-white p-6 text-zinc-900 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-50 p-2.5 text-rose-700 border border-rose-200">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                Pintura em Estufa & Projeto Tuning
                <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs">
                  {spec.tuning_stage ? spec.tuning_stage.toUpperCase() : "CUSTOM"}
                </Badge>
              </h2>
              <p className="text-xs text-zinc-500">
                {order.order_number} • {order.vehicle?.make} {order.vehicle?.model} (
                {order.vehicle?.license_plate})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. SEÇÃO ESTUFA DE PINTURA & BATE-CHAPA */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
            <Palette className="h-4 w-4" />
            1. Cabine de Pintura & Funilaria
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
              <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Código de Cor OEM</span>
              <span className="text-sm font-bold text-zinc-900 font-mono mt-0.5 block">{spec.paint_code || "N/D"}</span>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
              <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Acabamento</span>
              <span className="text-sm font-bold text-rose-700 capitalize mt-0.5 block">{spec.paint_finish}</span>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
              <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Temperatura Estufa</span>
              <span className="text-sm font-bold text-amber-700 font-mono mt-0.5 block">{spec.booth_temp_c} ºC</span>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
              <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Demãos / Verniz</span>
              <span className="text-sm font-bold text-emerald-800 font-mono mt-0.5 block">{spec.coats_applied} Demãos HS</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-zinc-600 block mb-1.5 font-medium">Partes a Pintar / Tratar:</span>
            <div className="flex flex-wrap gap-1.5">
              {spec.parts_to_paint?.map((p, idx) => (
                <Badge key={idx} className="bg-white text-zinc-800 border-zinc-200 text-xs py-1 px-2.5 shadow-xs">
                  🎨 {p}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 2. SEÇÃO TUNING & PERFORMANCE */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              2. Reprogramação ECU & Performance (Dinamómetro)
            </h3>
            {hpGain > 0 && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs flex items-center gap-1 font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />
                +{hpGain} HP Ganho de Potência
              </Badge>
            )}
          </div>

          {/* Gráfico / Comparador de Potência */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs">
              <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Potência Original (Stock)</span>
              <p className="text-2xl font-black text-zinc-700 font-mono mt-1">{spec.dyno_hp_before || 0} HP</p>
              <span className="text-[10px] text-zinc-500">Medição de Fábrica</span>
            </div>

            <div className="rounded-xl border border-emerald-300 bg-white p-3.5 shadow-xs">
              <span className="text-[11px] text-emerald-800 uppercase block font-semibold">Potência Após Reprogramação</span>
              <p className="text-2xl font-black text-emerald-800 font-mono mt-1">{spec.dyno_hp_after || 0} HP</p>
              <span className="text-[10px] text-emerald-700">Dinamómetro Calibrado</span>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-3.5 col-span-2 sm:col-span-1 shadow-xs">
              <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Mapa Instalado</span>
              <p className="text-xs font-bold text-zinc-900 mt-1 leading-snug">{spec.ecu_remap_profile || "Stock"}</p>
              <span className="text-[10px] text-zinc-500">Proteção Térmica Ativa</span>
            </div>
          </div>

          {/* Componentes de Personalização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {spec.exhaust_modification && (
              <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
                <Flame className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-zinc-900 block">Sistema de Escape:</strong>
                  <span className="text-zinc-600">{spec.exhaust_modification}</span>
                </div>
              </div>
            )}

            {spec.suspension_upgrade && (
              <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
                <Gauge className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-zinc-900 block">Suspensão & Chassi:</strong>
                  <span className="text-zinc-600">{spec.suspension_upgrade}</span>
                </div>
              </div>
            )}

            {spec.sound_multimedia && (
              <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
                <Volume2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-zinc-900 block">Som & Multimédia:</strong>
                  <span className="text-zinc-600">{spec.sound_multimedia}</span>
                </div>
              </div>
            )}

            {spec.lighting_upgrade && (
              <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-zinc-900 block">Iluminação LED / DRL:</strong>
                  <span className="text-zinc-600">{spec.lighting_upgrade}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} variant="outline" className="border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 text-xs shadow-xs">
            Fechar Especificação
          </Button>
        </div>
      </div>
    </div>
  );
};
