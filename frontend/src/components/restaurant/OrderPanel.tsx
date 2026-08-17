"use client";

import React from "react";
import {
  Utensils,
  Receipt,
  Users2,
  DollarSign,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Split,
  ChevronRight,
  Sparkles,
  Printer,
  ShieldAlert,
} from "lucide-react";
import { Table, RestaurantOrder, OrderItem, ItemPrepStatus } from "@/types/restaurant";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderPanelProps {
  selectedTable: Table | null;
  currentOrder: RestaurantOrder | null;
  onOpenMenu: () => void;
  onOpenBillModal: () => void;
  onOpenSplitModal: () => void;
  onCreateOrderForTable: (tableId: number) => void;
  onUpdateItemStatus: (itemId: number, status: string) => void;
}

export default function OrderPanel({
  selectedTable,
  currentOrder,
  onOpenMenu,
  onOpenBillModal,
  onOpenSplitModal,
  onCreateOrderForTable,
  onUpdateItemStatus,
}: OrderPanelProps) {
  if (!selectedTable) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-950/60 rounded-xl border border-zinc-800/80 p-8 text-center backdrop-blur-sm">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
          <Utensils className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-base font-semibold text-zinc-200">Nenhuma mesa selecionada</h3>
        <p className="text-xs text-zinc-400 max-w-xs mt-1">
          Selecione uma mesa no mapa ao lado para visualizar a comanda ou abrir um novo pedido.
        </p>
      </div>
    );
  }

  // If table is selected but no order is open yet
  if (!currentOrder) {
    return (
      <div className="flex flex-col justify-between h-full bg-zinc-950/60 rounded-xl border border-zinc-800/80 p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-zinc-100">
                  Mesa {selectedTable.table_number}
                </span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                  {selectedTable.status === "available" ? "Disponível" : selectedTable.status}
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Capacidade: {selectedTable.capacity} pessoas • Localização: {selectedTable.location}
              </p>
            </div>
          </div>

          <div className="my-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/40 border border-emerald-600/30 flex items-center justify-center text-emerald-400">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-200">Mesa livre para atendimento</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Inicie uma nova comanda para esta mesa e adicione os pedidos diretamente da cozinha ou bar.
            </p>
          </div>
        </div>

        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-5 text-sm shadow-lg shadow-emerald-950/50"
          onClick={() => onCreateOrderForTable(selectedTable.id)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Abrir Comanda da Mesa {selectedTable.table_number}
        </Button>
      </div>
    );
  }

  const getPrepStatusBadge = (status: ItemPrepStatus) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">Pendente</Badge>;
      case "preparing":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]">Em Preparo</Badge>;
      case "ready":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">Pronto</Badge>;
      case "served":
        return <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]">Servido</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 rounded-xl border border-zinc-800/80 p-4 backdrop-blur-sm overflow-hidden">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-zinc-100">
              Mesa {selectedTable.table_number}
            </h3>
            <span className="text-xs font-mono bg-zinc-900 px-2 py-0.5 rounded text-emerald-400 border border-zinc-800">
              {currentOrder.order_number}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
            <Users2 className="w-3.5 h-3.5" />
            <span>{currentOrder.guest_count} Clientes</span>
            <span>•</span>
            <Clock className="w-3.5 h-3.5" />
            <span>Aberta às {new Date(currentOrder.opened_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-8"
          onClick={onOpenMenu}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Adicionar Pratos
        </Button>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-2">
        {currentOrder.items.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs">
            Nenhum prato adicionado nesta comanda.
            <br />
            Clique em <strong>"Adicionar Pratos"</strong> acima.
          </div>
        ) : (
          currentOrder.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800/90 hover:border-zinc-700 transition-all"
            >
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-100">
                    {item.quantity}x
                  </span>
                  <span className="font-medium text-sm text-zinc-200">
                    {item.menu_item_name || "Item"}
                  </span>
                </div>

                {/* Special Requests (Allergies, preferences) */}
                {item.special_requests && (
                  <div className="text-[11px] text-amber-400/90 font-mono mt-0.5 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{item.special_requests}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-1.5">
                  {getPrepStatusBadge(item.preparation_status)}
                  <span className="text-[11px] text-zinc-500">
                    {Number(item.unit_price).toFixed(2)} MZN/un
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between self-stretch">
                <span className="font-bold text-sm text-emerald-400">
                  {Number(item.subtotal).toFixed(2)} MZN
                </span>

                {/* Waiter quick action: mark ready items as served */}
                {item.preparation_status === "ready" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] px-2 border-emerald-600/40 text-emerald-300 hover:bg-emerald-950/40"
                    onClick={() => onUpdateItemStatus(item.id, "served")}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Entregue
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Financial Summary & Actions */}
      <div className="pt-3 border-t border-zinc-800/80 shrink-0 space-y-2">
        <div className="space-y-1 text-xs text-zinc-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-zinc-200">
              {Number(currentOrder.subtotal).toFixed(2)} MZN
            </span>
          </div>
          <div className="flex justify-between">
            <span>IVA (16%)</span>
            <span className="font-medium text-zinc-200">
              {Number(currentOrder.tax).toFixed(2)} MZN
            </span>
          </div>
          <div className="flex justify-between">
            <span>Taxa de Serviço (10%)</span>
            <span className="font-medium text-zinc-200">
              {Number(currentOrder.service_charge).toFixed(2)} MZN
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-zinc-800 font-bold text-sm text-zinc-100">
            <span>Total a Pagar</span>
            <span className="text-base text-emerald-400 font-mono">
              {Number(currentOrder.total).toFixed(2)} MZN
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-900 text-zinc-200 text-xs font-semibold h-10"
            onClick={onOpenSplitModal}
          >
            <Split className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Dividir Conta
          </Button>

          <Button
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-10 shadow-lg shadow-emerald-950/40"
            onClick={onOpenBillModal}
          >
            <Receipt className="w-3.5 h-3.5 mr-1.5" />
            Fechar & Pagar
          </Button>
        </div>
      </div>
    </div>
  );
}
