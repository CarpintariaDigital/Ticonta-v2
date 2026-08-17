"use client";

import { useState } from "react";
import { Plus, DollarSign, Tag, Calendar, AlertCircle } from "lucide-react";
import { CreateExpenseInput, ProjectExpense } from "@/types/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ExpenseTrackerProps {
  projectId: number;
  expenses: ProjectExpense[];
  onAddExpense: (data: CreateExpenseInput) => Promise<any>;
}

export default function ExpenseTracker({
  projectId,
  expenses,
  onAddExpense,
}: ExpenseTrackerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CreateExpenseInput["category"]>("material");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);

  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) return;

    setIsLoading(true);
    try {
      await onAddExpense({
        description: description.trim(),
        amount: numAmount,
        category,
        date: expenseDate,
      });
      setDescription("");
      setAmount("");
      setShowAddModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    const map: Record<string, { label: string; style: string }> = {
      material: { label: "Material / Insumos", style: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
      labor: { label: "Mão de Obra / Pessoal", style: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
      equipment: { label: "Equipamento / Aluguer", style: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
      transport: { label: "Transporte / Frete", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
      other: { label: "Outros", style: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
    };
    const c = map[cat] || map.other;
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${c.style}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-5">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Extrato de Despesas da Obra / Projeto
          </h4>
          <span className="text-[11px] text-zinc-400 font-mono">
            Total Lançado: <b className="text-white">{totalSpent.toLocaleString("pt-MZ")} MZN</b>
          </span>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 font-bold"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Lançar Despesa
        </Button>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs text-zinc-300">
          <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-y border-zinc-800">
            <tr>
              <th className="py-2.5 px-3">Data</th>
              <th className="py-2.5 px-3">Descrição da Despesa</th>
              <th className="py-2.5 px-3">Categoria</th>
              <th className="py-2.5 px-3 text-right">Valor (MZN)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40 font-sans">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-zinc-500 text-xs">
                  Nenhuma despesa lançada nesta obra.
                </td>
              </tr>
            ) : (
              expenses.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-2 px-3 text-zinc-400 font-mono text-[11px]">{e.date}</td>
                  <td className="py-2 px-3 font-medium text-white">{e.description}</td>
                  <td className="py-2 px-3">{getCategoryBadge(e.category)}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-white">
                    {Number(e.amount).toLocaleString("pt-MZ")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="border-t-2 border-zinc-700 bg-zinc-950 font-bold text-white text-xs">
            <tr>
              <td colSpan={3} className="py-2.5 px-3 uppercase tracking-wider">
                Total Acumulado:
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                {totalSpent.toLocaleString("pt-MZ")} MZN
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Modal Lançar Despesa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">
              Lançar Despesa no Projeto
            </h4>

            <form onSubmit={handleCreateExpense} className="space-y-3 font-sans">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Descrição do Custo</label>
                <Input
                  placeholder="Ex: Aquisição de 100 vigas de aço"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Valor (MZN)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="25000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Data do Gasto</label>
                  <Input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="material">Material / Insumos de Construção</option>
                  <option value="labor">Mão de Obra / Salários Encarregados</option>
                  <option value="equipment">Aluguer de Equipamentos e Máquinas</option>
                  <option value="transport">Transporte / Logística de Cargas</option>
                  <option value="other">Outras Despesas Diretas</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs border-zinc-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !description.trim() || !amount}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Registar Despesa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
