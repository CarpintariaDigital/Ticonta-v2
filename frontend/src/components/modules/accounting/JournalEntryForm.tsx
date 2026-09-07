"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Account, CreateJournalEntryInput } from "@/types/accounting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JournalEntryFormProps {
  accounts: Account[];
  onSubmit: (data: CreateJournalEntryInput) => Promise<void>;
  onCancel?: () => void;
}

export default function JournalEntryForm({
  accounts,
  onSubmit,
  onCancel,
}: JournalEntryFormProps) {
  const [debitAccountId, setDebitAccountId] = useState<number>(0);
  const [creditAccountId, setCreditAccountId] = useState<number>(0);
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtrar apenas contas que não são de cabeçalho
  const postableAccounts = accounts.filter((a) => !a.is_header);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!debitAccountId || !creditAccountId) {
      setFormError("Por favor selecione a conta de débito e a conta de crédito.");
      return;
    }

    if (debitAccountId === creditAccountId) {
      setFormError("A conta a debitar e a conta a creditar não podem ser iguais (Regra Partidas Dobradas).");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError("O valor monetário do lançamento deve ser superior a zero.");
      return;
    }

    if (!description.trim()) {
      setFormError("Insira uma descrição explicativa para o histórico do diário.");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        debit_account_id: debitAccountId,
        credit_account_id: creditAccountId,
        amount: numAmount,
        description: description.trim(),
        entry_date: entryDate ? `${entryDate}T12:00:00Z` : undefined,
      });
    } catch (err: any) {
      setFormError(err.message || "Erro ao criar lançamento no diário.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Debit Account */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">
            Conta a Debitar (+) <span className="text-emerald-400 font-normal">Aplicação / Activo</span>
          </label>
          <select
            value={debitAccountId}
            onChange={(e) => setDebitAccountId(Number(e.target.value))}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value={0}>Selecione a conta de débito...</option>
            {postableAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_code} - {acc.account_name} ({acc.account_type})
              </option>
            ))}
          </select>
        </div>

        {/* Credit Account */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">
            Conta a Creditar (-) <span className="text-blue-400 font-normal">Origem / Passivo / Proveito</span>
          </label>
          <select
            value={creditAccountId}
            onChange={(e) => setCreditAccountId(Number(e.target.value))}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value={0}>Selecione a conta de crédito...</option>
            {postableAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_code} - {acc.account_name} ({acc.account_type})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">
            Valor do Lançamento (MZN)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white border-zinc-200 text-xs font-mono"
          />
        </div>

        {/* Entry Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">
            Data do Lançamento
          </label>
          <Input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="bg-white border-zinc-200 text-xs"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-700">
          Descrição / Histórico Contábil
        </label>
        <Input
          placeholder="Ex: Aquisição de consumíveis de escritório conforme Factura FT-2026/089"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-white border-zinc-200 text-xs"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-zinc-200 bg-zinc-50 text-zinc-700 text-xs"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              A registar...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Registar no Diário
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
