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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-emerald-900/10 bg-white p-6 text-zinc-900 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-700 border border-purple-200">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                Diagnóstico Eletrónico OBD-II
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                  {report.scanner_tool}
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

        {/* Scan Bar Action */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
              <Cpu className="h-4 w-4 text-purple-700" />
              <span>Varredura de Módulos (ECU, ABS, Airbag, BCM)</span>
            </div>
            <Button
              size="sm"
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 gap-1 shadow-xs"
            >
              {isScanning ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {isScanning ? "A analisar ECU..." : "Executar Scanner"}
            </Button>
          </div>

          {isScanning && (
            <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-emerald-600 h-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Telemetria de Sensores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
              <Battery className="h-3.5 w-3.5 text-emerald-700" />
              <span>Bateria</span>
            </div>
            <p className="text-lg font-black text-zinc-900 font-mono mt-1">{report.battery_voltage} V</p>
            <span className="text-[10px] text-emerald-700 font-medium">Nominal (100%)</span>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
              <Zap className="h-3.5 w-3.5 text-amber-600" />
              <span>Alternador</span>
            </div>
            <p className="text-lg font-black text-zinc-900 font-mono mt-1">
              {report.alternator_charging_voltage} V
            </p>
            <span className="text-[10px] text-emerald-700 font-medium">Carga Ativa</span>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
              <Gauge className="h-3.5 w-3.5 text-blue-600" />
              <span>Travões (Desgaste)</span>
            </div>
            <p className="text-lg font-black text-zinc-900 font-mono mt-1">
              {report.brake_pad_wear_pct}%
            </p>
            <span className="text-[10px] text-amber-700 font-medium">Vida útil restante</span>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
              <FileCheck className="h-3.5 w-3.5 text-purple-700" />
              <span>Falhas DTC</span>
            </div>
            <p className="text-lg font-black text-zinc-900 font-mono mt-1">
              {report.dtc_codes?.length || 0}
            </p>
            <span className="text-[10px] text-zinc-500 font-medium">Códigos ativos</span>
          </div>
        </div>

        {/* Lista de Códigos de Falha DTC */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            Códigos de Erro Diagnosticados (DTC)
          </h4>

          {report.dtc_codes && report.dtc_codes.length > 0 ? (
            <div className="space-y-2">
              {report.dtc_codes.map((dtc: any, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-900 text-sm">{dtc.code}</span>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                        {dtc.severity || "Média Severidade"}
                      </Badge>
                      {dtc.system && <span className="text-zinc-600 font-medium">• {dtc.system}</span>}
                    </div>
                    <p className="text-zinc-700">{dtc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-center text-emerald-800 text-xs flex items-center justify-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              Nenhum código de avaria permanente encontrado na ECU.
            </div>
          )}
        </div>

        {/* Parecer do Técnico */}
        {report.technician_recommendations && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Parecer Técnico & Recomendações:
            </span>
            <p className="text-xs text-zinc-700">{report.technician_recommendations}</p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} variant="outline" className="border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 text-xs shadow-xs">
            Fechar Relatório
          </Button>
        </div>
      </div>
    </div>
  );
};
