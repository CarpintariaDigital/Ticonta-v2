"use client";

import React, { useState } from "react";
import { UserPlus, X, Phone, MapPin, DollarSign, FileText, CheckCircle2 } from "lucide-react";

interface NewCustomerModalProps {
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    phone?: string;
    location?: string;
    trusted_credit_limit?: number;
    notes?: string;
  }) => Promise<any>;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isLoading,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [creditLimit, setCreditLimit] = useState("5000");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Informe o nome do cliente.");
      return;
    }

    await onSubmit({
      name: name.trim(),
      phone: phone.trim() || undefined,
      location: location.trim() || undefined,
      trusted_credit_limit: parseFloat(creditLimit) || 5000,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-zinc-200/80 rounded-2xl w-full max-w-md p-5 md:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Novo Cliente Informal</h3>
              <p className="text-xs text-zinc-500">Cadastro rápido para vendas e fiado</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Nome do Cliente *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Dona Maria Machava"
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Telefone / WhatsApp (Opcional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+258 84 123 4567"
                className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Bairro / Rua / Ponto de Referência
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Chamanculo C, próximo à escola"
                className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Limite Máximo de Fiado (MT)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Observações / Preferências
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Paga sempre à sexta-feira após fecho do mercado..."
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950/40 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? "A guardar..." : "Salvar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
