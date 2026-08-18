"use client";

import React from "react";
import {
  Printer,
  X,
  FileCheck,
  ShieldCheck,
  Car,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceOrder } from "@/types/auto_services";

interface ServiceOrderReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  order: ServiceOrder | null;
  onInvoicePOS?: () => void;
}

export const ServiceOrderReceipt: React.FC<ServiceOrderReceiptProps> = ({
  isOpen,
  onClose,
  order,
  onInvoicePOS,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 no-print">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Documento da Ordem de Serviço</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir Recibo
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:bg-zinc-900 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Recibo Térmico / A4 Format */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 font-mono text-xs text-zinc-200 space-y-4 shadow-inner">
          {/* Topo do Recibo */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-zinc-700">
            <h2 className="text-base font-black uppercase text-white tracking-wider">
              TICONTA AUTO GARAGEM & OFICINA
            </h2>
            <p className="text-[11px] text-zinc-400">Mecânica • Bate-Chapa • OBD-II • Estufa • Tuning</p>
            <p className="text-[10px] text-zinc-500">NUIT: 400123789 • Maputo, Moçambique</p>
            <div className="pt-2 font-bold text-emerald-400 text-sm">
              {order.status === "invoiced" ? "FATURA / RECIBO DE SERVIÇOS" : "ORÇAMENTO DE OFICINA"}
            </div>
            <p className="text-xs text-white font-bold">{order.order_number}</p>
          </div>

          {/* Dados do Veículo */}
          <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-b border-dashed border-zinc-700">
            <div>
              <span className="text-zinc-500 block">VIATURA:</span>
              <strong className="text-white">{order.vehicle?.make} {order.vehicle?.model}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block">MATRÍCULA:</span>
              <strong className="text-emerald-400">{order.vehicle?.license_plate}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block">QUILOMETRAGEM:</span>
              <span className="text-white">{order.entry_mileage ? `${order.entry_mileage.toLocaleString()} KM` : "N/D"}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">COMBUSTÍVEL:</span>
              <span className="text-white">{order.fuel_level || "1/2"}</span>
            </div>
          </div>

          {/* Tabela de Itens e Peças */}
          <div className="space-y-2 py-2 border-b border-dashed border-zinc-700">
            <div className="flex justify-between text-zinc-500 font-bold uppercase text-[10px]">
              <span>Descrição / Peça</span>
              <span>Total MT</span>
            </div>
            {order.items?.map((it, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <div>
                  <span className="text-white">{it.description}</span>
                  <span className="text-zinc-500 block text-[10px]">
                    {it.quantity}x @ {Number(it.unit_price).toLocaleString("pt-MZ")} MT ({it.item_type})
                  </span>
                </div>
                <span className="font-bold text-zinc-200">
                  {Number(it.total_price).toLocaleString("pt-MZ")} MT
                </span>
              </div>
            ))}
          </div>

          {/* Totais Fiscais */}
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal Peças:</span>
              <span>{Number(order.total_parts).toLocaleString("pt-MZ")} MT</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal Mão-de-Obra:</span>
              <span>{Number(order.total_labor).toLocaleString("pt-MZ")} MT</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>IVA Moçambique (16%):</span>
              <span>{Number(order.iva_amount).toLocaleString("pt-MZ")} MT</span>
            </div>
            <div className="flex justify-between font-black text-sm text-emerald-400 pt-2 border-t border-zinc-700">
              <span>TOTAL A PAGAR:</span>
              <span>{Number(order.total_final).toLocaleString("pt-MZ")} MT</span>
            </div>
          </div>

          {/* Termos de Garantia */}
          <div className="pt-3 border-t border-dashed border-zinc-700 text-[10px] text-zinc-500 text-center space-y-1">
            <p>Garantia técnica de 90 dias para mão-de-obra e peças instaladas.</p>
            <p className="text-[9px]">Processado por software certificado TiConta v2 ERP.</p>
          </div>
        </div>

        {/* Botão de Faturação POS */}
        {order.status !== "invoiced" && onInvoicePOS && (
          <div className="flex justify-end pt-2 no-print">
            <Button
              onClick={onInvoicePOS}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-6 shadow-lg shadow-teal-950"
            >
              Liquidar & Emitir Fatura POS
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
