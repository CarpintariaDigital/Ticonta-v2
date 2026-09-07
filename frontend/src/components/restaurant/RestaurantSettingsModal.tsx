"use client";

import React, { useState } from "react";
import {
  Settings,
  Percent,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  Save,
  ShieldCheck,
} from "lucide-react";
import { RestaurantSettings } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RestaurantSettingsModalProps {
  settings: RestaurantSettings | null;
  onUpdateSettings: (data: Partial<RestaurantSettings>) => Promise<any>;
  onClose: () => void;
}

export default function RestaurantSettingsModal({
  settings,
  onUpdateSettings,
  onClose,
}: RestaurantSettingsModalProps) {
  const [serviceCharge, setServiceCharge] = useState<number>(
    settings ? Number(settings.service_charge_percent) : 10
  );
  const [taxPercent, setTaxPercent] = useState<number>(
    settings ? Number(settings.tax_percent) : 16
  );
  const [autoClean, setAutoClean] = useState<boolean>(
    settings ? settings.auto_clean_tables : false
  );
  const [urgentPrepTime, setUrgentPrepTime] = useState<number>(
    settings ? settings.urgent_prep_time_minutes : 10
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateSettings({
        service_charge_percent: serviceCharge,
        tax_percent: taxPercent,
        auto_clean_tables: autoClean,
        urgent_prep_time_minutes: urgentPrepTime,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-2xl text-zinc-900 space-y-4 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-950 font-mono">
                Configurações do Restaurante
              </h3>
              <p className="text-xs text-zinc-500">
                Taxas de serviço, fiscalidade e parâmetros do KDS
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-700 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Taxa de Serviço Padrão (%)
              </label>
              <Input
                type="number"
                min={0}
                max={50}
                step="0.5"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(parseFloat(e.target.value) || 0)}
                className="bg-white border-zinc-300 text-xs h-9 font-mono text-zinc-900 rounded-xl"
              />
              <span className="text-[10px] text-zinc-500">Calculada sobre o subtotal</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Taxa de IVA Padrão (%)
              </label>
              <Input
                type="number"
                min={0}
                max={30}
                step="0.5"
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="bg-white border-zinc-300 text-xs h-9 font-mono text-zinc-900 rounded-xl"
              />
              <span className="text-[10px] text-zinc-500">16% IVA em Moçambique</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">
              Alerta de Urgência no KDS (Minutos)
            </label>
            <Input
              type="number"
              min={1}
              max={60}
              value={urgentPrepTime}
              onChange={(e) => setUrgentPrepTime(parseInt(e.target.value) || 10)}
              className="bg-white border-zinc-300 text-xs h-9 font-mono text-zinc-900 rounded-xl"
            />
            <span className="text-[10px] text-zinc-500">
              Pedidos com tempo de preparo superior ficam em destaque vermelho
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-900">Limpeza Automática de Mesas</h4>
                <p className="text-[11px] text-zinc-500">
                  Liberar mesa diretamente como disponível ao pagar a comanda
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoClean}
                onChange={(e) => setAutoClean(e.target.checked)}
                className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 h-5 w-5"
              />
            </div>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          )}

          <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="border-zinc-300 text-zinc-700 rounded-xl">
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? "Gravando..." : "Gravar Configurações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
