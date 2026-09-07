"use client";

import React, { useState } from "react";
import { TakeawayOrder, DeliveryAssignRequest } from "@/types/takeaway";
import { Bike, X, User, Phone, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-emerald-900/10 rounded-3xl w-full max-w-md p-5 md:p-6 shadow-2xl space-y-4 text-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-950 font-mono">Atribuir Estafeta / Enviar</h3>
              <p className="text-xs text-zinc-500">
                Pedido #{order.order_number} • {order.customer_name}
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

        {/* Delivery Address Context */}
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-xs space-y-1">
          <span className="text-sky-900 font-bold block">Destino de Entrega:</span>
          <p className="text-zinc-800 font-medium">{order.delivery_address || "Não informado"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Select Registered Couriers */}
          <div>
            <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider block mb-1.5 font-mono">
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
                      ? "bg-sky-50 border-sky-300 text-sky-900 font-bold shadow-xs"
                      : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bike className="w-4 h-4 text-sky-600" />
                    <span>{p.name}</span>
                  </div>
                  <span className="text-zinc-500 font-mono text-[11px]">{p.phone}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Courier Input */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                Nome do Estafeta *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <Input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="Nome do motorista / estafeta"
                  className="pl-9 bg-white border-zinc-300 rounded-xl text-zinc-900 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                  Contacto (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                  <Input
                    type="tel"
                    value={courierPhone}
                    onChange={(e) => setCourierPhone(e.target.value)}
                    placeholder="+258 84..."
                    className="pl-9 bg-white border-zinc-300 rounded-xl text-zinc-900 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                  Previsão (Minutos)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                  <Input
                    type="number"
                    min="5"
                    max="120"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(e.target.value)}
                    className="pl-9 bg-white border-zinc-300 rounded-xl text-zinc-900 text-xs font-bold font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-zinc-300 text-zinc-700 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !courierName.trim()}
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 font-mono"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? "A despachar..." : "Despachar Estafeta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
