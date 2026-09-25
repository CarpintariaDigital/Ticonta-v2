'use client';

import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  Users,
  Plus,
  RotateCw,
  CheckCircle2,
  Clock,
  Calendar,
  DollarSign,
  Package,
  MessageSquare,
  Gift,
  Send,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useXitiqueStore } from '@/store/xitique.store';
import { XitiqueMemberInput } from '@/types/xitique';

export default function XitiquePage() {
  const {
    groups,
    selectedGroupSummary,
    reminders,
    isLoading,
    fetchGroups,
    fetchGroupSummary,
    createGroup,
    addMember,
    registerPayment,
    processDelivery,
    generateReminders,
  } = useXitiqueStore();

  const [activeTab, setActiveTab] = useState<'groups' | 'detail' | 'history'>('groups');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  // Modal Criar Grupo
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<'MONETARY' | 'PRODUCTS'>('MONETARY');
  const [productDesc, setProductDesc] = useState('');
  const [contributionVal, setContributionVal] = useState(2500);
  const [period, setPeriod] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'>('MONTHLY');
  const [totalMembers, setTotalMembers] = useState(6);
  const [orderType, setOrderType] = useState<'FIXED' | 'LOTTERY'>('FIXED');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [memberLines, setMemberLines] = useState('');

  // Modal Adicionar Membro
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemName, setNewMemName] = useState('');
  const [newMemPhone, setNewMemPhone] = useState('+258 84 ');

  // Modal Pagamento de Quota
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedContribId, setSelectedContribId] = useState<number | null>(null);
  const [payMethod, setPayMethod] = useState<'CASH' | 'MPESA' | 'TRANSFER'>('CASH');

  // Modal Lembretes WhatsApp
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleSelectGroup = async (gid: number) => {
    setSelectedGroupId(gid);
    await fetchGroupSummary(gid);
    setActiveTab('detail');
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName) return;

    const parsedMembers: XitiqueMemberInput[] = memberLines
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((name, idx) => ({
        name,
        phone: '+258 84 000 0000',
        receive_order: idx + 1,
      }));

    try {
      const gid = await createGroup({
        name: groupName,
        type: groupType,
        product_description: groupType === 'PRODUCTS' ? productDesc : undefined,
        contribution_value: Number(contributionVal),
        period,
        total_members: parsedMembers.length > 0 ? parsedMembers.length : Number(totalMembers),
        order_type: orderType,
        start_date: startDate,
        members: parsedMembers.length > 0 ? parsedMembers : undefined,
      });

      setIsNewGroupModalOpen(false);
      setGroupName('');
      setProductDesc('');
      setMemberLines('');
      if (gid) {
        await handleSelectGroup(gid);
      }
    } catch (err) {
      alert('Erro ao criar grupo de Xitique');
    }
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !newMemName) return;
    try {
      await addMember(selectedGroupId, {
        name: newMemName,
        phone: newMemPhone,
      });
      setIsAddMemberModalOpen(false);
      setNewMemName('');
      setNewMemPhone('+258 84 ');
    } catch (err) {
      alert('Erro ao adicionar membro');
    }
  };

  const handleConfirmPay = async () => {
    if (!selectedContribId) return;
    try {
      await registerPayment(selectedContribId, payMethod);
      setIsPayModalOpen(false);
      setSelectedContribId(null);
    } catch (err) {
      alert('Erro ao registar pagamento');
    }
  };

  const handleOpenReminders = async () => {
    if (!selectedGroupId) return;
    await generateReminders(selectedGroupId);
    setIsRemindersModalOpen(true);
  };

  const handleDeliverPot = async () => {
    if (!selectedGroupSummary) return;
    const g = selectedGroupSummary.group;
    const ben = selectedGroupSummary.next_beneficiary;
    const benName = ben ? ben.name : `Ronda ${g.current_round}`;

    if (!confirm(`Confirma a entrega do Bolo de ${formatMZN(g.total_pot)} a ${benName}?`)) {
      return;
    }

    try {
      await processDelivery(g.id, g.current_round);
      alert('Bolo do Xitique entregue com sucesso!');
    } catch (err) {
      alert('Erro ao processar entrega do bolo');
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PiggyBank size={18} className="text-amber-600" />
            <span>Xitique Digital & Poupança Rotativa Comunitária</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Tradição moçambicana de poupança mútua: gestão de rondas, quotas, entregas de bolo e cobranças via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedGroupSummary && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-300 rounded-lg">
              <button
                onClick={() => setActiveTab('groups')}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  activeTab === 'groups' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grupos ({groups.length})
              </button>
              <button
                onClick={() => setActiveTab('detail')}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  activeTab === 'detail' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ronda Atual
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  activeTab === 'history' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Histórico
              </button>
            </div>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewGroupModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus size={14} />
            <span>Novo Grupo</span>
          </Button>
        </div>
      </div>

      {/* TAB 1: LISTA DE GRUPOS */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white border border-slate-200 rounded-lg text-slate-500">
              Nenhum grupo de Xitique ativo. Clica em "Novo Grupo" para criar a tua primeira ronda.
            </div>
          ) : (
            groups.map((g) => (
              <Card
                key={g.id}
                onClick={() => handleSelectGroup(g.id)}
                className="border-slate-300 hover:border-amber-500 cursor-pointer transition shadow-xs bg-white"
              >
                <CardHeader className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    {g.type === 'PRODUCTS' ? (
                      <Package size={14} className="text-cyan-700" />
                    ) : (
                      <DollarSign size={14} className="text-emerald-700" />
                    )}
                    <span className="truncate">{g.name}</span>
                  </div>
                  <Badge variant={g.status === 'COMPLETED' ? 'emerald' : 'amber'}>
                    {g.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded text-slate-800 space-y-1">
                    <div className="text-[11px] text-amber-900 font-semibold">
                      Bolo da Ronda ({g.current_round}/{g.total_rounds}):
                    </div>
                    <div className="text-base font-bold text-amber-950">{formatMZN(g.total_pot)}</div>
                    {g.product_description && (
                      <div className="text-[11px] text-slate-600 italic">📦 {g.product_description}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      Quota: <span className="font-bold text-slate-900">{formatMZN(g.contribution_value)}</span>
                    </div>
                    <div>
                      Período: <span className="font-bold text-slate-900">{g.period}</span>
                    </div>
                    <div>
                      Membros: <span className="font-bold text-slate-900">{g.total_members}</span>
                    </div>
                    <div>
                      Início: <span className="font-bold text-slate-900">{g.start_date || '-'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-amber-700 font-bold">
                    <span>Gerir Ronda & Quotas</span>
                    <ArrowRight size={14} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 2: DETALHE DO GRUPO (RONDA ATUAL) */}
      {activeTab === 'detail' && selectedGroupSummary && (
        <div className="space-y-4">
          {/* Group Overview Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-lg border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{selectedGroupSummary.group.name}</h3>
                  <Badge variant="amber">{selectedGroupSummary.group.period}</Badge>
                  <Badge variant={selectedGroupSummary.group.type === 'PRODUCTS' ? 'cyan' : 'emerald'}>
                    {selectedGroupSummary.group.type}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Ronda {selectedGroupSummary.group.current_round} de {selectedGroupSummary.group.total_rounds} • Quota: {formatMZN(selectedGroupSummary.group.contribution_value)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenReminders}
                  className="bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700 text-xs flex items-center gap-1"
                >
                  <MessageSquare size={13} />
                  <span>WhatsApp Lembretes</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleDeliverPot}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Gift size={14} />
                  <span>Processar Entrega do Bolo</span>
                </Button>
              </div>
            </div>

            {/* Next Beneficiary & Pot Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
                <div className="text-[11px] text-slate-400">Beneficiário Desta Ronda:</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">
                  {selectedGroupSummary.next_beneficiary ? selectedGroupSummary.next_beneficiary.name : 'Nenhum'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {selectedGroupSummary.next_beneficiary?.phone || ''}
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
                <div className="text-[11px] text-slate-400">Bolo Total da Ronda:</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {formatMZN(selectedGroupSummary.group.total_pot)}
                </div>
                <div className="text-[10px] text-slate-400">
                  Arrecadado: {formatMZN(selectedGroupSummary.group.collected_pot || 0)}
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
                <div className="text-[11px] text-slate-400">Progresso dos Pagamentos:</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {selectedGroupSummary.group.round_progress_pct}% Pago
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${selectedGroupSummary.group.round_progress_pct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Current Round Contributions Table */}
          <Card className="border-slate-300 bg-white">
            <CardHeader className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <CardTitle className="text-xs text-slate-900 font-bold flex items-center gap-1.5">
                <Users size={14} className="text-amber-700" />
                <span>Quotas da Ronda {selectedGroupSummary.group.current_round}</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddMemberModalOpen(true)}
                className="text-[11px] h-7 px-2"
              >
                <UserPlus size={12} className="mr-1" />
                <span>Adicionar Membro</span>
              </Button>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px]">
                    <th className="py-2.5 px-4">ORDEM</th>
                    <th className="py-2.5 px-3">MEMBRO</th>
                    <th className="py-2.5 px-3">VALOR QUOTA</th>
                    <th className="py-2.5 px-3">ESTADO</th>
                    <th className="py-2.5 px-3">PAGO EM / MÉTODO</th>
                    <th className="py-2.5 px-4 text-right">ACÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedGroupSummary.current_contributions.map((c) => {
                    const isPaid = c.status === 'PAID';
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-700">#{c.round_number}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{c.member_name}</div>
                          <div className="text-[10px] text-slate-500">{c.member_phone}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">{formatMZN(c.amount)}</td>
                        <td className="py-3 px-3">
                          <Badge variant={isPaid ? 'emerald' : 'amber'}>{c.status}</Badge>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          {isPaid ? (
                            <span>
                              {c.paid_at?.split('T')[0]} ({c.payment_method})
                            </span>
                          ) : (
                            <span className="text-amber-700">Aguardando Pagamento</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isPaid ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedContribId(c.id);
                                setIsPayModalOpen(true);
                              }}
                              className="text-[11px] h-7 px-2.5 bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            >
                              <Check size={12} className="mr-1" />
                              <span>Marcar Pago</span>
                            </Button>
                          ) : (
                            <span className="text-emerald-700 font-bold text-[11px]">✓ Quota Regularizada</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: HISTÓRICO DE ENTREGAS */}
      {activeTab === 'history' && selectedGroupSummary && (
        <Card className="border-slate-300 bg-white">
          <CardHeader className="p-3 bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-xs text-slate-900 font-bold">
              Histórico de Entregas do Bolo ({selectedGroupSummary.group.name})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px]">
                  <th className="py-2.5 px-4">RONDA</th>
                  <th className="py-2.5 px-3">BENEFICIÁRIO</th>
                  <th className="py-2.5 px-3">VALOR ENTREGUE</th>
                  <th className="py-2.5 px-3">DATA DE ENTREGA</th>
                  <th className="py-2.5 px-3">ESTADO</th>
                  <th className="py-2.5 px-4">NOTAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedGroupSummary.deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      Nenhuma entrega de bolo concluída ainda neste grupo.
                    </td>
                  </tr>
                ) : (
                  selectedGroupSummary.deliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">Ronda #{d.round_number}</td>
                      <td className="py-3 px-3 font-bold text-emerald-800">{d.beneficiary_name}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{formatMZN(d.amount_delivered)}</td>
                      <td className="py-3 px-3 text-slate-600">{d.delivered_at?.split('T')[0] || '-'}</td>
                      <td className="py-3 px-3">
                        <Badge variant="emerald">{d.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{d.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* MODAL: CRIAR NOVO GRUPO */}
      <Modal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
        title="CRIAR NOVO GRUPO DE XITIQUE"
        size="md"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsNewGroupModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" onClick={handleCreateGroup} className="bg-amber-600 hover:bg-amber-700 text-white">
              Criar Grupo & Rondas
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateGroup} className="space-y-3 font-mono text-xs">
          <Input
            label="Nome do Grupo *"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Ex: Xitique dos Mecânicos da Matola"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tipo de Xitique</label>
              <select
                value={groupType}
                onChange={(e) => setGroupType(e.target.value as any)}
                className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs"
              >
                <option value="MONETARY">💰 Monetário (Dinheiro)</option>
                <option value="PRODUCTS">📦 Mercadoria / Produtos</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Periodicidade</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs"
              >
                <option value="MONTHLY">Mensal</option>
                <option value="BIWEEKLY">Quinzenal</option>
                <option value="WEEKLY">Semanal</option>
              </select>
            </div>
          </div>

          {groupType === 'PRODUCTS' && (
            <Input
              label="Descrição do Pacote de Produtos"
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              placeholder="Ex: 50 Sacos Cimento + 10 Varões de Ferro"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Valor da Quota por Membro (MZN) *"
              type="number"
              value={contributionVal}
              onChange={(e) => setContributionVal(Number(e.target.value))}
              required
            />

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Ordem de Entrega</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs"
              >
                <option value="FIXED">Ordem Fixa (Lista)</option>
                <option value="LOTTERY">Sorteio Aleatório</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Membros Iniciais (1 por linha na ordem de recebimento)
            </label>
            <textarea
              rows={4}
              value={memberLines}
              onChange={(e) => setMemberLines(e.target.value)}
              placeholder={"Mama Teresa\nCarlos Manhiça\nHelena Sitoe\nZacarias Chauke"}
              className="w-full p-2.5 bg-white border border-slate-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </form>
      </Modal>

      {/* MODAL: ADICIONAR MEMBRO */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="ADICIONAR MEMBRO AO XITIQUE"
        size="sm"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAddMemberModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" onClick={handleAddMemberSubmit}>
              Adicionar
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddMemberSubmit} className="space-y-3 font-mono text-xs">
          <Input
            label="Nome do Membro *"
            value={newMemName}
            onChange={(e) => setNewMemName(e.target.value)}
            placeholder="Ex: Tomás Tembe"
            required
          />
          <Input
            label="Telemóvel (WhatsApp) *"
            value={newMemPhone}
            onChange={(e) => setNewMemPhone(e.target.value)}
            placeholder="+258 84 123 4567"
            required
          />
        </form>
      </Modal>

      {/* MODAL: PAGAMENTO DE QUOTA */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="REGISTAR PAGAMENTO DE QUOTA"
        size="sm"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsPayModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirmPay} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Confirmar Pagamento
            </Button>
          </div>
        }
      >
        <div className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Método de Pagamento</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as any)}
              className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs"
            >
              <option value="CASH">💵 Numerário (Dinheiro em Mão)</option>
              <option value="MPESA">📱 M-Pesa / E-Mola</option>
              <option value="TRANSFER">🏦 Transferência Bancária (BIM/BCI/Standard)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* MODAL: LEMBRETES WHATSAPP */}
      <Modal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        title="LEMBRETES DE COBRANÇA WHATSAPP"
        size="md"
        footer={
          <Button variant="primary" size="sm" onClick={() => setIsRemindersModalOpen(false)}>
            Fechar
          </Button>
        }
      >
        <div className="space-y-3 font-mono text-xs">
          {reminders.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              Todas as quotas desta ronda estão pagas! Nenhum lembrete necessário.
            </div>
          ) : (
            reminders.map((r) => (
              <div key={r.member_id} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{r.member_name}</span>
                  <span className="text-amber-800 font-bold">{formatMZN(r.amount)}</span>
                </div>
                <div className="text-[11px] text-slate-600 bg-white p-2 border border-slate-200 rounded whitespace-pre-line">
                  {r.message}
                </div>
                <div className="text-right">
                  <a
                    href={r.whatsapp_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs"
                  >
                    <Send size={12} />
                    <span>Enviar no WhatsApp</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
