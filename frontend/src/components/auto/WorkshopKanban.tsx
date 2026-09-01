"use client";

import React from "react";
import {
  Wrench,
  Gauge,
  Flame,
  CheckCircle2,
  Clock,
  Car,
  AlertTriangle,
  FileText,
  User,
  ArrowRight,
  Eye,
  CheckCheck,
  Receipt,
} from "lucide-react";
import {
  ServiceOrder,
  ServiceOrderStatus,
  AutoServiceType,
} from "@/types/auto_services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WorkshopKanbanProps {
  orders: ServiceOrder[];
  onSelectOrder: (order: ServiceOrder) => void;
  onUpdateStatus: (orderId: number, status: ServiceOrderStatus) => void;
  onOpenDiagnostic: (order: ServiceOrder) => void;
  onOpenPaintTuning: (order: ServiceOrder) => void;
  onOpenReceipt: (order: ServiceOrder) => void;
}

const KANBAN_COLUMNS: {
  id: ServiceOrderStatus;
  title: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    id: "quote",
    title: "1. Recepção / Orçamento",
    badgeColor: "bg-zinc-100 text-zinc-700 border-zinc-200",
    icon: Clock,
    color: "text-zinc-500",
  },
  {
    id: "approved",
    title: "2. Aprovado / Fila de Box",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Car,
    color: "text-blue-600",
  },
  {
    id: "in_progress",
    title: "3. Na Oficina (Box Mecânica)",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Wrench,
    color: "text-amber-600",
  },
  {
    id: "paint_booth",
    title: "4. Estufa de Pintura / Bate-Chapa",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    icon: Flame,
    color: "text-rose-600",
  },
  {
    id: "quality_test",
    title: "5. Teste & Qualidade (Dyno/OBD)",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Gauge,
    color: "text-purple-600",
  },
  {
    id: "ready",
    title: "6. Pronto para Entrega",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    color: "text-emerald-700",
  },
  {
    id: "invoiced",
    title: "7. Faturado (Concluído)",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    icon: Receipt,
    color: "text-teal-700",
  },
];

const SERVICE_TYPE_BADGES: Record<
  AutoServiceType,
  { label: string; bg: string; text: string }
