"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  User,
  Phone,
  CheckCircle2,
  X,
  CalendarCheck,
} from "lucide-react";
import { Table } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReservationFormProps {
  table: Table;
  onReserve: (tableId: number, data: { guest_count: number; reservation_time: string; customer_name: string; customer_phone?: string }) => Promise<any>;
  onClose: () => void;
}

export default function ReservationForm({
  table,
  onReserve,
  onClose,
}: ReservationFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+258 84 ");
  const [guestCount, setGuestCount] = useState(table.capacity || 2);
  const [reservationDate, setReservationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reservationTime, setReservationTime] = useState("20:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;

    setIsSubmitting(true);
    try {
      const fullDateTime = `${reservationDate}T${reservationTime}:00`;
      await onReserve(table.id, {
        guest_count: guestCount,
        reservation_time: fullDateTime,
        customer_name: customerName,
        customer_phone: customerPhone,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl text-zinc-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Reservar Mesa {table.table_number}
              </h3>
              <p className="text-xs text-zinc-400">
                Capacidade: {table.capacity} lugares • {table.location}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">
              Nome do Cliente / Reserva *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <Input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Carlos Mondlane"
                className="pl-9 bg-zinc-950 border-zinc-800 text-xs h-9 text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">
              Telefone de Contacto (Moçambique)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+258 84 123 4567"
                className="pl-9 bg-zinc-950 border-zinc-800 text-xs h-9 text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">
                Data da Reserva
              </label>
              <Input
                type="date"
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs h-9 text-zinc-100"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">
                Hora da Reserva
              </label>
              <Input
                type="time"
                value={reservationTime}
                onChange={(e) => setReservationTime(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs h-9 text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">
              Número de Pessoas
            </label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <Input
                type="number"
                min={1}
                max={table.capacity * 2}
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                className="pl-9 bg-zinc-950 border-zinc-800 text-xs h-9 text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-zinc-700 text-zinc-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !customerName}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
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
