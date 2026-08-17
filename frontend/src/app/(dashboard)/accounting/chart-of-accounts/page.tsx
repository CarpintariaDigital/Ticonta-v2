"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle, RefreshCw } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChartOfAccounts from "@/components/modules/accounting/ChartOfAccounts";
import { accountingService } from "@/services/accounting";
import { Account } from "@/types/accounting";
import { Button } from "@/components/ui/button";

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await accountingService.getChartOfAccounts();
      setAccounts(data);
    } catch (err) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

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
              <h1 className="text-base font-bold text-white leading-tight">Plano Geral de Contas</h1>
              <p className="text-xs text-zinc-400">Classificação Contábil PGC-NIRF</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadAccounts}
            className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Atualizar
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6">
          <ChartOfAccounts accounts={accounts} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
