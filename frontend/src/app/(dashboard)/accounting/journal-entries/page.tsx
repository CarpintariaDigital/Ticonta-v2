"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle, RefreshCw, FileText, Search } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import JournalEntryForm from "@/components/modules/accounting/JournalEntryForm";
import { accountingService } from "@/services/accounting";
import { Account, CreateJournalEntryInput, JournalEntry } from "@/types/accounting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [accs, jEntries] = await Promise.all([
        accountingService.getChartOfAccounts(),
        accountingService.getJournalEntries(),
      ]);
      setAccounts(accs);
      setEntries(jEntries);
    } catch (err) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEntry = async (data: CreateJournalEntryInput) => {
    await accountingService.createJournalEntry(data);
    setShowModal(false);
    loadData();
  };

  const filteredEntries = entries.filter((e) => {
    const q = searchTerm.toLowerCase();
    return (
      e.entry_number.toLowerCase().includes(q) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.debit_account_name && e.debit_account_name.toLowerCase().includes(q)) ||
      (e.credit_account_name && e.credit_account_name.toLowerCase().includes(q))
    );
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/accounting">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Diário e Razão Geral</h1>
              <p className="text-xs text-zinc-400">Lançamentos de Partidas Dobradas</p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
            Novo Lançamento
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Pesquisar por número do diário ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border-zinc-800 pl-9 text-xs"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Atualizar
            </Button>
          </div>

          {/* Entries Table */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Nº Diário</th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Conta Débito (+)</th>
                    <th className="py-3 px-4">Conta Crédito (-)</th>
                    <th className="py-3 px-4">Histórico / Descrição</th>
                    <th className="py-3 px-4 text-right">Montante (MZN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500 font-sans text-xs">
                        Nenhum lançamento registrado no diário contábil.
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">{entry.entry_number}</td>
                        <td className="py-3 px-4 text-zinc-400">
                          {new Date(entry.entry_date).toLocaleDateString("pt-MZ")}
                        </td>
                        <td className="py-3 px-4 text-emerald-400">
                          {entry.debit_account_code} - {entry.debit_account_name || `Conta #${entry.debit_account_id}`}
                        </td>
                        <td className="py-3 px-4 text-blue-400">
                          {entry.credit_account_code} - {entry.credit_account_name || `Conta #${entry.credit_account_id}`}
                        </td>
                        <td className="py-3 px-4 text-zinc-300 max-w-xs truncate font-sans">
                          {entry.description || "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-white">
                          {Number(entry.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Modal Novo Lançamento */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3">
                Novo Lançamento no Diário (Partida Dobrada)
              </h3>
              <JournalEntryForm
                accounts={accounts}
                onSubmit={handleCreateEntry}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
