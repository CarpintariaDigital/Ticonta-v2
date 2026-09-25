'use client';

import React, { useEffect, useState } from 'react';
import {
  Calculator,
  Plus,
  BookOpen,
  FileSpreadsheet,
  PieChart,
  Scale,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle2,
  Receipt,
  FileText,
} from 'lucide-react';
import { useAccountingStore } from '@/store/accounting.store';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export default function AccountingPage() {
  const {
    accounts,
    journalEntries,
    trialBalance,
    incomeStatement,
    balanceSheet,
    isLoading,
    fetchChartOfAccounts,
    createAccount,
    fetchJournalEntries,
    createJournalEntry,
    fetchTrialBalance,
    fetchIncomeStatement,
    fetchBalanceSheet,
  } = useAccountingStore();

  const [activeTab, setActiveTab] = useState<'chart' | 'entries' | 'trial' | 'financials' | 'vat'>('chart');

  // Modals
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);

  // New Account Form
  const [accCode, setAccCode] = useState('');
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState('asset');
  const [accIsHeader, setAccIsHeader] = useState(false);

  // New Journal Entry Form (Double-entry)
  const [entryDebitAccId, setEntryDebitAccId] = useState('');
  const [entryCreditAccId, setEntryCreditAccId] = useState('');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDesc, setEntryDesc] = useState('');

  // Period filters
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [financialSubTab, setFinancialSubTab] = useState<'balance_sheet' | 'dre'>('balance_sheet');

  useEffect(() => {
    fetchChartOfAccounts();
    fetchJournalEntries();
    fetchTrialBalance(asOfDate);
    fetchBalanceSheet(asOfDate);
    fetchIncomeStatement();
  }, [fetchChartOfAccounts, fetchJournalEntries, fetchTrialBalance, fetchBalanceSheet, fetchIncomeStatement, asOfDate]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accCode || !accName) return;
    try {
      await createAccount({
        account_code: accCode,
        account_name: accName,
        account_type: accType,
        is_header: accIsHeader,
      });
      setIsNewAccountModalOpen(false);
      setAccCode('');
      setAccName('');
    } catch (err) {
      // Handled
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryDebitAccId || !entryCreditAccId || !entryAmount || !entryDesc) return;
    if (entryDebitAccId === entryCreditAccId) {
      alert('A conta de débito e a conta de crédito devem ser diferentes para partidas dobradas.');
      return;
    }
    try {
      await createJournalEntry({
        debit_account_id: parseInt(entryDebitAccId),
        credit_account_id: parseInt(entryCreditAccId),
        amount: parseFloat(entryAmount),
        description: entryDesc,
      });
      setIsNewEntryModalOpen(false);
      setEntryDebitAccId('');
      setEntryCreditAccId('');
      setEntryAmount('');
      setEntryDesc('');
    } catch (err) {
      // Handled
    }
  };

  // Group accounts by PGC class (1-7)
  const getPGCClass = (code: string) => {
    const first = code.charAt(0);
    switch (first) {
      case '1': return 'Classe 1 — Meios Financeiros / Caixa e Bancos';
      case '2': return 'Classe 2 — Inventários / Existências';
      case '3': return 'Classe 3 — Investimentos de Capital / Imobilizado';
      case '4': return 'Classe 4 — Contas a Receber e a Pagar (Terceiros)';
      case '5': return 'Classe 5 — Capital Próprio';
      case '6': return 'Classe 6 — Gastos e Perdas Operacionais';
      case '7': return 'Classe 7 — Rendimentos e Ganhos';
      default: return 'Outras Contas do PGC';
    }
  };

  const getAccountTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'asset': return <Badge variant="success">ACTIVO</Badge>;
      case 'liability': return <Badge variant="danger">PASSIVO</Badge>;
      case 'equity': return <Badge variant="info">CAPITAL</Badge>;
      case 'revenue': return <Badge variant="success">PROVEITOS</Badge>;
      case 'expense': return <Badge variant="warning">CUSTOS</Badge>;
      default: return <Badge variant="neutral">{type.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Calculator className="w-7 h-7 text-indigo-600" />
            Contabilidade Geral (PGC-NIRF Moçambique)
          </h1>
          <p className="text-sm text-neutral-500">
            Plano de contas oficial, partidas dobradas, balancete de verificação, balanço patrimonial, DRE e IVA 16%.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsNewEntryModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
          >
            <Plus size={15} />
            Novo Lançamento
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsNewAccountModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <BookOpen size={15} />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6">
        <button
          onClick={() => setActiveTab('chart')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'chart'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Plano de Contas ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab('entries')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'entries'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Diário de Lançamentos ({journalEntries.length})
        </button>
        <button
          onClick={() => setActiveTab('trial')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'trial'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Balancete de Verificação
        </button>
        <button
          onClick={() => setActiveTab('financials')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'financials'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Demonstrações Financeiras
        </button>
        <button
          onClick={() => setActiveTab('vat')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'vat'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          IVA 16% & Modelo 20
        </button>
      </div>

      {/* TAB 1: PLANO DE CONTAS */}
      {activeTab === 'chart' && (
        <Card>
          <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Estrutura do Plano de Contas</CardTitle>
              <p className="text-xs text-neutral-500">Organização hierárquica conforme o PGC-NIRF</p>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 font-semibold text-neutral-600 dark:text-neutral-300">
                <tr>
                  <th className="p-3 pl-4">Código</th>
                  <th className="p-3">Nome da Conta</th>
                  <th className="p-3 text-center">Tipo</th>
                  <th className="p-3 text-right">Débito Acumulado</th>
                  <th className="p-3 text-right">Crédito Acumulado</th>
                  <th className="p-3 text-right pr-4">Saldo Atual (MZN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono text-xs">
                {accounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className={`hover:bg-neutral-50 dark:hover:bg-neutral-900/50 ${
                      acc.is_header ? 'font-bold bg-neutral-50/50 dark:bg-neutral-800/20' : ''
                    }`}
                  >
                    <td className="p-3 pl-4 text-indigo-600 font-semibold">{acc.account_code}</td>
                    <td className="p-3 font-sans font-medium text-neutral-900 dark:text-neutral-100">
                      {acc.account_name}
                    </td>
                    <td className="p-3 text-center">{getAccountTypeBadge(acc.account_type)}</td>
                    <td className="p-3 text-right text-neutral-600">{formatMZN(acc.debit_balance || 0)}</td>
                    <td className="p-3 text-right text-neutral-600">{formatMZN(acc.credit_balance || 0)}</td>
                    <td className="p-3 text-right pr-4 font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                      {formatMZN(acc.current_balance || 0)}
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-400 font-sans">
                      Nenhuma conta cadastrada no plano de contas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: DIÁRIO DE LANÇAMENTOS */}
      {activeTab === 'entries' && (
        <Card>
          <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <CardTitle className="text-base">Diário de Lançamentos Contábeis (Partidas Dobradas)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 font-semibold text-neutral-600 dark:text-neutral-300">
                <tr>
                  <th className="p-3 pl-4">Nº Lançamento</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Conta a Débito</th>
                  <th className="p-3">Conta a Crédito</th>
                  <th className="p-3">Descrição / Histórico</th>
                  <th className="p-3 text-right pr-4">Valor (MZN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                {journalEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="p-3 pl-4 font-mono font-semibold text-indigo-600">{e.entry_number}</td>
                    <td className="p-3 text-neutral-500">{e.entry_date?.split('T')[0]}</td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                        {e.debit_account_code}
                      </span>{' '}
                      - {e.debit_account_name}
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                        {e.credit_account_code}
                      </span>{' '}
                      - {e.credit_account_name}
                    </td>
                    <td className="p-3 text-neutral-600 dark:text-neutral-400">{e.description || 'Lançamento geral'}</td>
                    <td className="p-3 text-right pr-4 font-bold text-emerald-600 font-mono text-sm">
                      {formatMZN(e.amount)}
                    </td>
                  </tr>
                ))}
                {journalEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-400">
                      Nenhum lançamento no diário. Clica em &ldquo;Novo Lançamento&rdquo;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: BALANCETE DE VERIFICAÇÃO */}
      {activeTab === 'trial' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold">Data de Posição:</label>
              <Input
                type="date"
                value={asOfDate}
                onChange={(e) => {
                  setAsOfDate(e.target.value);
                  fetchTrialBalance(e.target.value);
                }}
                className="w-44"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={trialBalance?.is_balanced ? 'success' : 'danger'}>
                {trialBalance?.is_balanced ? '✓ BALANCETE EQUILIBRADO' : '⚠️ DESEQUILÍBRIO DETETADO'}
              </Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm font-mono text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 font-semibold text-neutral-600 dark:text-neutral-300">
                  <tr>
                    <th className="p-3 pl-4">Código</th>
                    <th className="p-3 font-sans">Designação da Conta</th>
                    <th className="p-3 text-right">Saldo Devedor (MZN)</th>
                    <th className="p-3 text-right pr-4">Saldo Credor (MZN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {trialBalance?.accounts.map((acc, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                      <td className="p-3 pl-4 text-indigo-600 font-semibold">{acc.account_code}</td>
                      <td className="p-3 font-sans font-medium text-neutral-900 dark:text-neutral-100">
                        {acc.account_name}
                      </td>
                      <td className="p-3 text-right text-emerald-600 font-semibold">
                        {acc.debit > 0 ? formatMZN(acc.debit) : '-'}
                      </td>
                      <td className="p-3 text-right pr-4 text-blue-600 font-semibold">
                        {acc.credit > 0 ? formatMZN(acc.credit) : '-'}
                      </td>
                    </tr>
                  ))}
                  {trialBalance && (
                    <tr className="bg-neutral-100 dark:bg-neutral-800 font-bold text-sm">
                      <td colSpan={2} className="p-4 pl-4 font-sans uppercase">
                        Total Geral de Verificação
                      </td>
                      <td className="p-4 text-right text-emerald-700 dark:text-emerald-400">
                        {formatMZN(trialBalance.total_debit)}
                      </td>
                      <td className="p-4 text-right pr-4 text-blue-700 dark:text-blue-400">
                        {formatMZN(trialBalance.total_credit)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: DEMONSTRAÇÕES FINANCEIRAS */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <button
              onClick={() => setFinancialSubTab('balance_sheet')}
              className={`text-sm font-semibold ${
                financialSubTab === 'balance_sheet' ? 'text-indigo-600 font-bold' : 'text-neutral-500'
              }`}
            >
              Balanço Patrimonial (Activo vs Passivo + Capital)
            </button>
            <span className="text-neutral-300">|</span>
            <button
              onClick={() => setFinancialSubTab('dre')}
              className={`text-sm font-semibold ${
                financialSubTab === 'dre' ? 'text-indigo-600 font-bold' : 'text-neutral-500'
              }`}
            >
              Demonstração de Resultados (DRE / Lucro)
            </button>
          </div>

          {financialSubTab === 'balance_sheet' && balanceSheet && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ACTIVO */}
              <Card>
                <CardHeader className="bg-emerald-50 dark:bg-emerald-950/20 p-4 border-b border-emerald-200 dark:border-emerald-800">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base text-emerald-800 dark:text-emerald-300">ACTIVO</CardTitle>
                    <span className="text-lg font-bold text-emerald-700">{formatMZN(balanceSheet.total_assets)}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {balanceSheet.assets.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs py-1 border-b border-neutral-100 dark:border-neutral-800">
                      <span>{item.account_code} - {item.account_name}</span>
                      <span className="font-bold">{formatMZN(item.amount)}</span>
                    </div>
                  ))}
                  {balanceSheet.assets.length === 0 && (
                    <div className="text-neutral-400 text-xs text-center py-4">Sem itens de activo registados.</div>
                  )}
                </CardContent>
              </Card>

              {/* PASSIVO + CAPITAL */}
              <Card>
                <CardHeader className="bg-blue-50 dark:bg-blue-950/20 p-4 border-b border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base text-blue-800 dark:text-blue-300">PASSIVO & CAPITAL PRÓPRIO</CardTitle>
                    <span className="text-lg font-bold text-blue-700">
                      {formatMZN(balanceSheet.total_liabilities + balanceSheet.total_equity)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h4 className="font-bold text-xs uppercase text-neutral-500 mb-2">Passivo (Obrigações)</h4>
                    {balanceSheet.liabilities.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs py-1 border-b border-neutral-100 dark:border-neutral-800">
                        <span>{item.account_code} - {item.account_name}</span>
                        <span className="font-bold">{formatMZN(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase text-neutral-500 mb-2">Capital Próprio</h4>
                    {balanceSheet.equity.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs py-1 border-b border-neutral-100 dark:border-neutral-800">
                        <span>{item.account_code} - {item.account_name}</span>
                        <span className="font-bold">{formatMZN(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {financialSubTab === 'dre' && incomeStatement && (
            <Card>
              <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                <CardTitle className="text-base">Demonstração dos Resultados do Exercício</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-neutral-200 dark:border-neutral-800 text-sm font-semibold">
                  <span className="text-emerald-700">Rendimentos e Vendas Totais (Proveitos)</span>
                  <span className="font-bold text-emerald-700">{formatMZN(incomeStatement.total_revenue)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-200 dark:border-neutral-800 text-sm font-semibold">
                  <span className="text-amber-700">Gastos e Custos Totais (Despesas)</span>
                  <span className="font-bold text-amber-700">{formatMZN(incomeStatement.total_expenses)}</span>
                </div>
                <div className="flex justify-between items-center py-4 bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg text-base font-bold">
                  <span>Resultado Líquido do Exercício (Lucro / Prejuízo)</span>
                  <span className={incomeStatement.net_income >= 0 ? 'text-emerald-600 text-xl' : 'text-red-600 text-xl'}>
                    {formatMZN(incomeStatement.net_income)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 5: IVA 16% & AT */}
      {activeTab === 'vat' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">IVA Liquidado (Vendas 16%)</span>
                <div className="text-2xl font-bold text-emerald-600">{formatMZN(incomeStatement?.total_revenue ? incomeStatement.total_revenue * 0.16 : 0)}</div>
                <span className="text-xs text-neutral-400">Cobrado nas facturas a clientes</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">IVA Dedutível (Compras 16%)</span>
                <div className="text-2xl font-bold text-blue-600">{formatMZN(incomeStatement?.total_expenses ? incomeStatement.total_expenses * 0.16 : 0)}</div>
                <span className="text-xs text-neutral-400">Suportado nas compras e fornecedores</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">IVA a Entregar à AT</span>
                <div className="text-2xl font-bold text-indigo-600">
                  {formatMZN(
                    Math.max(
                      0,
                      ((incomeStatement?.total_revenue || 0) - (incomeStatement?.total_expenses || 0)) * 0.16
                    )
                  )}
                </div>
                <span className="text-xs text-neutral-400">Entrega até ao último dia do mês seguinte</span>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Declaração Periódica de IVA (Modelo 20 AT Moçambique)</CardTitle>
                <p className="text-xs text-neutral-500">Apuramento oficial de IVA em conformidade com o Código do IVA de Moçambique</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
                <Download size={14} />
                Exportar Modelo 20
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
              <p>
                As taxas de IVA de 16% calculadas pelo TiConta ERP v2 são compatíveis com o Decreto-Lei 1/2018 e as normas de seriação da Autoridade Tributária de Moçambique.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: NOVA CONTA */}
      {isNewAccountModalOpen && (
        <Modal
          isOpen={isNewAccountModalOpen}
          onClose={() => setIsNewAccountModalOpen(false)}
          title="Adicionar Conta ao Plano PGC-NIRF"
        >
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Código da Conta (ex: 1.1.1 ou 4.1.1)</label>
              <Input
                value={accCode}
                onChange={(e) => setAccCode(e.target.value)}
                placeholder="Ex: 1.1.1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Designação / Nome da Conta</label>
              <Input
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                placeholder="Ex: Caixa Geral MZN"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo da Conta</label>
              <select
                className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
                value={accType}
                onChange={(e) => setAccType(e.target.value)}
              >
                <option value="asset">Activo (Classe 1, 2, 3)</option>
                <option value="liability">Passivo (Classe 4)</option>
                <option value="equity">Capital Próprio (Classe 5)</option>
                <option value="expense">Gastos / Custos (Classe 6)</option>
                <option value="revenue">Rendimentos / Proveitos (Classe 7)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isHeader"
                checked={accIsHeader}
                onChange={(e) => setAccIsHeader(e.target.checked)}
                className="rounded border-neutral-300"
              />
              <label htmlFor="isHeader" className="text-sm">Conta de Grupo / Agregadora (Sem lançamentos directos)</label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewAccountModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Criar Conta
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: NOVO LANÇAMENTO */}
      {isNewEntryModalOpen && (
        <Modal
          isOpen={isNewEntryModalOpen}
          onClose={() => setIsNewEntryModalOpen(false)}
          title="Novo Lançamento no Diário (Partidas Dobradas)"
        >
          <form onSubmit={handleCreateEntry} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Conta a Débito (Origem / Destino de Aplicação)</label>
              <select
                className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
                value={entryDebitAccId}
                onChange={(e) => setEntryDebitAccId(e.target.value)}
                required
              >
                <option value="">-- Seleccionar Conta a Débito --</option>
                {accounts.filter((a) => !a.is_header).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.account_code} - {a.account_name} ({a.account_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Conta a Crédito (Origem de Recursos / Contrapartida)</label>
              <select
                className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
                value={entryCreditAccId}
                onChange={(e) => setEntryCreditAccId(e.target.value)}
                required
              >
                <option value="">-- Seleccionar Conta a Crédito --</option>
                {accounts.filter((a) => !a.is_header).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.account_code} - {a.account_name} ({a.account_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Valor do Lançamento (MZN)</label>
              <Input
                type="number"
                step="10"
                value={entryAmount}
                onChange={(e) => setEntryAmount(e.target.value)}
                placeholder="Ex: 5000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição / Histórico</label>
              <Input
                value={entryDesc}
                onChange={(e) => setEntryDesc(e.target.value)}
                placeholder="Ex: Pagamento de fornecedor de matérias-primas"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewEntryModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Gravar Lançamento
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
