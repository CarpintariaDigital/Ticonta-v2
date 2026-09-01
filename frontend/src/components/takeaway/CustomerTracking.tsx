"use client";

import React from "react";
import { OrderTrackingResponse } from "@/types/takeaway";
import {
  Bike,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  X,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerTrackingProps {
  tracking: OrderTrackingResponse;
  onClose: () => void;
}

export const CustomerTracking: React.FC<CustomerTrackingProps> = ({
  tracking,
  onClose,
}) => {
  const currentStatus = tracking.current_status || "pending";

  const steps = [
    { key: "received", label: "Pedido Recebido", done: true },
    {
      key: "preparing",
      label: "Em Preparo na Cozinha",
      done: currentStatus !== "pending",
    },
    {
      key: "ready",
      label: "Pronto para Despacho",
      done: ["ready", "in_transit", "delivered", "picked_up"].includes(currentStatus),
    },
    {
      key: "in_transit",
      label: "Estafeta a Caminho 🛵",
      done: ["in_transit", "delivered", "picked_up"].includes(currentStatus),
    },
    {
      key: "delivered",
      label: "Entregue & Concluído",
      done: ["delivered", "picked_up"].includes(currentStatus),
    },
  ];

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Acompanhe o estado da sua encomenda TiConta (#${tracking.order_number}) aqui: https://ticonta.carpintariadigital.co.mz/track/${tracking.order_number}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-emerald-900/10 rounded-3xl w-full max-w-lg p-5 md:p-6 shadow-2xl space-y-5 text-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-emerald-950 font-mono">
                  Rastreio ao Vivo • #{tracking.order_number}
                </h3>
              </div>
              <p className="text-xs text-zinc-500">
                Previsão de Entrega: <strong className="text-emerald-700 font-mono">{tracking.estimated_delivery_time || "Em breve"}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vertical Delivery Progress Tracker */}
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 font-mono">
              Estado da Entrega
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              {currentStatus.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3 relative pl-2">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-zinc-200 -z-0" />

            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 relative z-10">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step.done
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-zinc-200 text-zinc-500"
                  }`}
                >
                  {step.done ? "✓" : idx + 1}
                </div>
                <span
                  className={`text-xs ${
                    step.done ? "text-zinc-900 font-bold" : "text-zinc-500 font-normal"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Courier Details Card if Assigned */}
        {tracking.delivery_person_name && (
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-zinc-900 block">{tracking.delivery_person_name}</span>
                <span className="text-zinc-500 font-mono">{tracking.delivery_person_phone || "Sem contacto"}</span>
              </div>
            </div>

            {tracking.delivery_person_phone && (
              <a
                href={`tel:${tracking.delivery_person_phone}`}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1 font-mono"
              >
                <Phone className="w-3.5 h-3.5" /> Ligar
              </a>
            )}
          </div>
        )}

        {/* Delivery Address & Status Notes */}
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span>Morada de Entrega:</span>
            </div>
            <p className="text-zinc-900 font-semibold pl-5">{tracking.delivery_address || "Não informada"}</p>
          </div>
        </div>

        {/* Action Buttons: WhatsApp Share & Close */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleShareWhatsApp}
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 font-mono"
          >
            <MessageCircle className="w-4 h-4" /> Enviar Link WhatsApp
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-300 text-zinc-700 text-xs font-bold rounded-xl"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
