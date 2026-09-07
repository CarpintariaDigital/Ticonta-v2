"use client";

import React, { useState } from "react";
import {
  CalendarCheck,
  User,
  Phone,
  Clock,
  Users,
  X,
  Sparkles,
} from "lucide-react";
import { Table } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReservationFormProps {
  table: Table;
  onReserve: (tableId: number, customerName: string, phone: string, time: string, guests: number) => Promise<any>;
  onClose: () => void;
}

export default function ReservationForm({
  table,
  onReserve,
  onClose,
}: ReservationFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("");
  const [guestCount, setGuestCount] = useState(table.capacity);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;

    setIsSubmitting(true);
    try {
      await onReserve(table.id, customerName, phone, time, guestCount);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-2xl space-y-4 text-zinc-900 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-950 font-mono">
                Reservar Mesa {table.table_number}
              </h3>
              <p className="text-xs text-zinc-500">
                Capacidade: {table.capacity} lugares • {table.location}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-700 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Nome do Cliente *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <Input
                required
                placeholder="Ex: Dr. Alberto Matsinhe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="pl-9 bg-white border-zinc-300 text-xs h-9 text-zinc-900 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Telefone / WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  placeholder="+258 84..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9 bg-white border-zinc-300 text-xs h-9 text-zinc-900 font-mono rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Hora Prevista</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-9 bg-white border-zinc-300 text-xs h-9 text-zinc-900 font-mono rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Número de Lugares / Pessoas</label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <Input
                type="number"
                min={1}
                max={table.capacity * 2}
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                className="pl-9 bg-white border-zinc-300 text-xs h-9 text-zinc-900 font-mono rounded-xl"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-zinc-300 text-zinc-700 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !customerName}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-xs"
            >
              <CalendarCheck className="w-4 h-4 mr-1.5" />
              {isSubmitting ? "Gravando..." : "Confirmar Reserva"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
