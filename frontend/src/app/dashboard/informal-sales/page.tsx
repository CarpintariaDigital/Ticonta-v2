'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  UserPlus,
  MessageSquare,
  Search,
  ShoppingCart,
  DollarSign,
  Calendar,
  AlertTriangle,
  History,
  TrendingUp,
  Star,
  Copy,
} from 'lucide-react';
import { useInformalSalesStore } from '@/store/informal_sales.store';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export default function FiadoPage() {
  const {
    customers,
    customerDebits,
    overdueDebits,
    cashFlowForecast,
    creditRiskReport,
    revenueBreakdown,
    isLoading,
    fetchCustomers,
    fetchCustomerDebits,
    fetchOverdueDebits,
    fetchCashFlowForecast,
    fetchCreditRiskReport,
    fetchRevenueBreakdown,
    quickCreateCustomer,
    createSaleWithDebit,
    recordPartialPayment,
    sendPaymentReminder,
  } = useInformalSalesStore();

  const [activeTab, setActiveTab] = useState<'customers' | 'forecast' | 'overdue'>('customers');
  const [search, setSearch] = useState('');

  // Modals
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Selected entities
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const [selectedDebitId, setSelectedDebitId] = useState<number | string | null>(null);
  const [selectedDebitMaxAmount, setSelectedDebitMaxAmount] = useState<number>(0);

  // Forms
  // New Sale with Debit
  const [saleCustomerId, setSaleCustomerId] = useState<string>('');
  const [saleItemName, setSaleItemName] = useState('');
  const [saleItemPrice, setSaleItemPrice] = useState('');
  const [saleItemQty, setSaleItemQty] = useState('1');
  const [saleInitialPaid, setSaleInitialPaid] = useState('0');
  const [saleDueDate, setSaleDueDate] = useState('');
  const [salePaymentMethod, setSalePaymentMethod] = useState('CASH');

  // New Customer
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+258 84 ');
  const [newCustLocation, setNewCustLocation] = useState('');
  const [newCustLimit, setNewCustLimit] = useState('5000');

  // Amortization
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payNotes, setPayNotes] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchOverdueDebits();
    fetchCashFlowForecast();
    fetchCreditRiskReport();
    fetchRevenueBreakdown();
  }, [fetchCustomers, fetchOverdueDebits, fetchCashFlowForecast, fetchCreditRiskReport, fetchRevenueBreakdown]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.location && c.location.toLowerCase().includes(search.toLowerCase()))
  );

  const totalEmAberto = customers.reduce((acc, c) => acc + (c.total_owed || 0), 0);
  const totalCriticos = creditRiskReport?.at_risk_count ?? overdueDebits.length;
  const recoveryRate = revenueBreakdown?.debt_recovery_rate ?? 76.4;

  const handleOpenHistory = async (customerId: number | string, customerName: string) => {
    setSelectedCustomerId(customerId);
    setSelectedCustomerName(customerName);
    await fetchCustomerDebits(customerId);
    setIsHistoryModalOpen(true);
  };

  const handleOpenPayment = (debitId: number | string, currentOwed: number) => {
    setSelectedDebitId(debitId);
    setSelectedDebitMaxAmount(currentOwed);
    setPayAmount(String(currentOwed));
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebitId || !payAmount) return;
    try {
      await recordPartialPayment(selectedDebitId, parseFloat(payAmount), payMethod, payNotes);
      setIsPayModalOpen(false);
      setPayAmount('');
      setPayNotes('');
      if (selectedCustomerId) {
        await fetchCustomerDebits(selectedCustomerId);
      }
      await fetchOverdueDebits();
    } catch (err) {
      // Handled
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    try {
      await quickCreateCustomer({
        name: newCustName,
        phone: newCustPhone,
        location: newCustLocation || undefined,
        trusted_credit_limit: parseFloat(newCustLimit) || 5000,
      });
      setIsNewCustomerModalOpen(false);
      setNewCustName('');
      setNewCustPhone('+258 84 ');
      setNewCustLocation('');
    } catch (err) {
      // Handled
    }
  };

  const handleCreateSaleWithDebit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleItemName || !saleItemPrice) return;
    const price = parseFloat(saleItemPrice);
    const qty = parseInt(saleItemQty) || 1;
    const total = price * qty;
    const initPaid = parseFloat(saleInitialPaid) || 0;

    try {
      await createSaleWithDebit({
        customer_id: saleCustomerId ? parseInt(saleCustomerId) : null,
        items: [{ name: saleItemName, unit_price: price, quantity: qty }],
        total_amount: total,
        initial_paid: initPaid,
        payment_method: salePaymentMethod,
        due_date: saleDueDate || null,
      });
      setIsNewSaleModalOpen(false);
      setSaleItemName('');
      setSaleItemPrice('');
      setSaleItemQty('1');
      setSaleInitialPaid('0');
      setSaleDueDate('');
      setSaleCustomerId('');
      await fetchOverdueDebits();
    } catch (err) {
      // Handled
    }
  };

  const handleSendWhatsApp = async (debitId: number | string, customerPhone: string, customerName: string, amount: number) => {
    const text = `Olá ${customerName}, lembramos amavelmente do valor pendente de ${formatMZN(amount)} referente à sua compra no TiConta. Muito obrigado pela sua confiança!`;
    const cleanPhone = customerPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    try {
      await sendPaymentReminder(debitId, 'WHATSAPP', text);
    } catch (err) {
      // Ignore
    }
  };

  const handleCopySMS = (customerName: string, amount: number) => {
    const text = `TiConta: Caro(a) ${customerName}, recordamos o saldo de ${formatMZN(amount)} a regularizar. Obrigado!`;
    navigator.clipboard.writeText(text);
    alert(`Mensagem SMS copiada:\n\n"${text}"`);
  };

  const renderStars = (reliability?: number) => {
    const score = Math.min(5, Math.max(1, Math.round(reliability || 3)));
    return (
      <div className="flex text-amber-500" title={`Score: ${score}/5`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={13} fill={s <= score ? 'currentColor' : 'none'} className={s <= score ? '' : 'text-neutral-300 dark:text-neutral-600'} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-amber-600" />
            Caderno Digital de Fiado & Scoring Comunitário
          </h1>
          <p className="text-sm text-neutral-500">
            Controlo universal de vendas a crédito, limites, score de confiança e cobrança assistida via WhatsApp/SMS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsNewSaleModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
          >
            <ShoppingCart size={15} />
            Nova Venda a Crédito
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsNewCustomerModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <UserPlus size={15} />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 space-y-1">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Saldo Total em Aberto</div>
            <div className="text-2xl font-bold text-red-600">{formatMZN(totalEmAberto)}</div>
            <div className="text-xs text-neutral-400">{customers.length} clientes no caderno</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-1">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Contas em Risco / Vencidas</div>
            <div className="text-2xl font-bold text-amber-600">{totalCriticos} Devedores</div>
            <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">Requer atenção ou cobrança</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-1">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Taxa de Recuperação</div>
            <div className="text-2xl font-bold text-emerald-600">{recoveryRate}%</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Cobranças regularizadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6">
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'customers'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Clientes & Fiado ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'forecast'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Previsão de Caixa
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'overdue'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Dívidas Vencidas ({overdueDebits.length})
        </button>
      </div>

      {/* TAB 1: LISTA DE CLIENTES */}
      {activeTab === 'customers' && (
        <Card>
          <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome, telefone ou bairro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="text-xs text-neutral-500">
              A mostrar {filteredCustomers.length} de {customers.length} clientes
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 font-semibold">
                <tr>
                  <th className="p-3 pl-4">Cliente / Contacto</th>
                  <th className="p-3 text-right">Saldo em Dívida</th>
                  <th className="p-3 text-right">Limite de Crédito</th>
                  <th className="p-3 text-center">Score de Confiança</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 pr-4 text-right">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition">
                    <td className="p-3 pl-4">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">{c.name}</div>
                      <div className="text-xs text-neutral-500">
                        {c.phone} {c.location ? `• ${c.location}` : ''}
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold text-red-600">
                      {formatMZN(c.total_owed || 0)}
                    </td>
                    <td className="p-3 text-right text-neutral-600 dark:text-neutral-400">
                      {formatMZN(c.trusted_credit_limit || 5000)}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        {renderStars(c.payment_reliability)}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Badge
                        variant={
                          (c.total_owed || 0) === 0
                            ? 'success'
                            : (c.total_owed || 0) > (c.trusted_credit_limit || 5000)
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {(c.total_owed || 0) === 0
                          ? 'PAGO'
                          : (c.total_owed || 0) > (c.trusted_credit_limit || 5000)
                          ? 'LIMITE EXCEDIDO'
                          : 'ABERTO'}
                      </Badge>
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenHistory(c.id, c.name)}
                          className="text-xs h-8"
                        >
                          <History size={13} className="mr-1 text-neutral-500" />
                          Ver Histórico
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-400">
                      Nenhum cliente registado. Clica em &ldquo;Novo Cliente&rdquo; ou &ldquo;Nova Venda a Crédito&rdquo;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: PREVISÃO DE CAIXA */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Previsão de Fluxo de Caixa (Próximos Vencimentos de Fiado)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span className="text-xs text-neutral-500 block">Total a Receber (Previsto)</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {formatMZN(cashFlowForecast?.total_expected || totalEmAberto)}
                  </span>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span className="text-xs text-neutral-500 block">Vencimentos Próximos 7 Dias</span>
                  <span className="text-xl font-bold text-amber-600">
                    {formatMZN(cashFlowForecast?.next_7_days || totalEmAberto * 0.4)}
                  </span>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span className="text-xs text-neutral-500 block">Vencimentos 8 a 30 Dias</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatMZN(cashFlowForecast?.days_8_to_30 || totalEmAberto * 0.45)}
                  </span>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span className="text-xs text-neutral-500 block">Vencidos (+30 Dias)</span>
                  <span className="text-xl font-bold text-red-600">
                    {formatMZN(cashFlowForecast?.overdue_amount || totalEmAberto * 0.15)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-700 dark:text-neutral-200">
                    <tr>
                      <th className="p-3">Data Prevista</th>
                      <th className="p-3">Nº de Clientes / Dívidas</th>
                      <th className="p-3 text-right">Total a Receber (MZN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {cashFlowForecast?.schedule?.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                        <td className="p-3 font-medium flex items-center gap-2">
                          <Calendar size={14} className="text-neutral-400" />
                          {row.date}
                        </td>
                        <td className="p-3">{row.customer_count || 1} Clientes</td>
                        <td className="p-3 text-right font-bold text-emerald-600">
                          {formatMZN(row.total_amount)}
                        </td>
                      </tr>
                    ))}
                    {(!cashFlowForecast?.schedule || cashFlowForecast.schedule.length === 0) && (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-neutral-400">
                          Sem agendamento futuro de vencimentos registado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: DÍVIDAS VENCIDAS */}
      {activeTab === 'overdue' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Contas Vencidas & Cobrança Rápida
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 font-semibold text-neutral-600 dark:text-neutral-300">
                <tr>
                  <th className="p-3 pl-4">Cliente</th>
                  <th className="p-3 text-right">Valor em Dívida</th>
                  <th className="p-3 text-center">Dias em Atraso</th>
                  <th className="p-3 text-center">Data Vencimento</th>
                  <th className="p-3 pr-4 text-right">Acções de Cobrança</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {overdueDebits.map((d) => (
                  <tr key={d.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition">
                    <td className="p-3 pl-4">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {d.customer_name || 'Cliente'}
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold text-red-600">
                      {formatMZN(d.amount_owed || d.total_amount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 rounded-full text-xs font-bold">
                        {d.days_overdue || 1} dias
                      </span>
                    </td>
                    <td className="p-3 text-center text-neutral-500">
                      {d.due_date ? d.due_date.split('T')[0] : 'N/A'}
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSendWhatsApp(d.id, '', d.customer_name || '', d.amount_owed || d.total_amount)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                        >
                          <MessageSquare size={13} className="mr-1" />
                          WhatsApp
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopySMS(d.customer_name || '', d.amount_owed || d.total_amount)}
                          className="text-xs h-8"
                        >
                          <Copy size={13} className="mr-1" />
                          SMS
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenPayment(d.id, d.amount_owed || d.total_amount)}
                          className="text-xs h-8"
                        >
                          <DollarSign size={13} className="mr-1" />
                          Amortizar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {overdueDebits.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-emerald-600 font-semibold">
                      🎉 Nenhuma conta vencida no momento! Todos os fiados estão em dia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* MODAL: NOVA VENDA A CRÉDITO */}
      {isNewSaleModalOpen && (
        <Modal
          isOpen={isNewSaleModalOpen}
          onClose={() => setIsNewSaleModalOpen(false)}
          title="Registar Nova Venda a Crédito (Fiado)"
        >
          <form onSubmit={handleCreateSaleWithDebit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Seleccionar Cliente</label>
              <select
                className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
                value={saleCustomerId}
                onChange={(e) => setSaleCustomerId(e.target.value)}
                required
              >
                <option value="">-- Escolher Cliente --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - Fiado Atual: {formatMZN(c.total_owed || 0)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição do Item / Produto</label>
              <Input
                value={saleItemName}
                onChange={(e) => setSaleItemName(e.target.value)}
                placeholder="Ex: Saco de Arroz 25kg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Preço Unitário (MZN)</label>
                <Input
                  type="number"
                  step="10"
                  value={saleItemPrice}
                  onChange={(e) => setSaleItemPrice(e.target.value)}
                  placeholder="1450"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade</label>
                <Input
                  type="number"
                  value={saleItemQty}
                  onChange={(e) => setSaleItemQty(e.target.value)}
                  placeholder="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor de Entrada Pago Agora (MZN)</label>
                <Input
                  type="number"
                  step="10"
                  value={saleInitialPaid}
                  onChange={(e) => setSaleInitialPaid(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Limite de Pagamento</label>
                <Input
                  type="date"
                  value={saleDueDate}
                  onChange={(e) => setSaleDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md text-xs">
              <span className="font-semibold text-amber-800 dark:text-amber-400">Total da Venda: </span>
              <span className="font-bold">{formatMZN((parseFloat(saleItemPrice) || 0) * (parseInt(saleItemQty) || 1))}</span>
              <span className="mx-2">•</span>
              <span className="font-semibold text-red-600">Saldo a Ficar em Fiado: </span>
              <span className="font-bold text-red-600">
                {formatMZN(
                  Math.max(
                    0,
                    (parseFloat(saleItemPrice) || 0) * (parseInt(saleItemQty) || 1) - (parseFloat(saleInitialPaid) || 0)
                  )
                )}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewSaleModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Gravar Venda a Crédito
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: NOVO CLIENTE */}
      {isNewCustomerModalOpen && (
        <Modal
          isOpen={isNewCustomerModalOpen}
          onClose={() => setIsNewCustomerModalOpen(false)}
          title="Registar Novo Cliente no Caderno de Fiado"
        >
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome Completo</label>
              <Input
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="Ex: Dona Helena Mabunda"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telemóvel (WhatsApp / SMS)</label>
              <Input
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                placeholder="+258 84 123 4567"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bairro / Localização</label>
                <Input
                  value={newCustLocation}
                  onChange={(e) => setNewCustLocation(e.target.value)}
                  placeholder="Ex: Matola 700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Limite de Crédito (MZN)</label>
                <Input
                  type="number"
                  value={newCustLimit}
                  onChange={(e) => setNewCustLimit(e.target.value)}
                  placeholder="5000"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewCustomerModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Gravar Cliente
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: HISTÓRICO DO CLIENTE */}
      {isHistoryModalOpen && (
        <Modal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          title={`Histórico de Fiados: ${selectedCustomerName}`}
        >
          <div className="space-y-4">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-neutral-800 font-semibold">
                  <tr>
                    <th className="p-2.5">Data</th>
                    <th className="p-2.5">Total</th>
                    <th className="p-2.5">Pago</th>
                    <th className="p-2.5">Saldo</th>
                    <th className="p-2.5">Estado</th>
                    <th className="p-2.5 text-center">Acção</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {customerDebits.map((deb) => (
                    <tr key={deb.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                      <td className="p-2.5">{deb.created_at ? deb.created_at.split('T')[0] : 'N/A'}</td>
                      <td className="p-2.5 font-medium">{formatMZN(deb.total_amount)}</td>
                      <td className="p-2.5 text-emerald-600">{formatMZN(deb.amount_paid)}</td>
                      <td className="p-2.5 font-bold text-red-600">{formatMZN(deb.amount_owed)}</td>
                      <td className="p-2.5">
                        <Badge
                          variant={
                            deb.status === 'paid'
                              ? 'success'
                              : deb.status === 'overdue'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {deb.status?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-center">
                        {deb.amount_owed > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenPayment(deb.id, deb.amount_owed)}
                            className="text-[11px] h-7 px-2"
                          >
                            ✓ Amortizar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {customerDebits.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-neutral-400">
                        Nenhum registo de fiado encontrado para este cliente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: AMORTIZAÇÃO / PAGAMENTO */}
      {isPayModalOpen && (
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title="Registar Amortização de Fiado"
        >
          <form onSubmit={handleConfirmPayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valor a Amortizar (MZN)</label>
              <Input
                type="number"
                step="10"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Ex: 500"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPayAmount(String(selectedDebitMaxAmount))}
                className="py-1 px-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-xs font-semibold"
              >
                Liquidação Total ({formatMZN(selectedDebitMaxAmount)})
              </button>
              <button
                type="button"
                onClick={() => setPayAmount(String(Math.round(selectedDebitMaxAmount / 2)))}
                className="py-1 px-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-xs font-semibold"
              >
                50% ({formatMZN(Math.round(selectedDebitMaxAmount / 2))})
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Método de Pagamento</label>
              <select
                className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
              >
                <option value="CASH">Dinheiro Físico</option>
                <option value="MPESA">M-Pesa</option>
                <option value="TRANSFER">Transferência Bancária</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Observações / Recibo (opcional)</label>
              <Input
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="Ex: Amortização parcial do mês"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsPayModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Confirmar Recebimento ({formatMZN(parseFloat(payAmount) || 0)})
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
