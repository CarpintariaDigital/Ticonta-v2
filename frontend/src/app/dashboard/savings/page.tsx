'use client';

import React, { useEffect, useState } from 'react';
import { useSavingsStore } from '@/store/savings.store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatMZN } from '@/lib/currency';
import {
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  Banknote,
  Percent,
  Calendar,
  Lock,
  Download,
  CheckCircle,
  AlertCircle,
  PiggyBank,
} from 'lucide-react';

export default function SavingsPage() {
  const {
    groups,
    selectedGroup,
    report,
    isLoading,
    fetchGroups,
    fetchGroupDetail,
    fetchGroupReport,
    createGroup,
    addMember,
    registerDeposit,
    createLoan,
    registerRepayment,
    closeCycle,
  } = useSavingsStore();

  const [activeTab, setActiveTab] = useState<'groups' | 'detail' | 'report'>('groups');

  // Modal states
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);

  // Selected entities for modals
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);

  // Forms
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupRate, setNewGroupRate] = useState('10');
  const [newGroupMonths, setNewGroupMonths] = useState('12');
  const [newGroupStartDate, setNewGroupStartDate] = useState(new Date().toISOString().split('T')[0]);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('CASH');
  const [depositNotes, setDepositNotes] = useState('');

  const [loanAmount, setLoanAmount] = useState('');
  const [loanDueDate, setLoanDueDate] = useState('');
  const [loanCustomRate, setLoanCustomRate] = useState('');

  const [repayAmount, setRepayAmount] = useState('');
  const [repayMethod, setRepayMethod] = useState('CASH');

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleSelectGroup = async (groupId: number) => {
    await fetchGroupDetail(groupId);
    await fetchGroupReport(groupId);
    setActiveTab('detail');
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;
    try {
      const created = await createGroup({
        name: newGroupName,
        interest_rate: parseFloat(newGroupRate) || 10,
        cycle_months: parseInt(newGroupMonths) || 12,
        start_date: newGroupStartDate,
      });
      setShowCreateGroupModal(false);
      setNewGroupName('');
      handleSelectGroup(created.id);
    } catch (err) {
      // Handled by store
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !newMemberName || !newMemberPhone) return;
    try {
      await addMember(selectedGroup.id, {
        name: newMemberName,
        phone: newMemberPhone,
      });
      setShowAddMemberModal(false);
      setNewMemberName('');
      setNewMemberPhone('');
    } catch (err) {
      // Handled
    }
  };

  const handleRegisterDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !selectedMemberId || !depositAmount) return;
    try {
      await registerDeposit({
        group_id: selectedGroup.id,
        member_id: selectedMemberId,
        amount: parseFloat(depositAmount),
        payment_method: depositMethod,
        notes: depositNotes || undefined,
      });
      setShowDepositModal(false);
      setDepositAmount('');
      setDepositNotes('');
      setSelectedMemberId(null);
    } catch (err) {
      // Handled
    }
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !selectedMemberId || !loanAmount || !loanDueDate) return;
    try {
      await createLoan({
        group_id: selectedGroup.id,
        member_id: selectedMemberId,
        amount: parseFloat(loanAmount),
        due_date: loanDueDate,
        interest_rate: loanCustomRate ? parseFloat(loanCustomRate) : undefined,
      });
      setShowLoanModal(false);
      setLoanAmount('');
      setLoanDueDate('');
      setLoanCustomRate('');
      setSelectedMemberId(null);
    } catch (err) {
      // Handled
    }
  };

  const handleRegisterRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId || !repayAmount) return;
    try {
      await registerRepayment(selectedLoanId, {
        amount: parseFloat(repayAmount),
        payment_method: repayMethod,
      });
      setShowRepayModal(false);
      setRepayAmount('');
      setSelectedLoanId(null);
    } catch (err) {
      // Handled
    }
  };

  const handleCloseCycle = async () => {
    if (!selectedGroup) return;
    if (confirm('Tem a certeza que deseja fechar o ciclo anual deste grupo? Isto consolidará a distribuição dos fundos.')) {
      await closeCycle(selectedGroup.id);
      setActiveTab('report');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <PiggyBank className="w-7 h-7 text-emerald-600" />
            Poupança & Crédito Comunitário (ASCA)
          </h1>
          <p className="text-sm text-neutral-500">
            Associação de Poupança e Crédito Rotativo com gestão de empréstimos, juros e partilha anual.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateGroupModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Grupo de Poupança
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6">
        <button
          onClick={() => setActiveTab('groups')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'groups'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Grupos de Poupança ({groups.length})
        </button>
        {selectedGroup && (
          <>
            <button
              onClick={() => setActiveTab('detail')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'detail'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Detalhes: {selectedGroup.name}
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'report'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Relatório de Partilha
            </button>
          </>
        )}
      </div>

      {/* TAB 1: LISTA DE GRUPOS */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((g) => (
            <Card
              key={g.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-neutral-200 dark:border-neutral-800"
              onClick={() => handleSelectGroup(g.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">{g.name}</CardTitle>
                <Badge variant={g.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {g.status === 'ACTIVE' ? 'ACTIVO' : 'ENCERRADO'}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-neutral-500 block text-xs">Taxa de Juro:</span>
                    <span className="font-semibold text-emerald-600">{g.interest_rate}% /mês</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-xs">Ciclo:</span>
                    <span className="font-semibold">{g.cycle_months} Meses</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-xs">Membros:</span>
                    <span className="font-semibold">{g.total_members || 0} Membros</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-xs">Início:</span>
                    <span className="font-semibold">{g.start_date}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    Abrir Painel <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {groups.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12 text-neutral-500">
              Nenhum grupo de poupança encontrado. Clica em &ldquo;Novo Grupo de Poupança&rdquo; para começar.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DETALHE DO GRUPO */}
      {activeTab === 'detail' && selectedGroup && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Fundo Total</span>
                  <Banknote className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
                  {formatMZN(report?.total_fund_value || 0)}
                </div>
                <span className="text-xs text-neutral-400 mt-1 block">Saldo em caixa + juros</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Emprestado</span>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
                  {formatMZN(report?.total_borrowed || 0)}
                </div>
                <span className="text-xs text-neutral-400 mt-1 block">Concedido a membros</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">A Receber</span>
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
                  {formatMZN(report?.total_receivable || 0)}
                </div>
                <span className="text-xs text-neutral-400 mt-1 block">Empréstimos pendentes</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Juros Acumulados</span>
                  <Percent className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
                  {formatMZN(report?.total_interest_collected || 0)}
                </div>
                <span className="text-xs text-neutral-400 mt-1 block">Lucro gerado pelo grupo</span>
              </CardContent>
            </Card>
          </div>

          {/* Members section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Membros e Depósitos</CardTitle>
                <p className="text-xs text-neutral-500">Registo de poupanças individuais no fundo comum</p>
              </div>
              {selectedGroup.status === 'ACTIVE' && (
                <Button
                  size="sm"
                  onClick={() => setShowAddMemberModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Membro
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold">
                    <tr>
                      <th className="p-3">Nome</th>
                      <th className="p-3">Telefone</th>
                      <th className="p-3 text-right">Total Depositado</th>
                      <th className="p-3 text-right">Total Emprestado</th>
                      <th className="p-3 text-right">Total Reembolsado</th>
                      <th className="p-3 text-right">% do Fundo</th>
                      <th className="p-3 text-center">Acções</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {report?.member_shares?.map((m) => (
                      <tr key={m.id || m.member_id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                        <td className="p-3 font-medium">{m.name}</td>
                        <td className="p-3 text-neutral-500">{m.phone}</td>
                        <td className="p-3 text-right font-semibold text-emerald-600">
                          {formatMZN(m.total_deposited)}
                        </td>
                        <td className="p-3 text-right text-blue-600 font-semibold">
                          {formatMZN(m.total_borrowed)}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatMZN(m.total_repaid)}
                        </td>
                        <td className="p-3 text-right font-bold text-purple-600">
                          {m.share_pct}%
                        </td>
                        <td className="p-3 text-center">
                          {selectedGroup.status === 'ACTIVE' && (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedMemberId(m.id || m.member_id || null);
                                  setShowDepositModal(true);
                                }}
                                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                              >
                                💰 Depositar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedMemberId(m.id || m.member_id || null);
                                  setShowLoanModal(true);
                                }}
                                className="text-blue-700 border-blue-300 hover:bg-blue-50"
                              >
                                📋 Empréstimo
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!report?.member_shares || report.member_shares.length === 0) && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-neutral-400">
                          Nenhum membro registado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Active Loans Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Empréstimos Concedidos</CardTitle>
                <p className="text-xs text-neutral-500">Histórico e controlo de reembolsos de microcrédito</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold">
                    <tr>
                      <th className="p-3">Membro</th>
                      <th className="p-3 text-right">Valor Original</th>
                      <th className="p-3 text-right">Taxa</th>
                      <th className="p-3 text-right">Total a Pagar</th>
                      <th className="p-3 text-right">Valor Reembolsado</th>
                      <th className="p-3 text-right">Em Dívida</th>
                      <th className="p-3">Vencimento</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-center">Acção</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {report?.loans?.map((loan) => (
                      <tr key={loan.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                        <td className="p-3 font-medium">{loan.member_name}</td>
                        <td className="p-3 text-right">{formatMZN(loan.amount)}</td>
                        <td className="p-3 text-right">{loan.interest_rate}%</td>
                        <td className="p-3 text-right font-semibold">{formatMZN(loan.total_repayable)}</td>
                        <td className="p-3 text-right text-emerald-600">{formatMZN(loan.amount_repaid)}</td>
                        <td className="p-3 text-right font-bold text-amber-600">
                          {formatMZN(loan.remaining || 0)}
                        </td>
                        <td className="p-3 text-neutral-500">{loan.due_date}</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              loan.status === 'REPAID'
                                ? 'success'
                                : loan.status === 'DEFAULTED'
                                ? 'danger'
                                : 'info'
                            }
                          >
                            {loan.status === 'REPAID'
                              ? 'PAGO'
                              : loan.status === 'DEFAULTED'
                              ? 'INCUMPRIMENTO'
                              : 'ACTIVO'}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          {loan.status === 'ACTIVE' && selectedGroup.status === 'ACTIVE' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedLoanId(loan.id);
                                setShowRepayModal(true);
                              }}
                              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                            >
                              ✓ Reembolsar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!report?.loans || report.loans.length === 0) && (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-neutral-400">
                          Nenhum empréstimo registado até ao momento.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Close Cycle button */}
          {selectedGroup.status === 'ACTIVE' && (
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={handleCloseCycle}
                className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                🔒 Fechar Ciclo Anual
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RELATÓRIO FINAL */}
      {activeTab === 'report' && selectedGroup && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Partilha Final de Fundo e Rendimentos</CardTitle>
                <p className="text-xs text-neutral-500">
                  Distribuição proporcional com base no total depositado e nos juros auferidos
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                📄 Exportar Relatório
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
                  <span className="text-xs text-neutral-500 block">Total de Depósitos</span>
                  <span className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                    {formatMZN(report?.total_deposited || 0)}
                  </span>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
                  <span className="text-xs text-neutral-500 block">Juros Conquistados</span>
                  <span className="text-xl font-bold text-purple-600">
                    {formatMZN(report?.total_interest_collected || 0)}
                  </span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold block">
                    Fundo Total a Distribuir
                  </span>
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                    {formatMZN(report?.total_fund_value || 0)}
                  </span>
                </div>
              </div>

              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-700 dark:text-neutral-200">
                  <tr>
                    <th className="p-3">Membro</th>
                    <th className="p-3 text-right">Total Depositado</th>
                    <th className="p-3 text-right">Participação (%)</th>
                    <th className="p-3 text-right">Valor a Receber</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {report?.member_shares?.map((m) => (
                    <tr key={m.id || m.member_id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                      <td className="p-3 font-medium">{m.name}</td>
                      <td className="p-3 text-right">{formatMZN(m.total_deposited)}</td>
                      <td className="p-3 text-right font-semibold text-purple-600">{m.share_pct}%</td>
                      <td className="p-3 text-right font-bold text-emerald-600 text-base">
                        {formatMZN(m.share_value || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: NOVO GRUPO */}
      {showCreateGroupModal && (
        <Modal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          title="Novo Grupo de Poupança & Crédito (ASCA)"
        >
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Grupo</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Ex: Poupança Solidária Matola"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Taxa de Juro Mensal (%)</label>
                <Input
                  type="number"
                  step="0.5"
                  value={newGroupRate}
                  onChange={(e) => setNewGroupRate(e.target.value)}
                  placeholder="10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duração do Ciclo (Meses)</label>
                <Input
                  type="number"
                  value={newGroupMonths}
                  onChange={(e) => setNewGroupMonths(e.target.value)}
                  placeholder="12"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data de Início</label>
              <Input
                type="date"
                value={newGroupStartDate}
                onChange={(e) => setNewGroupStartDate(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateGroupModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Criar Grupo
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: ADICIONAR MEMBRO */}
      {showAddMemberModal && (
        <Modal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          title="Adicionar Membro ao Grupo"
        >
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome Completo</label>
              <Input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Ex: Maria Mabunda"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contacto Telefónico</label>
              <Input
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value)}
                placeholder="Ex: 841234567"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddMemberModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Guardar Membro
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: REGISTAR DEPÓSITO */}
      {showDepositModal && (
        <Modal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          title="Registar Depósito de Poupança"
        >
          <form onSubmit={handleRegisterDeposit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valor do Depósito (MZN)</label>
              <Input
                type="number"
                step="50"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Ex: 1000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Método de Pagamento</label>
              <select
                className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
                value={depositMethod}
                onChange={(e) => setDepositMethod(e.target.value)}
              >
                <option value="CASH">Dinheiro Físico</option>
                <option value="MPESA">M-Pesa</option>
                <option value="TRANSFER">Transferência Bancária</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notas / Referência (opcional)</label>
              <Input
                value={depositNotes}
                onChange={(e) => setDepositNotes(e.target.value)}
                placeholder="Ex: Depósito quinzenal"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowDepositModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Confirmar Depósito
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: CONCEDER EMPRÉSTIMO */}
      {showLoanModal && (
        <Modal
          isOpen={showLoanModal}
          onClose={() => setShowLoanModal(false)}
          title="Conceder Empréstimo a Membro"
        >
          <form onSubmit={handleCreateLoan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valor Solicitado (MZN)</label>
              <Input
                type="number"
                step="100"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="Ex: 5000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Limite para Reembolso</label>
              <Input
                type="date"
                value={loanDueDate}
                onChange={(e) => setLoanDueDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Taxa de Juro Mensal (% - opcional, padrão: {selectedGroup?.interest_rate}%)
              </label>
              <Input
                type="number"
                step="0.5"
                value={loanCustomRate}
                onChange={(e) => setLoanCustomRate(e.target.value)}
                placeholder={`${selectedGroup?.interest_rate || 10}`}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowLoanModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Aprovar & Desembolsar
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: REGISTAR REEMBOLSO */}
      {showRepayModal && (
        <Modal
          isOpen={showRepayModal}
          onClose={() => setShowRepayModal(false)}
          title="Registar Reembolso de Empréstimo"
        >
          <form onSubmit={handleRegisterRepayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valor a Reembolsar (MZN)</label>
              <Input
                type="number"
                step="50"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                placeholder="Ex: 1500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Método de Pagamento</label>
              <select
                className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
                value={repayMethod}
                onChange={(e) => setRepayMethod(e.target.value)}
              >
                <option value="CASH">Dinheiro Físico</option>
                <option value="MPESA">M-Pesa</option>
                <option value="TRANSFER">Transferência Bancária</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowRepayModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Confirmar Reembolso
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
