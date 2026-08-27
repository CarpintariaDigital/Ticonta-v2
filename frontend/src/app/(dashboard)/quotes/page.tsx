"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import {
  FileText,
  Plus,
  Search,
  Send,
  Printer,
  CheckCircle,
  Clock,
  Trash2,
  Building,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Share2,
  ExternalLink,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
}

export interface Quote {
  id: string;
  quote_number: string;
  type: "proforma" | "quote";
  customer_name: string;
  customer_nuit: string;
  customer_phone: string;
  customer_email?: string;
  date: string;
  validity_days: number;
  payment_terms: string;
  items: QuoteItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "converted";
  notes?: string;
}

const DEFAULT_QUOTES: Quote[] = [
  {
    id: "q-1",
    quote_number: "FP-2026-0042",
    type: "proforma",
    customer_name: "Construtora Rovuma Lda",
    customer_nuit: "400889123",
    customer_phone: "849911223",
    customer_email: "compras@rovuma.co.mz",
    date: new Date().toISOString().split("T")[0],
    validity_days: 15,
    payment_terms: "50% Sinal na adjudicação / 50% na entrega",
    items: [
      { id: "it-1", description: "Cimento Portland CPJ-32.5 (Saco 50kg)", quantity: 50, unit_price: 480, discount: 0 },
      { id: "it-2", description: "Varão de Aço Nervurado 12mm (Barra 12m)", quantity: 20, unit_price: 850, discount: 5 },
      { id: "it-3", description: "Transporte e Descarga em Obra (Matola)", quantity: 1, unit_price: 3500, discount: 0 },
    ],
    subtotal: 44500,
    tax_amount: 7120,
    total_amount: 51620,
    status: "sent",
    notes: "Preços com IVA 16% incluído. Entrega em 48 horas após confirmação.",
  },
  {
    id: "q-2",
    quote_number: "COT-2026-0019",
    type: "quote",
    customer_name: "Escola Secundária Josina Machel",
    customer_nuit: "400112233",
    customer_phone: "823344556",
    customer_email: "direcao@esjm.edu.mz",
    date: new Date().toISOString().split("T")[0],
    validity_days: 30,
    payment_terms: "Pronto Pagamento / Transferência Bancária",
    items: [
      { id: "it-10", description: "Secretárias Escolares Duplas com Banco", quantity: 30, unit_price: 3200, discount: 10 },
      { id: "it-11", description: "Quadro Branco Magnético 2.0x1.20m", quantity: 4, unit_price: 4500, discount: 0 },
    ],
    subtotal: 104400,
    tax_amount: 16704,
    total_amount: 121104,
    status: "accepted",
    notes: "Garantia de 12 meses contra defeitos de fabrico.",
  },
];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ticonta_store_quotes");
      return saved ? JSON.parse(saved) : DEFAULT_QUOTES;
    }
    return DEFAULT_QUOTES;
  });

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<Quote | null>(null);

  // New Quote Form State
  const [quoteType, setQuoteType] = useState<"proforma" | "quote">("proforma");
  const [customerName, setCustomerName] = useState("");
  const [customerNuit, setCustomerNuit] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [validityDays, setValidityDays] = useState(15);
  const [paymentTerms, setPaymentTerms] = useState("Pronto Pagamento / Transferência Bancária");
  const [notes, setNotes] = useState("Proposta válida pelo período indicado. Preços sujeitos a confirmação.");
  const [items, setItems] = useState<QuoteItem[]>([
    { id: `it-${Date.now()}`, description: "", quantity: 1, unit_price: 0, discount: 0 },
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCompany = localStorage.getItem("ticonta_company_profile");
      if (savedCompany) {
        try {
          setCompanyProfile(JSON.parse(savedCompany));
        } catch {}
      }
    }
  }, []);

  const saveQuotes = (updated: Quote[]) => {
    setQuotes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("ticonta_store_quotes", JSON.stringify(updated));
    }
  };

  const handleAddItemRow = () => {
    setItems([
      ...items,
      { id: `it-${Date.now()}`, description: "", quantity: 1, unit_price: 0, discount: 0 },
    ]);
  };

  const handleRemoveItemRow = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(
      items.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  // Totals calculations
  const calculateTotals = (itemList: QuoteItem[]) => {
    let subtotal = 0;
    itemList.forEach((it) => {
      const lineGross = (Number(it.quantity) || 0) * (Number(it.unit_price) || 0);
      const lineDisc = lineGross * ((Number(it.discount) || 0) / 100);
      subtotal += lineGross - lineDisc;
    });
    const tax = subtotal * (companyProfile.default_vat_rate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax: taxAmount, total: totalAmount } = calculateTotals(items);

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || items.length === 0) return;

    const prefix = quoteType === "proforma" ? "FP" : "COT";
    const newQuote: Quote = {
      id: `q-${Date.now()}`,
      quote_number: `${prefix}-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(4, "0")}`,
      type: quoteType,
      customer_name: customerName.trim(),
      customer_nuit: customerNuit.trim() || "Consumidor Final",
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim(),
      date: new Date().toISOString().split("T")[0],
      validity_days: Number(validityDays) || 15,
      payment_terms: paymentTerms,
      items: items.filter((it) => it.description.trim() !== ""),
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      status: "sent",
      notes,
    };

    saveQuotes([newQuote, ...quotes]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerNuit("");
    setCustomerPhone("");
    setCustomerEmail("");
    setValidityDays(15);
    setItems([{ id: `it-${Date.now()}`, description: "", quantity: 1, unit_price: 0, discount: 0 }]);
  };

  const handleSendWhatsApp = (q: Quote) => {
    const itemsList = q.items
      .map(
        (it) =>
          `• ${it.quantity}x ${it.description} — ${(it.quantity * it.unit_price * (1 - it.discount / 100)).toFixed(2)} MT`
      )
      .join("\n");

    const message = `📋 *${companyProfile.name.toUpperCase()}*
📄 *${q.type === "proforma" ? "FATURA PRÓ-FORMA" : "COTAÇÃO COMERCIAL"}* Nº ${q.quote_number}
━━━━━━━━━━━━━━━━━━━━
👤 *CLIENTE:* ${q.customer_name}
🆔 *NUIT:* ${q.customer_nuit}
📅 *DATA:* ${q.date} (Válido por ${q.validity_days} dias)
━━━━━━━━━━━━━━━━━━━━
🛒 *ARTIGOS & SERVIÇOS:*
${itemsList}
━━━━━━━━━━━━━━━━━━━━
💵 *Subtotal:* ${q.subtotal.toFixed(2)} MT
📊 *IVA (${companyProfile.default_vat_rate}%):* ${q.tax_amount.toFixed(2)} MT
💰 *VALOR TOTAL:* *${q.total_amount.toFixed(2)} MT*
━━━━━━━━━━━━━━━━━━━━
💳 *Condições:* ${q.payment_terms}
📝 *Nota:* ${q.notes || "Obrigado pela oportunidade de negócio!"}`;

    const cleanPhone = q.customer_phone.replace(/\D/g, "");
    const finalPhone = cleanPhone.startsWith("258")
      ? cleanPhone
      : cleanPhone.length === 9
      ? `258${cleanPhone}`
      : cleanPhone;

    const url = finalPhone
      ? `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  const handlePrint = (q: Quote) => {
    setSelectedQuoteForPrint(q);
    setTimeout(() => window.print(), 300);
  };

  const filteredQuotes = quotes.filter(
    (q) =>
      q.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer_nuit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <DashboardNavbar />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Cotações & Faturas Pró-Forma
                </h1>
                <p className="text-xs text-slate-400">
                  Emissão de propostas comerciais com IVA 16%, envio WhatsApp e conversão em venda.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-950"
            >
              <Plus className="w-4 h-4" />
              Nova Pró-Forma / Cotação
            </Button>
          </div>

          {/* Search & Metrics bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Pesquisar por nº de documento, cliente ou NUIT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-800 text-white text-xs h-11 rounded-2xl"
              />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">Total em Propostas:</span>
              <span className="font-mono font-bold text-white text-sm">
                {quotes.reduce((acc, q) => acc + q.total_amount, 0).toLocaleString("pt-MZ")}{" "}
                <span className="text-emerald-400 text-xs">MT</span>
              </span>
            </div>
          </div>

          {/* Quotes Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Documento</th>
                    <th className="py-3.5 px-4">Cliente / Entidade</th>
                    <th className="py-3.5 px-4">Data & Validade</th>
                    <th className="py-3.5 px-4">Artigos</th>
                    <th className="py-3.5 px-4">Valor Total (c/ IVA)</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white font-mono block">{q.quote_number}</span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            q.type === "proforma"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                          }`}
                        >
                          {q.type === "proforma" ? "Pró-Forma" : "Cotação"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white block">{q.customer_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          NUIT: {q.customer_nuit} {q.customer_phone && `• 📞 ${q.customer_phone}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <div>{q.date}</div>
                        <div className="text-slate-500 text-[10px]">{q.validity_days} dias validade</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {q.items.length} itens
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                        {q.total_amount.toFixed(2)} MT
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            q.status === "accepted"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : q.status === "converted"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {q.status === "accepted"
                            ? "Aprovada"
                            : q.status === "converted"
                            ? "Convertida em Venda"
                            : "Enviada"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSendWhatsApp(q)}
                            title="Enviar via WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handlePrint(q)}
                            title="Imprimir / PDF"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Create Proforma / Quote */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
              <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Nova Fatura Pró-Forma / Cotação Comercial
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateQuote} className="flex-1 overflow-y-auto space-y-4 py-4 text-xs">
                  {/* Type Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuoteType("proforma")}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                        quoteType === "proforma"
                          ? "bg-blue-600 text-white border-blue-400"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      Fatura Pró-Forma (FP)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuoteType("quote")}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                        quoteType === "quote"
                          ? "bg-purple-600 text-white border-purple-400"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      Cotação Comercial (COT)
                    </button>
                  </div>

                  {/* Customer Details */}
                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Dados do Cliente / Adjudicatário
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Nome / Empresa *</label>
                        <Input
                          required
                          placeholder="ex: Moza Empreendimentos Lda"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">NUIT</label>
                        <Input
                          placeholder="ex: 400123456"
                          value={customerNuit}
                          onChange={(e) => setCustomerNuit(e.target.value)}
                          className="bg-slate-900 border-slate-700 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Contacto WhatsApp *</label>
                        <Input
                          required
                          placeholder="ex: 841234567"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="bg-slate-900 border-slate-700 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Email</label>
                        <Input
                          type="email"
                          placeholder="compras@empresa.co.mz"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Items Lines */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Linhas de Artigos / Serviços
                      </span>
                      <Button
                        type="button"
                        onClick={handleAddItemRow}
                        className="h-7 px-2.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-white font-bold"
                      >
                        + Adicionar Artigo
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {items.map((item, idx) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl items-center"
                        >
                          <div className="col-span-6">
                            <Input
                              required
                              placeholder="Designação do artigo ou serviço"
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                              className="bg-slate-900 border-slate-700 text-white h-8 text-xs"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              min="1"
                              placeholder="Qtd"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                              className="bg-slate-900 border-slate-700 text-white h-8 text-xs font-mono"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              step="any"
                              placeholder="Preço (MT)"
                              value={item.unit_price || ""}
                              onChange={(e) => handleItemChange(item.id, "unit_price", Number(e.target.value))}
                              className="bg-slate-900 border-slate-700 text-white h-8 text-xs font-mono"
                            />
                          </div>
                          <div className="col-span-1">
                            <Input
                              type="number"
                              placeholder="Desc %"
                              value={item.discount || ""}
                              onChange={(e) => handleItemChange(item.id, "discount", Number(e.target.value))}
                              className="bg-slate-900 border-slate-700 text-white h-8 text-xs font-mono"
                            />
                          </div>
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(item.id)}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms & Totals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Validade da Proposta (Dias)</label>
                        <Input
                          type="number"
                          value={validityDays}
                          onChange={(e) => setValidityDays(Number(e.target.value))}
                          className="bg-slate-900 border-slate-700 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Condições de Pagamento</label>
                        <Input
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1 font-mono text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Subtotal:</span>
                        <span>{subtotal.toFixed(2)} MT</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>IVA {companyProfile.default_vat_rate}%:</span>
                        <span className="text-emerald-400">{taxAmount.toFixed(2)} MT</span>
                      </div>
                      <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-800 text-white">
                        <span>VALOR TOTAL:</span>
                        <span className="text-emerald-400">{totalAmount.toFixed(2)} MT</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-slate-700">
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
                      Gerar Documento
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Printable A4 Sheet (Hidden on screen, shown in print) */}
          {selectedQuoteForPrint && (
            <div className="hidden print:block fixed inset-0 bg-white text-black p-8 font-sans">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h1 className="text-xl font-black uppercase text-black">{companyProfile.name}</h1>
                  <p className="text-xs text-gray-600">NUIT: {companyProfile.nuit} • {companyProfile.address}</p>
                  <p className="text-xs text-gray-600">Tel: {companyProfile.phone} • Email: {companyProfile.email}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-black text-blue-900">
                    {selectedQuoteForPrint.type === "proforma" ? "FATURA PRÓ-FORMA" : "COTAÇÃO"}
                  </h2>
                  <p className="text-xs font-mono font-bold text-gray-800">{selectedQuoteForPrint.quote_number}</p>
                  <p className="text-xs text-gray-600">Data: {selectedQuoteForPrint.date}</p>
                </div>
              </div>

              <div className="my-4 p-3 bg-gray-50 border rounded text-xs">
                <span className="font-bold block text-gray-700">EXMO.(S) SENHOR(ES):</span>
                <p className="font-bold text-sm text-black">{selectedQuoteForPrint.customer_name}</p>
                <p className="text-gray-600">NUIT: {selectedQuoteForPrint.customer_nuit}</p>
                <p className="text-gray-600">Tel: {selectedQuoteForPrint.customer_phone}</p>
              </div>

              <table className="w-full text-xs my-4 border-collapse">
                <thead>
                  <tr className="border-b bg-gray-100">
                    <th className="py-2 px-2 text-left">Descrição</th>
                    <th className="py-2 px-2 text-center">Qtd</th>
                    <th className="py-2 px-2 text-right">Preço Unit.</th>
                    <th className="py-2 px-2 text-right">Desc %</th>
                    <th className="py-2 px-2 text-right">Total (MT)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuoteForPrint.items.map((it, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-2">{it.description}</td>
                      <td className="py-2 px-2 text-center">{it.quantity}</td>
                      <td className="py-2 px-2 text-right">{it.unit_price.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right">{it.discount}%</td>
                      <td className="py-2 px-2 text-right font-bold">
                        {(it.quantity * it.unit_price * (1 - it.discount / 100)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-start pt-4 border-t">
                <div className="text-xs text-gray-600 max-w-xs">
                  <p className="font-bold text-gray-800">Condições de Pagamento:</p>
                  <p>{selectedQuoteForPrint.payment_terms}</p>
                  <p className="mt-2 text-gray-500">Validade: {selectedQuoteForPrint.validity_days} dias a partir da data de emissão.</p>
                </div>
                <div className="text-right text-xs space-y-1">
                  <p>Subtotal: {selectedQuoteForPrint.subtotal.toFixed(2)} MT</p>
                  <p>IVA ({companyProfile.default_vat_rate}%): {selectedQuoteForPrint.tax_amount.toFixed(2)} MT</p>
                  <p className="text-sm font-black text-black pt-1 border-t">
                    TOTAL: {selectedQuoteForPrint.total_amount.toFixed(2)} MT
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
