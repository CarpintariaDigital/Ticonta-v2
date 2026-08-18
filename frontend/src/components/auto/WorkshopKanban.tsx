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
    badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
    icon: Clock,
    color: "text-zinc-400",
  },
  {
    id: "approved",
    title: "2. Aprovado / Fila de Box",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    icon: Car,
    color: "text-blue-400",
  },
  {
    id: "in_progress",
    title: "3. Na Oficina (Box Mecânica)",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: Wrench,
    color: "text-amber-400",
  },
  {
    id: "paint_booth",
    title: "4. Estufa de Pintura / Bate-Chapa",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    icon: Flame,
    color: "text-rose-400",
  },
  {
    id: "quality_test",
    title: "5. Teste & Qualidade (Dyno/OBD)",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    icon: Gauge,
    color: "text-purple-400",
  },
  {
    id: "ready",
    title: "6. Pronto para Entrega",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: CheckCircle2,
    color: "text-emerald-400",
  },
  {
    id: "invoiced",
    title: "7. Faturado (Concluído)",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    icon: Receipt,
    color: "text-teal-400",
  },
];

const SERVICE_TYPE_BADGES: Record<
  AutoServiceType,
  { label: string; bg: string; text: string }
> = {
  maintenance: { label: "Mecânica Geral", bg: "bg-blue-500/15 border-blue-500/30", text: "text-blue-300" },
  bodywork_chapa: { label: "Bate-Chapa", bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-300" },
  diagnosis: { label: "Diagnóstico OBD", bg: "bg-purple-500/15 border-purple-500/30", text: "text-purple-300" },
  painting: { label: "Pintura Estufa", bg: "bg-rose-500/15 border-rose-500/30", text: "text-rose-300" },
  tuning: { label: "Tuning & ECU", bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-300" },
  full_service: { label: "Serviço Completo", bg: "bg-indigo-500/15 border-indigo-500/30", text: "text-indigo-300" },
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
            className="flex-shrink-0 w-80 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 flex flex-col max-h-[78vh] backdrop-blur-md"
          >
            {/* Header da Coluna */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
              <div className="flex items-center gap-2">
                <ColumnIcon className={`h-4 w-4 ${col.color}`} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
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
                    bg: "bg-zinc-800",
                    text: "text-zinc-300",
                  };

                  return (
                    <div
                      key={order.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 space-y-3 hover:border-emerald-500/50 hover:bg-zinc-950 transition-all shadow-md group relative"
                    >
                      {/* Topo do Card */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {order.order_number}
                        </span>
                        <Badge className={`text-[10px] ${typeInfo.bg} ${typeInfo.text} border`}>
                          {typeInfo.label}
                        </Badge>
                      </div>

                      {/* Veículo & Matrícula */}
                      <div>
                        <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                          <Car className="h-4 w-4 text-zinc-400" />
                          <span>{order.vehicle?.make} {order.vehicle?.model}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400 font-mono">
                          <span className="bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300 font-bold border border-zinc-800">
                            {order.vehicle?.license_plate}
                          </span>
                          <span>• {order.entry_mileage ? `${order.entry_mileage.toLocaleString()} KM` : "0 KM"}</span>
                        </div>
                      </div>

                      {/* Queixa / Descrição */}
                      {order.customer_complaint && (
                        <p className="text-xs text-zinc-300 line-clamp-2 italic bg-zinc-900/60 p-2 rounded-lg border border-zinc-900">
                          "{order.customer_complaint}"
                        </p>
                      )}

                      {/* Técnico Responsável */}
                      {order.technician && (
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                          <User className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Técnico: <strong className="text-zinc-200">{order.technician.name}</strong></span>
                        </div>
                      )}

                      {/* Valor Total */}
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Total (IVA 16%)</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            {Number(order.total_final).toLocaleString("pt-MZ")} MT
                          </span>
                        </div>

                        {/* Botões de Ação Rápida */}
                        <div className="flex items-center gap-1">
                          {order.diagnostic_reports?.length > 0 && (
                            <button
                              onClick={() => onOpenDiagnostic(order)}
                              className="p-1 rounded-md bg-purple-500/15 text-purple-300 hover:bg-purple-500/30 transition-colors"
                              title="Ver Scanner OBD-II"
                            >
                              <Gauge className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {order.paint_tuning_specs?.length > 0 && (
                            <button
                              onClick={() => onOpenPaintTuning(order)}
                              className="p-1 rounded-md bg-rose-500/15 text-rose-300 hover:bg-rose-500/30 transition-colors"
                              title="Ver Estufa / Tuning"
                            >
                              <Flame className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onOpenReceipt(order)}
                            className="p-1 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
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
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] h-7 font-semibold rounded-lg"
                            >
                              Aprovar Orçamento
                            </Button>
                          )}
                          {col.id === "approved" && (
                            <Button
                              size="sm"
                              onClick={() => onUpdateStatus(order.id, "in_progress")}
                              className="w-full bg-amber-600 hover:bg-amber-500 text-white text-[11px] h-7 font-semibold rounded-lg"
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
                                className="border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-[10px] h-7 px-1 rounded-lg"
                              >
                                Ir para Estufa
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => onUpdateStatus(order.id, "quality_test")}
                                className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] h-7 px-1 rounded-lg"
                              >
                                Teste Final
                              </Button>
                            </div>
                          )}
                          {col.id === "paint_booth" && (
                            <Button
                              size="sm"
                              onClick={() => onUpdateStatus(order.id, "quality_test")}
                              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-[11px] h-7 font-semibold rounded-lg"
                            >
                              Secagem & Teste
                            </Button>
                          )}
                          {col.id === "quality_test" && (
                            <Button
                              size="sm"
                              onClick={() => onUpdateStatus(order.id, "ready")}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-7 font-semibold rounded-lg"
                            >
                              Aprovar & Pronto
                            </Button>
                          )}
                          {col.id === "ready" && (
                            <Button
                              size="sm"
                              onClick={() => onSelectOrder(order)}
                              className="w-full bg-teal-600 hover:bg-teal-500 text-white text-[11px] h-7 font-semibold rounded-lg"
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
                <div className="h-32 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-center p-4">
                  <span className="text-xs text-zinc-600 font-medium">Nenhum veículo nesta fase.</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
