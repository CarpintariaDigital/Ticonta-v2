"use client";

import { useState } from "react";
import { Plus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { CreateProjectInput } from "@/types/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProjectFormProps {
  onSubmit: (data: CreateProjectInput) => Promise<void>;
  onCancel: () => void;
}

export default function ProjectForm({ onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("O nome do projeto ou obra é obrigatório.");
      return;
    }

    const numBudget = parseFloat(budget) || 0;

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        budget: numBudget,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
    } catch (err: any) {
      setError(err.message || "Erro ao criar projeto.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans text-zinc-900">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Project Name */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-700">
          Nome do Projeto / Obra <span className="text-emerald-600">*</span>
        </label>
        <Input
          placeholder="Ex: Reforma Pavilhão Fabril e Montagem de Silos"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white border-zinc-300 text-xs text-zinc-900 rounded-xl"
        />
      </div>

      {/* Budget */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-700">
          Orçamento Total Aprovado (MZN) <span className="text-emerald-600">*</span>
        </label>
        <Input
          type="number"
          step="100"
          placeholder="500000"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="bg-white border-zinc-300 text-xs font-mono text-zinc-900 rounded-xl"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">Data de Início</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-white border-zinc-300 text-xs text-zinc-900 rounded-xl"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">Previsão de Conclusão</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-white border-zinc-300 text-xs text-zinc-900 rounded-xl"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-700">Escopo dos Trabalhos / Descrição</label>
        <textarea
          rows={3}
          placeholder="Detalhamento técnico, materiais principais e cláusulas contratuais..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-zinc-300 text-zinc-700 text-xs rounded-xl"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl font-mono shadow-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              A criar...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Criar Projeto
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
