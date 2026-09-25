'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  FileText, 
  DollarSign, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Send,
  MessageSquare
} from 'lucide-react';
import { useSuppliersStore, Supplier } from '@/store/suppliers.store';
import { ModuleGuard } from '@/components/auth/ModuleGuard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatMZN } from '@/lib/currency';

export default function SuppliersPage() {
  const { suppliers, invoices, isLoading, fetchSuppliers, createSupplier, recordInvoice } = useSuppliersStore();

  const [search, setSearch] = useState('');
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedSupplierForInvoice, setSelectedSupplierForInvoice] = useState<Supplier | null>(null);

  // Supplier Form
  const [name, setName] = useState('');
  const [nuit, setNuit] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Maputo');
  const [category, setCategory] = useState('Alimentar');
  const [paymentTerms, setPaymentTerms] = useState('30 Dias');

  // Purchase Invoice Form
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [totalAmount, setTotalAmount] = useState(0);
  const [ivaAmount, setIvaAmount] = useState(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSupplier({
      name,
      nuit,
      contact_person: contactPerson,
      phone,
      email,
      city,
      category,
      payment_terms: paymentTerms,
      active: true,
    });
    setIsSupplierModalOpen(false);
    setName('');
    setNuit('');
    setPhone('');
    setEmail('');
  };

  const handleOpenInvoiceModal = (supp: Supplier) => {
    setSelectedSupplierForInvoice(supp);
    setIsInvoiceModalOpen(true);
  };

  const handleRecordInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForInvoice) return;

    await recordInvoice({
      supplier_id: selectedSupplierForInvoice.id,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      due_date: dueDate,
      total_amount: Number(totalAmount),
      iva_amount: Number(ivaAmount),
      description,
    });

    setIsInvoiceModalOpen(false);
    setInvoiceNumber('');
    setTotalAmount(0);
    setDescription('');
  };

  const totalDebtAll = suppliers.reduce((sum, s) => sum + (Number(s.total_debt_mzn) || 0), 0);
  const totalPurchasesAll = suppliers.reduce((sum, s) => sum + (Number(s.total_purchased_mzn) || 0), 0);

  const filteredSuppliers = suppliers.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.nuit && s.nuit.includes(q)) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <ModuleGuard
      moduleId="suppliers"
      moduleName="Fornecedores & Contas a Pagar"
      moduleDescription="Gestão de fornecedores parceiros, registo de faturas de compras a prazo, controlo de dívidas e reconciliação com a Conta 4.2 do PGC-NIRF."
    >
      <div className="space-y-6 font-mono text-xs">
        {/* Header */}
        <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 size={18} className="text-emerald-700" />
                <span>GESTÃO DE FORNECEDORES & COMPRAS</span>
              </h1>
              <Badge variant="outline" className="text-emerald-700 border-emerald-300 font-bold">
                PGC-NIRF CONTA 4.2
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Controlo de parceiros de abastecimento, faturas de compra e saldos a liquidar com fornecedores.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setIsSupplierModalOpen(true)}
            variant="primary"
            size="sm"
            className="font-mono text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500"
          >
            <Plus size={14} />
            <span>Novo Fornecedor</span>
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-300">
            <CardContent className="p-4 space-y-1">
              <div className="text-[11px] text-slate-500 uppercase flex justify-between items-center">
                <span>Fornecedores Ativos</span>
                <Building2 size={14} className="text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{suppliers.length}</div>
              <div className="text-[10px] text-slate-500">Parceiros cadastrados</div>
            </CardContent>
          </Card>

          <Card className="border-slate-300">
            <CardContent className="p-4 space-y-1">
              <div className="text-[11px] text-slate-500 uppercase flex justify-between items-center">
                <span>Total Comprado (Histórico)</span>
                <DollarSign size={14} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatMZN(totalPurchasesAll)}</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Volume de compras</div>
            </CardContent>
          </Card>

          <Card className="border-slate-300">
            <CardContent className="p-4 space-y-1">
              <div className="text-[11px] text-slate-500 uppercase flex justify-between items-center">
                <span>Saldo em Dívida (A Pagar)</span>
                <Clock size={14} className="text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-600">{formatMZN(totalDebtAll)}</div>
              <div className="text-[10px] text-amber-600 font-semibold">Passivo corrente fornecedores</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white p-3 rounded-lg border border-slate-300 flex justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, NUIT ou contacto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-300 text-xs font-mono focus:outline-hidden focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Tabela de Fornecedores */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 select-none">
                <tr>
                  <th className="py-3 px-4">Fornecedor</th>
                  <th className="py-3 px-4">NUIT & Contactos</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Condições</th>
                  <th className="py-3 px-4 text-right">Total Comprado</th>
                  <th className="py-3 px-4 text-right">Saldo em Dívida</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredSuppliers.map((supp) => (
                  <tr key={supp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{supp.name}</div>
                      {supp.contact_person && (
                        <div className="text-[10px] text-slate-500">Contacto: {supp.contact_person}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 space-y-0.5">
                      <div>NUIT: {supp.nuit || '---'}</div>
                      <div className="text-[10px] text-slate-400">{supp.phone || supp.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {supp.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {supp.payment_terms}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700">
                      {formatMZN(supp.total_purchased_mzn)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      <span className={supp.total_debt_mzn > 0 ? 'text-amber-600' : 'text-emerald-700'}>
                        {formatMZN(supp.total_debt_mzn)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        type="button"
                        onClick={() => handleOpenInvoiceModal(supp)}
                        variant="outline"
                        size="sm"
                        className="text-[11px] px-2 py-1 font-mono"
                      >
                        Lançar Fatura
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Novo Fornecedor */}
        {isSupplierModalOpen && (
          <Modal
            isOpen={isSupplierModalOpen}
            onClose={() => setIsSupplierModalOpen(false)}
            title="CADASTRO DE NOVO FORNECEDOR"
            size="md"
          >
            <form onSubmit={handleCreateSupplier} className="space-y-4 font-mono text-xs">
              <Input
                label="Razão Social / Nome da Empresa *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Companhia Industrial da Matola"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="NUIT Fiscal (9 Dígitos)"
                  value={nuit}
                  onChange={(e) => setNuit(e.target.value.replace(/\D/g, ''))}
                  placeholder="100123456"
                  maxLength={9}
                />
                <Input
                  label="Pessoa de Contacto"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Ex: Sr. Amílcar"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Telefone / WhatsApp"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+258 84 000 0000"
                />
                <Input
                  label="Email de Contacto"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="compras@fornecedor.co.mz"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria de Fornecimento</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  >
                    <option value="Alimentar">Alimentar / Mercadorias</option>
                    <option value="Agro">Agro / Rações / Lotes</option>
                    <option value="Auto">Auto / Peças / Óleos</option>
                    <option value="Embalagens">Embalagens / Descartáveis</option>
                    <option value="Serviços">Serviços / Manutenção</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prazo de Pagamento</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  >
                    <option value="Pronto Pagamento">Pronto Pagamento</option>
                    <option value="15 Dias">15 Dias</option>
                    <option value="30 Dias">30 Dias</option>
                    <option value="60 Dias">60 Dias</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsSupplierModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  Cadastrar Fornecedor
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal: Lançar Fatura de Compra */}
        {isInvoiceModalOpen && selectedSupplierForInvoice && (
          <Modal
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
            title={`LANÇAR FATURA DE COMPRA: ${selectedSupplierForInvoice.name}`}
            size="md"
          >
            <form onSubmit={handleRecordInvoice} className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-slate-900">{selectedSupplierForInvoice.name}</div>
                <div className="text-slate-600">Condições: {selectedSupplierForInvoice.payment_terms}</div>
              </div>

              <Input
                label="Número da Fatura do Fornecedor (FT/FR) *"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Ex: FT 2026/0991"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Data da Fatura"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
                <Input
                  label="Data de Vencimento"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Valor Total (MT) *"
                  type="number"
                  step="10"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  required
                />
                <Input
                  label="IVA Incluso (MT)"
                  type="number"
                  step="10"
                  value={ivaAmount}
                  onChange={(e) => setIvaAmount(Number(e.target.value))}
                />
              </div>

              <Input
                label="Descrição dos Artigos Adquiridos"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Aquisição de 50 sacos de ração inicial"
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  Registar Fatura & Dívida
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </ModuleGuard>
  );
}
