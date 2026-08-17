"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FileText, Plus } from "lucide-react";
import { Account } from "@/types/accounting";
import { Button } from "@/components/ui/button";

interface ChartOfAccountsProps {
  accounts: Account[];
  onSelectAccount?: (account: Account) => void;
  onAddNewAccount?: () => void;
}

export default function ChartOfAccounts({
  accounts,
  onSelectAccount,
  onAddNewAccount,
}: ChartOfAccountsProps) {
  const [collapsedClasses, setCollapsedClasses] = useState<Record<string, boolean>>({});

  const toggleClass = (classCode: string) => {
    setCollapsedClasses((prev) => ({
      ...prev,
      [classCode]: !prev[classCode],
    }));
  };

  const getAccountClass = (code: string) => code.split(".")[0];

  const classDescriptions: Record<string, string> = {
    "1": "Classe 1: Meios Financeiros Líquidos (Activo)",
    "2": "Classe 2: Inventários e Activos Biológicos (Activo)",
    "3": "Classe 3: Investimentos de Capital (Activo Não Corrente)",
    "4": "Classe 4: Contas a Receber, a Pagar e Acréscimos/Diferimentos",
    "5": "Classe 5: Capital Próprio",
    "6": "Classe 6: Gastos e Perdas (Custos Operacionais)",
    "7": "Classe 7: Rendimentos e Ganhos (Proveitos)",
    "8": "Classe 8: Resultados do Exercício",
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    const classNum = getAccountClass(account.account_code);
    if (!acc[classNum]) acc[classNum] = [];
    acc[classNum].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Plano de Contas (PGC-NIRF Moçambique)</h2>
          <p className="text-xs text-zinc-400">
            Estrutura hierárquica padronizada de contas para escrituração contábil
          </p>
        </div>
        {onAddNewAccount && (
          <Button
            onClick={onAddNewAccount}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nova Conta
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {Object.keys(groupedAccounts).sort().map((classNum) => {
          const isCollapsed = !!collapsedClasses[classNum];
          const classAccounts = groupedAccounts[classNum];

          return (
            <div
              key={classNum}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 overflow-hidden"
            >
              {/* Class Header */}
              <button
                onClick={() => toggleClass(classNum)}
                className="w-full flex items-center justify-between p-3.5 bg-zinc-900/90 hover:bg-zinc-800/70 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-emerald-400" />
                  )}
                  <Folder className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {classDescriptions[classNum] || `Classe ${classNum}`}
                  </span>
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  {classAccounts.length} conta(s)
                </span>
              </button>

              {/* Accounts Table List */}
              {!isCollapsed && (
                <div className="divide-y divide-zinc-800/40">
                  {classAccounts.map((account) => {
                    const isHeader = account.is_header;

                    return (
                      <div
                        key={account.id}
                        onClick={() => onSelectAccount && onSelectAccount(account)}
                        className={`flex items-center justify-between px-4 py-2.5 text-xs transition-colors hover:bg-zinc-900/50 ${
                          isHeader ? "bg-zinc-900/30 font-bold text-zinc-200" : "text-zinc-300 pl-8"
                        } ${onSelectAccount ? "cursor-pointer" : ""}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {!isHeader && <FileText className="h-3.5 w-3.5 text-zinc-500 shrink-0" />}
                          <span className="font-mono font-semibold text-emerald-400 w-16 shrink-0">
                            {account.account_code}
                          </span>
                          <span className="truncate">{account.account_name}</span>
                          <span
                            className={`ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                              account.account_type === "asset"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : account.account_type === "liability"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : account.account_type === "equity"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : account.account_type === "revenue"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {account.account_type}
                          </span>
                        </div>

                        <div className="flex items-center gap-6 text-right font-mono">
                          <div className="w-24 hidden md:block text-zinc-400">
                            Déb: {Number(account.debit_balance).toFixed(2)}
                          </div>
                          <div className="w-24 hidden md:block text-zinc-400">
                            Créd: {Number(account.credit_balance).toFixed(2)}
                          </div>
                          <div className="w-28 font-bold text-white">
                            Saldo: {Number(account.current_balance).toFixed(2)} MZN
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
