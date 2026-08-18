"use client";

import React, { useState } from "react";
import {
  Gauge,
  Zap,
  Battery,
  AlertTriangle,
  CheckCircle2,
  X,
  Play,
  RotateCcw,
  Cpu,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceOrder } from "@/types/auto_services";

interface DiagnosticScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ServiceOrder | null;
}

export const DiagnosticScannerModal: React.FC<DiagnosticScannerModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);

  if (!isOpen || !order) return null;

  const report = order.diagnostic_reports?.[0] || {
    scanner_tool: "OBD-II Pro Automotive Scanner",
    battery_voltage: 12.6,
    alternator_charging_voltage: 14.3,
    brake_pad_wear_pct: 35,
    engine_compression: "Cil1: 175psi, Cil2: 174psi, Cil3: 176psi, Cil4: 175psi",
    dtc_codes: [
      {
        code: "P0101",
        description: "Mass Air Flow (MAF) Sensor Circuit Range/Performance",
        severity: "medium",
        system: "Injeção de Combustível / Admissão",
      },
    ],
    road_test_notes: "Sem anomalias detetadas em estrada. Estabilidade e travagem nominais.",
    technician_recommendations: "Limpeza do sensor de fluxo de ar (MAF) e verificação do filtro.",
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400 border border-purple-500/20">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Diagnóstico Eletrónico OBD-II
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  {report.scanner_tool}
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

        {/* Scan Bar Action */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <Cpu className="h-4 w-4 text-purple-400" />
              <span>Varredura de Módulos (ECU, ABS, Airbag, BCM)</span>
            </div>
            <Button
              size="sm"
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-7 gap-1"
            >
              {isScanning ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {isScanning ? "A analisar ECU..." : "Executar Scanner"}
            </Button>
          </div>

          {isScanning && (
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Telemetria de Sensores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <Battery className="h-3.5 w-3.5 text-emerald-400" />
              <span>Bateria</span>
            </div>
            <p className="text-lg font-black text-white font-mono mt-1">{report.battery_voltage} V</p>
            <span className="text-[10px] text-emerald-400">Nominal (100%)</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Alternador</span>
            </div>
            <p className="text-lg font-black text-white font-mono mt-1">
              {report.alternator_charging_voltage} V
            </p>
            <span className="text-[10px] text-emerald-400">Carga Ativa</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <Gauge className="h-3.5 w-3.5 text-blue-400" />
              <span>Travões (Desgaste)</span>
            </div>
            <p className="text-lg font-black text-white font-mono mt-1">
              {report.brake_pad_wear_pct}%
            </p>
            <span className="text-[10px] text-amber-400">Vida útil restante</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <FileCheck className="h-3.5 w-3.5 text-purple-400" />
              <span>Falhas DTC</span>
            </div>
            <p className="text-lg font-black text-white font-mono mt-1">
              {report.dtc_codes?.length || 0}
            </p>
            <span className="text-[10px] text-zinc-400">Códigos ativos</span>
          </div>
        </div>

        {/* Lista de Códigos de Falha DTC */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Códigos de Erro Diagnosticados (DTC)
          </h4>

          {report.dtc_codes && report.dtc_codes.length > 0 ? (
            <div className="space-y-2">
              {report.dtc_codes.map((dtc: any, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-300 text-sm">{dtc.code}</span>
                      <Badge className="bg-amber-500/20 text-amber-300 text-[10px]">
                        {dtc.severity || "Média Severidade"}
                      </Badge>
                      {dtc.system && <span className="text-zinc-400">• {dtc.system}</span>}
                    </div>
                    <p className="text-zinc-300">{dtc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-emerald-400 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Nenhum código de avaria permanente encontrado na ECU.
            </div>
          )}
        </div>

        {/* Parecer do Técnico */}
        {report.technician_recommendations && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
              Parecer Técnico & Recomendações:
            </span>
            <p className="text-xs text-zinc-300">{report.technician_recommendations}</p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs">
            Fechar Relatório
          </Button>
        </div>
      </div>
    </div>
  );
};
