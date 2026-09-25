'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Check, 
  ArrowRight, 
  Send, 
  MessageSquare, 
  FileCheck2, 
  Calendar, 
  Building2, 
  Clock, 
  Layers, 
  Printer, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useQuotesStore, Quote } from '@/store/quotes.store';
import { ModuleGuard } from '@/components/auth/ModuleGuard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatMZN } from '@/lib/currency';

export default function QuotesPage() {
  const { quotes, isLoading, fetchQuotes, createQuote, updateQuoteStatus, convertToSale } = useQuotesStore();

  const [activeType, setActiveType] = useState<'all' | 'cotacao' | 'proforma'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [convertingId, setConvertingId] = useState<number | null>(null);

  // Form State
  const [quoteType, setQuoteType] = useState<'cotacao' | 'proforma'>('cotacao');
  const [customerName, setCustomerName] = useState('');
  const [customerNuit, setCustomerNuit] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Pronto Pagamento via M-Pesa');
  const [notes, setNotes] = useState('');

  // Items State
  const [items, setItems] = useState([
    { description: '', quantity: 1, unit_price: 0, discount_percent: 0 },
  ]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const addItemRow = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, discount_percent: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.some((i) => !i.description || i.quantity <= 0)) {
      alert('Por favor preencha os dados do cliente e os artigos.');
      return;
    }

    await createQuote({
      quote_type: quoteType,
      customer_name: customerName,
      customer_nuit: customerNuit,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      payment_terms: paymentTerms,
      notes,
      items: items.map((i) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        discount_percent: Number(i.discount_percent || 0),
        iva_rate: 16,
      })),
    });

    setIsModalOpen(false);
    // Reset
    setCustomerName('');
    setCustomerNuit('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
    setItems([{ description: '', quantity: 1, unit_price: 0, discount_percent: 0 }]);
  };

  const handleConvertToSale = async (id: number) => {
    if (!confirm('Deseja converter esta cotação/proforma aprovada em Fatura Final (FT/FR)?')) return;
    setConvertingId(id);
    const res = await convertToSale(id);
    setConvertingId(null);
    alert(`Sucesso! Documento convertido na Fatura ${res.invoice_number}`);
  };

  const handleSendWhatsApp = (q: Quote) => {
    const isPro = q.quote_type === 'proforma';
    const title = isPro ? 'FATURA PROFORMA' : 'COTAÇÃO COMERCIAL';
    const itemsList = q.items.map((i) => `• ${i.quantity}x ${i.description} - ${formatMZN(i.total)}`).join('\n');

    const text = encodeURIComponent(
      `🏛️ *CARPINTARIA DIGITAL — ${title}*\n\n` +
      `Estimado(a) *${q.customer_name}*,\n` +
      `Segue a sua ${title.toLowerCase()} *${q.quote_number}*:\n\n` +
      `📋 *Artigos Cotados:*\n${itemsList}\n\n` +
      `💰 *Subtotal:* ${formatMZN(q.subtotal)}\n` +
      `📊 *IVA (16%):* ${formatMZN(q.iva_total)}\n` +
      `💵 *TOTAL:* ${formatMZN(q.total)}\n` +
      `📅 *Validade:* ${new Date(q.valid_until).toLocaleDateString('pt-MZ')}\n` +
      `🤝 *Condições:* ${q.payment_terms}\n\n` +
      `Para aprovação ou esclarecimento, responda a esta mensagem.`
    );

    const phoneClean = (q.customer_phone || '').replace(/\D/g, '');
    const url = phoneClean ? `https://wa.me/${phoneClean}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const filteredQuotes = quotes.filter((q) => {
    if (activeType !== 'all' && q.quote_type !== activeType) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        q.customer_name.toLowerCase().includes(s) ||
        q.quote_number.toLowerCase().includes(s) ||
        (q.customer_nuit && q.customer_nuit.includes(s))
      );
    }
    return true;
  });

  return (
    <ModuleGuard
      moduleId="quotes"
      moduleName="Cotações Comerciais & Faturas Proforma"
      moduleDescription="Emissão de proformas e propostas com cálculo automático de IVA a 16%, envio digital via WhatsApp/SMS e conversão direta em Fatura Final no POS."
    >
      <div className="space-y-6 font-mono text-xs">
        {/* Header */}
        <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText size={18} className="text-emerald-700" />
                <span>COTAÇÕES & FATURAS PROFORMA</span>
              </h1>
              <Badge variant="outline" className="text-emerald-700 border-emerald-300 font-bold">
                100% DIGITAL
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Elabore orçamentos e proformas formais com IVA 16% e converta em vendas finais com 1 clique.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            size="sm"
            className="font-mono text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500"
          >
            <Plus size={14} />
            <span>Emitir Nova Cotação / Proforma</span>
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-300">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'cotacao', label: 'Cotações' },
              { id: 'proforma', label: 'Faturas Proforma' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveType(t.id as any)}
                className={`px-3 py-1.5 rounded-md font-bold text-xs transition ${
                  activeType === t.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por cliente, número ou NUIT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-300 text-xs font-mono focus:outline-hidden focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Tabela de Cotações */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 select-none">
                <tr>
                  <th className="py-3 px-4">Número</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Data Emissão / Validade</th>
                  <th className="py-3 px-4 text-right">Total (MT)</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                      Nenhuma cotação ou fatura proforma encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {q.quote_number}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={q.quote_type === 'proforma' ? 'purple' : 'info'} className="uppercase text-[10px]">
                          {q.quote_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{q.customer_name}</div>
                        {q.customer_nuit && (
                          <div className="text-[10px] text-slate-500">NUIT: {q.customer_nuit}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{new Date(q.issue_date).toLocaleDateString('pt-MZ')}</div>
                        <div className="text-[10px] text-slate-400">Até {new Date(q.valid_until).toLocaleDateString('pt-MZ')}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-800">
                        {formatMZN(q.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            q.status === 'convertida'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.status === 'aprovada'
                              ? 'bg-blue-100 text-blue-800'
                              : q.status === 'recusada'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            type="button"
                            onClick={() => handleSendWhatsApp(q)}
                            variant="outline"
                            size="sm"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                            title="Enviar via WhatsApp"
                          >
                            <MessageSquare size={13} />
                          </Button>

                          {q.status !== 'convertida' && (
                            <Button
                              type="button"
                              onClick={() => handleConvertToSale(q.id)}
                              disabled={convertingId === q.id}
                              variant="primary"
                              size="sm"
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] flex items-center gap-1"
                              title="Converter em Factura Final (FT/FR)"
                            >
                              <FileCheck2 size={12} />
                              <span>Faturar</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Nova Cotação / Proforma */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="EMISSÃO DE COTAÇÃO / FATURA PROFORMA"
            size="lg"
          >
            <form onSubmit={handleCreate} className="space-y-4 font-mono text-xs">
              <div className="flex items-center gap-3 p-2.5 bg-slate-100 rounded-lg">
                <span className="font-bold text-slate-700">Tipo de Documento:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="quote_type"
                    checked={quoteType === 'cotacao'}
                    onChange={() => setQuoteType('cotacao')}
                  />
                  <span>Cotação Comercial</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="quote_type"
                    checked={quoteType === 'proforma'}
                    onChange={() => setQuoteType('proforma')}
                  />
                  <span>Fatura Proforma</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Input
                  label="Nome do Cliente / Empresa *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Supermercado Estrela Lda"
                  required
                />
                <Input
                  label="NUIT Fiscal (9 Dígitos)"
                  value={customerNuit}
                  onChange={(e) => setCustomerNuit(e.target.value.replace(/\D/g, ''))}
                  placeholder="100889922"
                  maxLength={9}
                />
                <Input
                  label="Telefone / WhatsApp"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+258 84 000 0000"
                />
                <Input
                  label="Condições de Pagamento"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Ex: Pronto Pagamento / 30 Dias"
                />
              </div>

              {/* Tabela de Itens */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700 uppercase">Artigos Cotados:</span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Adicionar Linha</span>
                  </button>
                </div>

                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 border-b border-slate-300">
                      <tr>
                        <th className="p-2">Descrição</th>
                        <th className="p-2 w-20 text-right">Qtd</th>
                        <th className="p-2 w-28 text-right">Preço Unit (MT)</th>
                        <th className="p-2 w-20 text-right">Desc %</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="Nome do produto/serviço"
                              value={item.description}
                              onChange={(e) => updateItem(idx, 'description', e.target.value)}
                              className="w-full p-1 border border-slate-300 rounded text-xs"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                              className="w-full p-1 border border-slate-300 rounded text-xs text-right"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="10"
                              value={item.unit_price}
                              onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                              className="w-full p-1 border border-slate-300 rounded text-xs text-right"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount_percent}
                              onChange={(e) => updateItem(idx, 'discount_percent', e.target.value)}
                              className="w-full p-1 border border-slate-300 rounded text-xs text-right"
                            />
                          </td>
                          <td className="p-2 text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  Gerar e Guardar Documento
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </ModuleGuard>
  );
}
