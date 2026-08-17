"use client";

import React, { useState } from "react";
import { TakeawayOrder, DeliveryAssignRequest } from "@/types/takeaway";
import { Bike, X, User, Phone, Clock, CheckCircle2 } from "lucide-react";

interface AssignCourierModalProps {
  order: TakeawayOrder;
  isLoading: boolean;
  onClose: () => void;
  onAssign: (orderId: number, data: DeliveryAssignRequest) => Promise<any>;
}

const COURIER_PRESETS = [
  { name: "Rider Carlos Sitoe", phone: "+258849998877" },
  { name: "Rider Américo Nhantumbo", phone: "+258821114433" },
  { name: "Rider Paulo Matsinhe", phone: "+258847775522" },
];

export const AssignCourierModal: React.FC<AssignCourierModalProps> = ({
  order,
  isLoading,
  onClose,
  onAssign,
}) => {
  const [courierName, setCourierName] = useState(
    order.delivery?.delivery_person_name || COURIER_PRESETS[0].name
  );
  const [courierPhone, setCourierPhone] = useState(
    order.delivery?.delivery_person_phone || COURIER_PRESETS[0].phone
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState("15");

  const handleSelectPreset = (p: { name: string; phone: string }) => {
    setCourierName(p.name);
    setCourierPhone(p.phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierName.trim()) {
      alert("Por favor informe o nome do estafeta.");
      return;
    }

    await onAssign(order.id, {
      delivery_person_name: courierName.trim(),
      delivery_person_phone: courierPhone.trim() || undefined,
      estimated_minutes: parseInt(estimatedMinutes, 10) || 15,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-5 md:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Atribuir Estafeta / Enviar</h3>
              <p className="text-xs text-slate-400">
                Pedido #{order.order_number} • {order.customer_name}
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

        {/* Delivery Address Context */}
        <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs space-y-1">
          <span className="text-purple-300 font-semibold block">Destino de Entrega:</span>
          <p className="text-white">{order.delivery_address || "Não informado"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Select Registered Couriers */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Estafetas em Serviço (1-Toque)
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {COURIER_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all text-xs ${
                    courierName === p.name
                      ? "bg-purple-950/60 border-purple-500 text-white font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bike className="w-4 h-4 text-purple-400" />
                    <span>{p.name}</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">{p.phone}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Courier Input */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Nome do Estafeta *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="Nome do motorista / estafeta"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Contacto (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="tel"
                    value={courierPhone}
                    onChange={(e) => setCourierPhone(e.target.value)}
                    placeholder="+258 84..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Previsão (Minutos)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !courierName.trim()}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/40 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? "A despachar..." : "Despachar Estafeta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
