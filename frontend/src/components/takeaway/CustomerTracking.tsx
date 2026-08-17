"use client";

import React from "react";
import { OrderTrackingResponse } from "@/types/takeaway";
import {
  CheckCircle2,
  Clock,
  Bike,
  ShoppingBag,
  MapPin,
  Phone,
  MessageSquare,
  X,
  Share2,
  Navigation,
} from "lucide-react";

interface CustomerTrackingProps {
  tracking: OrderTrackingResponse;
  onClose: () => void;
}

export const CustomerTracking: React.FC<CustomerTrackingProps> = ({ tracking, onClose }) => {
  const isDelivery = tracking.order_type === "delivery";

  const handleWhatsAppContact = () => {
    const phone = tracking.delivery_person_phone || tracking.customer_phone;
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    const text = `Olá! Gostaria de saber uma atualização da entrega do pedido #${tracking.order_number} no TiConta.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-5 md:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              {isDelivery ? <Bike className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Rastreio em Tempo Real #{tracking.order_number}
              </h3>
              <p className="text-xs text-slate-400">
                {tracking.customer_name} • {tracking.order_type === "delivery" ? "Entrega ao Domicílio" : "Takeaway"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ETA & Status Banner */}
        <div className="p-4 bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider block">
              Previsão de Entrega / Prontidão
            </span>
            <div className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
              <Clock className="w-5 h-5 text-amber-400" />
              ~{tracking.total_estimated_minutes} minutos
            </div>
          </div>

          {tracking.tracking_code && (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Código de Rastreio</span>
              <span className="font-mono font-bold text-xs bg-slate-900 px-2 py-1 rounded text-purple-300 border border-purple-500/30">
                {tracking.tracking_code}
              </span>
            </div>
          )}
        </div>

        {/* 4-Step Progress Tracker */}
        <div className="py-2 space-y-4">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Progresso do Pedido
          </span>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {tracking.steps.map((step) => {
              const isDone = step.status === "completed";
              const isCurrent = step.status === "current";

              return (
                <div key={step.step_number} className="relative flex items-start gap-3 text-xs">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                      isDone
                        ? "bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-900/50"
                        : isCurrent
                        ? "bg-amber-500 border-amber-300 text-slate-950 animate-pulse shadow-md shadow-amber-900/50"
                        : "bg-slate-900 border-slate-700 text-slate-500"
                    }`}
                  >
                    {isDone ? "✓" : step.step_number}
                  </div>

                  <div className="flex-1">
                    <span
                      className={`font-bold block ${
                        isDone ? "text-emerald-400" : isCurrent ? "text-amber-300 text-sm" : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.timestamp && (
                      <span className="text-[11px] text-slate-500 block">
                        {new Date(step.timestamp).toLocaleTimeString("pt-MZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courier / Driver Card (if assigned) */}
        {tracking.delivery_person_name && (
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 border border-purple-400 flex items-center justify-center font-bold text-white text-sm">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Estafeta Responsável</span>
                <span className="font-bold text-white block">{tracking.delivery_person_name}</span>
                {tracking.delivery_person_phone && (
                  <span className="text-slate-500 text-[11px]">{tracking.delivery_person_phone}</span>
                )}
              </div>
            </div>

            {tracking.delivery_person_phone && (
              <button
                onClick={handleWhatsAppContact}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 shadow transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </button>
            )}
          </div>
        )}

        {/* Delivery Address & Summary */}
        {tracking.delivery_address && (
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-1">
            <span className="text-slate-400 font-semibold block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-purple-400" /> Endereço de Entrega:
            </span>
            <p className="text-white">{tracking.delivery_address}</p>
          </div>
        )}

        {/* Order Items Preview */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs flex justify-between items-center">
          <span className="text-slate-400">Total ({tracking.items_summary.length} itens):</span>
          <span className="font-extrabold text-emerald-400 text-sm">
            {tracking.total_amount.toLocaleString("pt-MZ")} MT
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
