"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, DollarSign } from "lucide-react";
import { CreateLeadInput, LeadSource } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LeadFormProps {
  onSubmit: (data: CreateLeadInput) => Promise<void>;
  onCancel: () => void;
}

export default function LeadForm({ onSubmit, onCancel }: LeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<LeadSource>("whatsapp");
  const [value, setValue] = useState("");
  const [probability, setProbability] = useState("10");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("O nome da oportunidade / empresa é obrigatório.");
      return;
    }

    const numValue = parseFloat(value) || 0;
    const numProb = parseInt(probability, 10) || 10;

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        source,
        value: numValue,
        probability: numProb,
        notes: notes.trim() || undefined,
      });
    } catch (err: any) {
      setError(err.message || "Erro ao registar lead comercial.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-700">
          Nome da Empresa / Cliente <span className="text-emerald-400">*</span>
        </label>
        <Input
          placeholder="Ex: Armazéns e Logística Maputo Lda"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white border-zinc-200 text-xs text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Telefone / WhatsApp</label>
          <Input
            placeholder="+258 84 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-white border-zinc-200 text-xs text-white font-mono"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">E-mail Comercial</label>
          <Input
            type="email"
            placeholder="comercial@empresa.co.mz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white border-zinc-200 text-xs text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Source */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Origem / Canal</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as LeadSource)}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="website">Website / Formulário</option>
            <option value="referral">Indicação / Parceiro</option>
            <option value="direct">Contacto Direto</option>
            <option value="phone">Chamada Telefónica</option>
          </select>
        </div>

        {/* Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Valor Estimado (MZN)</label>
          <Input
            type="number"
            step="100"
            placeholder="50000"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-white border-zinc-200 text-xs text-white font-mono"
          />
        </div>

        {/* Probability */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Probabilidade (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="10"
            value={probability}
            onChange={(e) => setProbability(e.target.value)}
            className="bg-white border-zinc-200 text-xs text-white font-mono"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-700">Observações / Requisitos</label>
        <textarea
          rows={3}
          placeholder="Descreva detalhes adicionais, produtos de interesse e urgência de fecho..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border border-zinc-200 bg-white p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-zinc-200 bg-zinc-50 text-zinc-700 text-xs"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              A guardar...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Criar Lead
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
