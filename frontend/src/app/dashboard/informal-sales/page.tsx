'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  UserPlus, 
  MessageSquare, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ShieldAlert,
  ArrowDownRight,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { useFiadoStore, Debtor } from '@/store/fiadoStore';
import { useAuthStore } from '@/store/authStore';
import { formatMZN } from '@/lib/currency';
import { generateWhatsAppFiadoReminder } from '@/lib/whatsapp';
import { generateSMSFiadoText } from '@/lib/sms';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export default function FiadoPage() {
  const { debtors, registerPayment, incrementReminder, addDebtor } = useFiadoStore();
  const { company } = useAuthStore();
  const [search, setSearch] = useState('');
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isNewDebtorModalOpen, setIsNewDebtorModalOpen] = useState(false);

  // New debtor form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+258 84 ');
  const [newLimit, setNewLimit] = useState(5000);
  const [newBalance, setNewBalance] = useState(1500);

  const filteredDebtors = debtors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search)
  );

  const totalEmAberto = debtors.reduce((acc, d) => acc + d.balance, 0);
  const totalCriticos = debtors.filter((d) => d.creditScore < 60 || d.daysOverdue > 30).length;

  const handleSendWhatsApp = (debtor: Debtor) => {
    const encoded = generateWhatsAppFiadoReminder(
      debtor.name,
      debtor.balance,
      'Imediato',
      company.name
    );
    const cleanPhone = debtor.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
    incrementReminder(debtor.id);
  };

  const handleSendSMS = (debtor: Debtor) => {
    const text = generateSMSFiadoText(debtor.name, debtor.balance, company.name);
    navigator.clipboard.writeText(text);
    alert(`Texto SMS copiado para a área de transferência:\n\n"${text}"`);
    incrementReminder(debtor.id);
  };

  const handleOpenPayment = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setPaymentAmount(debtor.balance);
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (selectedDebtor && paymentAmount > 0) {
      registerPayment(selectedDebtor.id, paymentAmount);
      setIsPayModalOpen(false);
    }
  };

  const handleCreateDebtor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    addDebtor({
      id: `DEB-${Date.now().toString(36).toUpperCase()}`,
      name: newName,
      phone: newPhone,
      balance: Number(newBalance),
      limit: Number(newLimit),
      creditScore: 85,
      lastPurchaseDate: new Date().toISOString().split('T')[0],
      daysOverdue: 0,
      remindersSent: 0,
    });
    setIsNewDebtorModalOpen(false);
    setNewName('');
    setNewPhone('+258 84 ');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen size={18} className="text-amber-600" />
            <span>Caderno Digital de Fiado & Scoring de Crédito Local</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Substituição 100% digital do caderno de fiado. Score de confiabilidade e cobrança amigável via WhatsApp/SMS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewDebtorModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <UserPlus size={14} />
            <span>Registar Novo Devedor</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 uppercase">Total de Saldo em Aberto</div>
            <div className="text-2xl font-bold text-slate-900">{formatMZN(totalEmAberto)}</div>
            <div className="text-[11px] text-slate-600">{debtors.length} devedores ativos</div>
          </CardContent>
        </Card>

        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 uppercase">Contas em Risco / Atraso Crítico</div>
            <div className="text-2xl font-bold text-amber-700">{totalCriticos} Clientes</div>
            <div className="text-[11px] text-amber-800 font-semibold">&gt; 30 dias de atraso</div>
          </CardContent>
        </Card>

        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs text-slate-500 uppercase">Taxa de Recuperação via WhatsApp</div>
            <div className="text-2xl font-bold text-emerald-700">76.4%</div>
            <div className="text-[11px] text-emerald-800 font-semibold">Lembretes automáticos</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Debtors Table */}
      <Card className="border-slate-300">
        <CardHeader className="p-3 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar por nome ou telemóvel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="text-xs font-mono text-slate-500">
            Mostrando {filteredDebtors.length} de {debtors.length} devedores
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px]">
                <th className="py-2.5 px-4">CLIENTE / CONTACTO</th>
                <th className="py-2.5 px-3">SALDO DEVEDOR</th>
                <th className="py-2.5 px-3">LIMITE</th>
                <th className="py-2.5 px-3">DIAS EM ATRASO</th>
                <th className="py-2.5 px-3">SCORE DE CRÉDITO</th>
                <th className="py-2.5 px-4 text-right">AÇÕES RÁPIDAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredDebtors.map((debtor) => (
                <tr key={debtor.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{debtor.name}</div>
                    <div className="text-[11px] text-slate-500">{debtor.phone}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-red-700 text-sm">
                      {formatMZN(debtor.balance)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{formatMZN(debtor.limit)}</td>
                  <td className="py-3 px-3">
                    {debtor.daysOverdue > 0 ? (
                      <span className="text-amber-800 font-semibold px-2 py-0.5 bg-amber-50 border border-amber-300 rounded text-[11px]">
                        {debtor.daysOverdue} dias
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">Em dia</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            debtor.creditScore >= 75
                              ? 'bg-emerald-600'
                              : debtor.creditScore >= 50
                              ? 'bg-amber-500'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${debtor.creditScore}%` }}
                        />
                      </div>
                      <span className="font-bold">{debtor.creditScore}/100</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendWhatsApp(debtor)}
                        className="text-[11px] h-7 px-2 border-emerald-300 hover:bg-emerald-50 text-emerald-800"
                        title="Enviar lembrete amigável por WhatsApp"
                      >
                        <MessageSquare size={12} className="mr-1 text-emerald-600" />
                        <span>WhatsApp ({debtor.remindersSent})</span>
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenPayment(debtor)}
                        className="text-[11px] h-7 px-2"
                        title="Registar amortização ou liquidação"
                      >
                        <DollarSign size={12} className="mr-1 text-slate-700" />
                        <span>Amortizar</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal de Amortização / Pagamento */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="REGISTAR AMORTIZAÇÃO DE FIADO"
        size="md"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsPayModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirmPayment}>
              Confirmar Recebimento ({formatMZN(paymentAmount)})
            </Button>
          </div>
        }
      >
        {selectedDebtor && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-900 text-sm">{selectedDebtor.name}</div>
              <div className="text-slate-500 text-[11px]">{selectedDebtor.phone}</div>
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2">
                <span>Saldo Atual Devedor:</span>
                <span className="font-bold text-red-700">{formatMZN(selectedDebtor.balance)}</span>
              </div>
            </div>

            <div>
              <Input
                label="Valor a Amortizar / Pagar (MT)"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="text-base font-bold font-mono"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentAmount(selectedDebtor.balance)}
                className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] font-bold"
              >
                Liquidação Total ({formatMZN(selectedDebtor.balance)})
              </button>
              <button
                type="button"
                onClick={() => setPaymentAmount(selectedDebtor.balance / 2)}
                className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] font-bold"
              >
                50% ({formatMZN(selectedDebtor.balance / 2)})
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Novo Devedor */}
      <Modal
        isOpen={isNewDebtorModalOpen}
        onClose={() => setIsNewDebtorModalOpen(false)}
        title="REGISTAR NOVO CLIENTE DE FIADO"
        size="md"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsNewDebtorModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" onClick={handleCreateDebtor}>
              Gravar Cliente no Caderno
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateDebtor} className="space-y-3 font-mono text-xs">
          <Input
            label="Nome Completo do Cliente"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: Tomás Tembe"
            required
          />
          <Input
            label="Telemóvel (WhatsApp / Cobrança)"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="+258 84 123 4567"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Limite de Crédito (MT)"
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(Number(e.target.value))}
              required
            />
            <Input
              label="Dívida Inicial (MT)"
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(Number(e.target.value))}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