> = {
  maintenance: { label: "Mecânica Geral", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  bodywork_chapa: { label: "Bate-Chapa", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  diagnosis: { label: "Diagnóstico OBD", bg: "bg-purple-50 border-purple-200", text: "text-purple-700" },
  painting: { label: "Pintura Estufa", bg: "bg-rose-50 border-rose-200", text: "text-rose-700" },
  tuning: { label: "Tuning & ECU", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800" },
  full_service: { label: "Serviço Completo", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" },
};

export const WorkshopKanban: React.FC<WorkshopKanbanProps> = ({
  orders,
  onSelectOrder,
  onUpdateStatus,
  onOpenDiagnostic,
  onOpenPaintTuning,
  onOpenReceipt,
}) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
      {KANBAN_COLUMNS.map((col) => {
        const ColumnIcon = col.icon;
        const colOrders = orders.filter((o) => o.status === col.id);

        return (
          <div
            key={col.id}
            className="flex-shrink-0 w-80 rounded-2xl border border-emerald-900/10 bg-white/70 backdrop-blur-md p-3.5 flex flex-col max-h-[78vh] shadow-xs"
          >
            {/* Header da Coluna */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 mb-3">
              <div className="flex items-center gap-2">
                <ColumnIcon className={`h-4 w-4 ${col.color}`} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  {col.title}
                </h3>
              </div>
              <Badge className={`text-xs px-2 py-0.5 font-bold ${col.badgeColor}`}>
                {colOrders.length}
              </Badge>
            </div>

            {/* Lista de Ordens na Coluna */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {colOrders.length > 0 ? (
                colOrders.map((order) => {
                  const typeInfo = SERVICE_TYPE_BADGES[order.service_type] || {
                    label: order.service_type,
                    bg: "bg-zinc-100 border-zinc-200",
                    text: "text-zinc-700",
                  };

                  return (
                    <div
                      key={order.id}
                      className="rounded-xl border border-zinc-200/80 bg-white p-3.5 space-y-3 hover:border-emerald-500/50 hover:shadow-md transition-all shadow-xs group relative"
                    >
                      {/* Topo do Card */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {order.order_number}
                        </span>
                        <Badge className={`text-[10px] font-semibold ${typeInfo.bg} ${typeInfo.text} border`}>
                          {typeInfo.label}
                        </Badge>
                      </div>

                      {/* Veículo & Matrícula */}
                      <div>
                        <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-sm">
                          <Car className="h-4 w-4 text-zinc-500" />
                          <span>{order.vehicle?.make} {order.vehicle?.model}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 font-mono">
                          <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700 font-bold border border-zinc-200">
                            {order.vehicle?.license_plate}
                          </span>
                          <span>• {order.entry_mileage ? `${order.entry_mileage.toLocaleString()} KM` : "0 KM"}</span>
                        </div>
                      </div>

                      {/* Queixa / Descrição */}
                      {order.customer_complaint && (
                        <p className="text-xs text-zinc-600 line-clamp-2 italic bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                          "{order.customer_complaint}"
                        </p>
                      )}

                      {/* Técnico Responsável */}
                      {order.technician && (
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                          <User className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Técnico: <strong className="text-zinc-800">{order.technician.name}</strong></span>
                        </div>
                      )}

                      {/* Valor Total */}
                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Total (IVA 16%)</span>
                          <span className="text-xs font-bold text-emerald-700 font-mono">
                            {Number(order.total_final).toLocaleString("pt-MZ")} MT
                          </span>
                        </div>

                        {/* Botões de Ação Rápida */}
                        <div className="flex items-center gap-1">
                          {order.diagnostic_reports && order.diagnostic_reports.length > 0 && (
                            <button
                              onClick={() => onOpenDiagnostic(order)}
                              className="p-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                              title="Ver Scanner OBD-II"
                            >
                              <Gauge className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {order.paint_tuning_specs && order.paint_tuning_specs.length > 0 && (
                            <button
                              onClick={() => onOpenPaintTuning(order)}
                              className="p-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                              title="Ver Estufa / Tuning"
                            >
                              <Flame className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onOpenReceipt(order)}
                            className="p-1 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-zinc-200 transition-colors"
                            title="Recibo / Fatura"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Transição de Estado Rápida (Mover Próxima Box) */}
                      {col.id !== "invoiced" && col.id !== "cancelled" && (
                        <div className="pt-1 flex items-center justify-between gap-1.5">
                          {col.id === "quote" && (
                            <Button
                              size="sm"
                              onClick={() => onUpdateStatus(order.id, "approved")}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-7 font-semibold rounded-lg shadow-xs"
                            >
                              Aprovar Orçamento
                            </Button>
                          )}
                          {col.id === "approved" && (
                            <Button
                              size="sm"
                              onClick={() => onUpdateStatus(order.id, "in_progress")}
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white text-[11px] h-7 font-semibold rounded-lg shadow-xs"
                            >
                              Entrar na Box Mecânica
                            </Button>
                          )}
                          {col.id === "in_progress" && (
                            <div className="grid grid-cols-2 gap-1 w-full">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onUpdateStatus(order.id, "paint_booth")}
                                className="border-rose-300 text-rose-700 hover:bg-rose-50 text-[10px] h-7 px-1 rounded-lg"
                              >
                                Ir para Estufa
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => onUpdateStatus(order.id, "quality_test")}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] h-7 px-1 rounded-lg shadow-xs"
                              >
                                Teste Final
                              </Button>
                            </div>
                          )}
                          {col.id === "paint_booth" && (
                            <Button
                              size="sm"
                              onClick={() => onUpdateStatus(order.id, "quality_test")}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-[11px] h-7 font-semibold rounded-lg shadow-xs"
                            >
                              Secagem & Teste
                            </Button>
                          )}
                          {col.id === "quality_test" && (
                            <Button
                              size="sm"
                              onClick={() => onUpdateStatus(order.id, "ready")}
                              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] h-7 font-semibold rounded-lg shadow-xs"
                            >
                              Aprovar & Pronto
                            </Button>
                          )}
                          {col.id === "ready" && (
                            <Button
                              size="sm"
                              onClick={() => onSelectOrder(order)}
                              className="w-full bg-teal-700 hover:bg-teal-800 text-white text-[11px] h-7 font-semibold rounded-lg shadow-xs"
                            >
                              Faturar no POS
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="h-32 rounded-xl border border-dashed border-zinc-200 flex items-center justify-center text-center p-4">
                  <span className="text-xs text-zinc-500 font-medium">Nenhum veículo nesta fase.</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
