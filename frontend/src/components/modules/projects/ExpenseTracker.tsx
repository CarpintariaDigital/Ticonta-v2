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
  const [category, setCategory] = useState<"material" | "labor" | "equipment" | "transport" | "other">("material");
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
      material: { label: "Material / Insumos", style: "bg-blue-50 text-blue-800 border-blue-200" },
      labor: { label: "Mão de Obra", style: "bg-purple-50 text-purple-800 border-purple-200" },
      equipment: { label: "Equipamento", style: "bg-amber-50 text-amber-800 border-amber-300" },
      transport: { label: "Transporte", style: "bg-emerald-50 text-emerald-800 border-emerald-300" },
      other: { label: "Outros", style: "bg-zinc-100 text-zinc-700 border-zinc-200" },
    };
    const c = map[cat] || map.other;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${c.style}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs text-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div>
          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider font-mono">
            Extrato de Despesas da Obra / Projeto
          </h4>
          <span className="text-[11px] text-zinc-500 font-mono">
            Total Lançado: <b className="text-emerald-950">{totalSpent.toLocaleString("pt-MZ")} MZN</b>
          </span>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 font-bold rounded-xl shadow-xs font-mono"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Lançar Despesa
        </Button>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs text-zinc-800">
          <thead className="bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-600 border-y border-zinc-200 font-bold">
            <tr>
              <th className="py-2.5 px-3">Data</th>
              <th className="py-2.5 px-3">Descrição da Despesa</th>
              <th className="py-2.5 px-3">Categoria</th>
              <th className="py-2.5 px-3 text-right">Valor (MZN)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-sans">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-zinc-500 text-xs">
                  Nenhuma despesa lançada nesta obra.
                </td>
              </tr>
            ) : (
              expenses.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-2 px-3 text-zinc-500 font-mono text-[11px]">{e.date}</td>
                  <td className="py-2 px-3 font-semibold text-zinc-900">{e.description}</td>
                  <td className="py-2 px-3">{getCategoryBadge(e.category)}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">
                    {Number(e.amount).toLocaleString("pt-MZ")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="border-t-2 border-zinc-200 bg-zinc-50 font-bold text-zinc-900 text-xs">
            <tr>
              <td colSpan={3} className="py-2.5 px-3 uppercase tracking-wider">
                Total Acumulado:
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-emerald-800 text-sm font-black">
                {totalSpent.toLocaleString("pt-MZ")} MZN
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Modal Lançar Despesa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-2xl space-y-4 text-zinc-900">
            <h4 className="text-sm font-black text-emerald-950 border-b border-zinc-200 pb-2 font-mono">
              Lançar Despesa no Projeto
            </h4>

            <form onSubmit={handleCreateExpense} className="space-y-3 font-sans">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Descrição do Custo</label>
                <Input
                  placeholder="Ex: Aquisição de 100 vigas de aço"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white border-zinc-300 text-xs text-zinc-900 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Valor (MZN)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="25000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-white border-zinc-300 text-xs font-mono text-zinc-900 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Data do Gasto</label>
                  <Input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="bg-white border-zinc-300 text-xs text-zinc-900 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="material">Material / Insumos de Construção</option>
                  <option value="labor">Mão de Obra / Salários Encarregados</option>
                  <option value="equipment">Aluguer de Equipamentos e Máquinas</option>
                  <option value="transport">Transporte / Logística de Cargas</option>
                  <option value="other">Outras Despesas Diretas</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs border-zinc-300 text-zinc-700 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !description.trim() || !amount}
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl font-mono shadow-xs"
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
