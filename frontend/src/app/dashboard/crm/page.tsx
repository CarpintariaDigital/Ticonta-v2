'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MessageSquare, 
  Phone, 
  Star, 
  TrendingUp, 
  Mail, 
  Building2,
  Calendar
} from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { openWhatsApp } from '@/lib/whatsapp';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  nuit: string;
  segment: 'VIP' | 'Regular' | 'Corporativo' | 'Novo';
  totalPurchases: number;
  lastPurchase: string;
}

const initialCustomers: Customer[] = [
  { id: 'CUST-01', name: 'Armando Cossa', phone: '+258 84 392 8190', email: 'armando@email.mz', nuit: '100829143', segment: 'VIP', totalPurchases: 48900, lastPurchase: '2026-09-06' },
  { id: 'CUST-02', name: 'Construtora Zambezi Lda', phone: '+258 84 999 8888', email: 'compras@zambezi.co.mz', nuit: '100999888', segment: 'Corporativo', totalPurchases: 142000, lastPurchase: '2026-09-02' },
  { id: 'CUST-03', name: 'Oficina do Nhaca', phone: '+258 82 987 6543', email: 'nhaca@oficina.mz', nuit: '109876543', segment: 'Regular', totalPurchases: 32400, lastPurchase: '2026-08-28' },
  { id: 'CUST-04', name: 'Dona Teresa (Banca 4)', phone: '+258 87 555 1234', email: 'teresa@mercado.mz', nuit: '100456789', segment: 'VIP', totalPurchases: 18200, lastPurchase: '2026-09-05' },
];

export default function CRMPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+258 84 ');
  const [nuit, setNuit] = useState('');
  const [email, setEmail] = useState('');
  const [segment, setSegment] = useState<Customer['segment']>('Regular');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.nuit.includes(search)
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const newCust: Customer = {
      id: `CUST-${Date.now().toString(36).toUpperCase()}`,
      name,
      phone,
      email: email || 'cliente@email.mz',
      nuit: nuit || '999999999',
      segment,
      totalPurchases: 0,
      lastPurchase: new Date().toISOString().split('T')[0],
    };
    setCustomers([newCust, ...customers]);
    setIsNewModalOpen(false);
    setName('');
    setPhone('+258 84 ');
    setNuit('');
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users size={18} className="text-emerald-700" />
            <span>CRM & Gestão de Relacionamento com Clientes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Base de dados unificada com histórico de compras, segmentação e disparo direto de WhatsApp.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5"
        >
          <UserPlus size={14} />
          <span>Novo Cliente</span>
        </Button>
      </div>

      {/* Customer Table */}
      <Card className="border-slate-300">
        <CardHeader className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, NUIT ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="text-slate-500 text-xs">
            {filtered.length} clientes registados
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px]">
                <th className="py-2.5 px-4">CLIENTE</th>
                <th className="py-2.5 px-3">NUIT</th>
                <th className="py-2.5 px-3">SEGMENTO</th>
                <th className="py-2.5 px-3 text-right">TOTAL COMPRAS</th>
                <th className="py-2.5 px-3">ÚLTIMA COMPRA</th>
                <th className="py-2.5 px-4 text-right">CONTACTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500">{c.phone}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{c.nuit}</td>
                  <td className="py-3 px-3">
                    <Badge variant={c.segment === 'VIP' ? 'emerald' : c.segment === 'Corporativo' ? 'cyan' : 'slate'}>
                      {c.segment}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {formatMZN(c.totalPurchases)}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{c.lastPurchase}</td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openWhatsApp(c.phone, `Olá ${c.name}, tudo bem? Entramos em contacto pela Carpintaria Digital.`)}
                      className="text-[11px] h-7 px-2 border-emerald-300 hover:bg-emerald-50 text-emerald-800"
                    >
                      <MessageSquare size={12} className="mr-1 text-emerald-600" />
                      <span>WhatsApp</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal Novo Cliente */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="REGISTAR NOVO CLIENTE NO CRM"
        size="md"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" onClick={handleAdd}>
              Gravar Cliente
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAdd} className="space-y-3 font-mono text-xs">
          <Input label="Nome Completo / Empresa" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Telemóvel (WhatsApp)" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <Input label="NUIT (9 Dígitos)" value={nuit} onChange={(e) => setNuit(e.target.value)} placeholder="100829143" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.mz" />
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Segmento</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as Customer['segment'])}
                className="w-full h-9 rounded border border-slate-300 bg-white px-2 text-xs"
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Corporativo">Corporativo</option>
                <option value="Novo">Novo</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
