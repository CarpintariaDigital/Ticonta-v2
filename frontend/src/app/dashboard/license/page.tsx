'use client';

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Plus,
  Search,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Ban,
  Clock,
  Send,
  Users,
} from 'lucide-react';
import { useAdminLicenseStore, AdminLicenseItem } from '@/store/admin_license.store';
import { useLicenseStore } from '@/store/licenseStore';
import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatMZN } from '@/lib/currency';
import { AdminModulePricingManager } from '@/components/pricing/AdminModulePricingManager';

export default function LicenseManagementPage() {
  const { licenses, stats, generateLicense, revokeLicense, renewLicense, fetchLicenses } = useAdminLicenseStore();
  const { license: localLicense, activateLicense: activateLocalLicense } = useLicenseStore();
  const { company } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'admin' | 'pricing' | 'local'>('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastGeneratedLicense, setLastGeneratedLicense] = useState<AdminLicenseItem | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [nuit, setNuit] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [durationDays, setDurationDays] = useState(365);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Local Activation State
  const [keyInput, setKeyInput] = useState('');
  const [localFeedback, setLocalFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  const filteredLicenses = licenses.filter((l) => {
    const name = (l.customer_name || l.client_name || '').toLowerCase();
    const key = (l.license_key || '').toLowerCase();
    const n = (l.nuit || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = name.includes(q) || key.includes(q) || n.includes(q);
    const matchesPlan = planFilter === 'ALL' || l.plan.toLowerCase() === planFilter.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const newLic = await generateLicense({
      customer_name: customerName,
      nuit: nuit.trim() || '999999999',
      customer_phone: customerPhone,
      customer_email: customerEmail,
      plan: selectedPlan,
      days: durationDays,
    });

    setLastGeneratedLicense(newLic);
    setIsGenerateModalOpen(false);
    setIsSuccessModalOpen(true);

    // Reset Form
    setCustomerName('');
    setNuit('');
    setCustomerPhone('');
    setCustomerEmail('');
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const generateWhatsAppMessage = (lic: AdminLicenseItem) => {
    const planName =
      lic.plan.toLowerCase() === 'enterprise'
        ? 'Enterprise (Acesso Ilimitado)'
        : lic.plan.toLowerCase() === 'pro'
        ? 'Profissional'
        : 'Básico';

    const expiryDate = new Date(lic.expires_at).toLocaleDateString('pt-MZ');

    return encodeURIComponent(
      `🏛️ *CARPINTARIA DIGITAL — CHAVE DE ATIVAÇÃO TICONTA ERP v2*\n\n` +
      `Olá *${lic.customer_name || 'Estimado Cliente'}*,\n` +
      `A sua licença oficial do TiConta ERP v2 foi emitida com sucesso.\n\n` +
      `📋 *Plano:* ${planName}\n` +
      `🔑 *Chave de Ativação:* \`${lic.license_key}\`\n` +
      `📅 *Validade:* ${expiryDate}\n` +
      `⚡ *Modo:* Offline-First (Funciona sem internet)\n\n` +
      `👉 *Como Ativar:*\n` +
      `1. Abra o TiConta ERP no seu dispositivo\n` +
      `2. Aceda a *Definições > Licenciamento*\n` +
      `3. Cole a sua chave e clique em *Ativar*\n\n` +
      `Suporte Técnico: +258 84 000 0000 | Carpintaria Digital`
    );
  };

  const handleSendWhatsApp = (lic: AdminLicenseItem) => {
    const text = generateWhatsAppMessage(lic);
    const phoneClean = (lic.customer_phone || '').replace(/\D/g, '');
    const url = phoneClean ? `https://wa.me/${phoneClean}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleLocalActivate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = activateLocalLicense(keyInput);
    if (res.success) {
      setLocalFeedback({ type: 'success', message: res.message });
      setKeyInput('');
    } else {
      setLocalFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header & Tabs */}
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <KeyRound size={18} className="text-emerald-700" />
              <span>GESTOR CENTRAL DE LICENÇAS — TICONTA ERP v2</span>
            </h2>
            <Badge variant="purple" className="font-bold">SUPER ADMIN</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Emissão de chaves criptográficas HMAC-SHA256, controle de subscrições em MZN e envio automatizado via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-1.5 px-3 rounded-md font-bold text-xs transition ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            👑 Painel do Criador & Licenciador
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-1.5 px-3 rounded-md font-bold text-xs transition ${
              activeTab === 'pricing'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ⚙️ Preços & Descontos dos Módulos
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`py-1.5 px-3 rounded-md font-bold text-xs transition ${
              activeTab === 'local'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🏢 Ativação Neste Dispositivo
          </button>
        </div>
      </div>

      {activeTab === 'pricing' ? (
        <AdminModulePricingManager />
      ) : activeTab === 'admin' ? (
        <div className="space-y-6">
          {/* Admin Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-300">
              <CardContent className="p-4 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase flex justify-between items-center">
                  <span>Licenças Emitidas</span>
                  <KeyRound size={14} className="text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats.total_licenses}</div>
                <div className="text-[10px] text-slate-500">Total gerado no sistema</div>
              </CardContent>
            </Card>

            <Card className="border-slate-300">
              <CardContent className="p-4 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase flex justify-between items-center">
                  <span>Licenças Ativas</span>
                  <ShieldCheck size={14} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-700">{stats.active_licenses}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Empresas a faturar</div>
              </CardContent>
            </Card>

            <Card className="border-slate-300">
              <CardContent className="p-4 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase flex justify-between items-center">
                  <span>MRR Recorrente Estimado</span>
                  <Sparkles size={14} className="text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{formatMZN(stats.mrr_mzn)}</div>
                <div className="text-[10px] text-slate-500">Faturamento mensal em MZN</div>
              </CardContent>
            </Card>

            <Card className="border-slate-300">
              <CardContent className="p-4 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase flex justify-between items-center">
                  <span>A Expirar (&lt; 30 dias)</span>
                  <Clock size={14} className="text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-600">{stats.expiring_soon}</div>
                <div className="text-[10px] text-slate-500">Oportunidade de renovação</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Bar & Search */}
          <div className="p-4 bg-white border border-slate-300 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por Cliente, NUIT ou Chave..."
                  className="pl-8 text-xs font-mono"
                />
              </div>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="text-xs font-mono p-2 rounded-md border border-slate-300 bg-slate-50"
              >
                <option value="ALL">Todos os Planos</option>
                <option value="basic">BÁSICO (500 MT)</option>
                <option value="pro">PROFISSIONAL (1.500 MT)</option>
                <option value="complete">COMPLETO (3.500 MT)</option>
                <option value="enterprise">ENTERPRISE (7.500 MT)</option>
              </select>
            </div>

            <Button
              variant="primary"
              onClick={() => setIsGenerateModalOpen(true)}
              className="flex items-center justify-center gap-2 py-2 px-4 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <Plus size={16} />
              <span>🔑 Emitir Nova Licença</span>
            </Button>
          </div>

          {/* Licenses Table */}
          <Card className="border-slate-300">
            <CardHeader className="p-3 bg-slate-50 border-b border-slate-200">
              <CardTitle className="text-xs uppercase text-slate-800 font-bold flex items-center justify-between">
                <span>Licenças de Software Emitidas ({filteredLicenses.length})</span>
                <span className="text-[10px] text-slate-500 font-normal">Algoritmo HMAC-SHA256 Ativo</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 text-[10px] font-bold">
                    <th className="p-3">CLIENTE / EMPRESA</th>
                    <th className="p-3">PLANO</th>
                    <th className="p-3">CHAVE CRIPTOGRÁFICA</th>
                    <th className="p-3">VALIDADE / EXPIRAÇÃO</th>
                    <th className="p-3 text-center">ESTADO</th>
                    <th className="p-3 text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredLicenses.map((lic) => {
                    const isRevoked = lic.status === 'revoked' || lic.is_active === false;
                    const expFormatted = new Date(lic.expires_at).toLocaleDateString('pt-MZ');

                    return (
                      <tr key={lic.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 text-xs">
                            {lic.customer_name || lic.client_name || 'Cliente Sem Nome'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            NUIT: {lic.nuit || '999999999'} • Tel: {lic.customer_phone || 'N/D'}
                          </div>
                        </td>

                        <td className="p-3">
                          <Badge
                            variant={
                              lic.plan === 'enterprise'
                                ? 'purple'
                                : lic.plan === 'pro' || lic.plan === 'complete'
                                ? 'cyan'
                                : 'slate'
                            }
                            className="font-bold text-[10px] uppercase"
                          >
                            {lic.plan}
                          </Badge>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {lic.license_key}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyKey(lic.license_key)}
                              className="text-slate-400 hover:text-slate-700 p-1"
                              title="Copiar Chave"
                            >
                              {copiedKey === lic.license_key ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="p-3 text-slate-700">
                          <div className="font-semibold">{expFormatted}</div>
                          <div className="text-[10px] text-slate-500">{lic.days_remaining ?? 365} dias restantes</div>
                        </td>

                        <td className="p-3 text-center">
                          <Badge variant={isRevoked ? 'red' : 'emerald'} className="font-bold text-[10px]">
                            {isRevoked ? 'REVOGADA' : 'ATIVA'}
                          </Badge>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendWhatsApp(lic)}
                              className="text-[11px] text-emerald-700 border-emerald-300 hover:bg-emerald-50 px-2 py-1"
                              title="Enviar por WhatsApp"
                            >
                              <Smartphone size={12} className="mr-1" />
                              <span>WhatsApp</span>
                            </Button>

                            {!isRevoked ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => renewLicense(lic.id, 365)}
                                  className="text-[11px] text-cyan-700 border-cyan-300 hover:bg-cyan-50 px-2 py-1"
                                  title="Renovar +1 Ano"
                                >
                                  <span>+1 Ano</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (confirm(`Deseja revogar a licença de ${lic.customer_name}?`)) {
                                      revokeLicense(lic.id, 'Revogação manual pelo administrador');
                                    }
                                  }}
                                  className="text-[11px] text-red-600 border-red-200 hover:bg-red-50 px-1.5 py-1"
                                  title="Revogar"
                                >
                                  <Ban size={12} />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => renewLicense(lic.id, 365)}
                                className="text-[11px] text-emerald-700 border-emerald-300 hover:bg-emerald-50 px-2 py-1"
                              >
                                Reativar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* TAB 2: CLIENT LOCAL CERTIFICATE & ACTIVATION */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-300">
            <CardHeader className="p-3 bg-slate-50 border-b border-slate-200">
              <CardTitle className="text-xs uppercase text-slate-800 font-bold flex items-center gap-1.5">
                <Lock size={14} className="text-slate-600" />
                <span>Ativar / Testar Chave Neste Dispositivo</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <form onSubmit={handleLocalActivate} className="space-y-3">
                <Input
                  label="Chave Criptográfica de Ativação"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Ex: TC-100482914-A8F92BC10924-20270925"
                  className="font-mono text-xs"
                  required
                />

                {localFeedback && (
                  <div
                    className={`p-2.5 rounded border text-xs flex items-center gap-2 ${
                      localFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-red-50 border-red-300 text-red-800'
                    }`}
                  >
                    {localFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{localFeedback.message}</span>
                  </div>
                )}

                <Button variant="primary" type="submit" className="w-full">
                  Validar e Aplicar Chave de Licença
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-slate-300 bg-slate-900 text-white">
            <CardHeader className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <CardTitle className="text-xs uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>Certificado da Estação Local</span>
              </CardTitle>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/40">
                OFFLINE READY
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs">
              <div className="space-y-1 border-b border-slate-800 pb-3">
                <div className="text-[10px] text-slate-400 uppercase">Empresa:</div>
                <div className="font-bold text-white text-sm">{company.name}</div>
                <div className="text-[11px] text-slate-400">NUIT: {company.nuit} • {company.address}</div>
              </div>

              <div className="space-y-1 border-b border-slate-800 pb-3">
                <div className="text-[10px] text-slate-400 uppercase">Chave Ativa:</div>
                <div className="font-mono text-emerald-300 text-xs break-all bg-slate-950 p-2 rounded border border-slate-800">
                  {localLicense.key}
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Plano: {localLicense.plan}</span>
                <span>Validade: {localLicense.daysRemaining} Dias restantes</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 1: EMITIR NOVA LICENÇA */}
      {isGenerateModalOpen && (
        <Modal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          title="EMISSOR DE LICENÇAS CRIPTOGRÁFICAS TICONTA v2"
          size="md"
        >
          <form onSubmit={handleCreateLicense} className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <Input
                label="Nome do Cliente / Empresa *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Supermercado Polana Lda"
                required
                className="text-xs font-sans"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="NUIT Fiscal (9 Dígitos)"
                  value={nuit}
                  onChange={(e) => setNuit(e.target.value.replace(/\D/g, ''))}
                  placeholder="100829143"
                  maxLength={9}
                  className="text-xs"
                />
                <Input
                  label="Telemóvel (WhatsApp do Cliente)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+258 84 000 0000"
                  className="text-xs"
                />
              </div>

              <Input
                label="Email do Cliente (Opcional)"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="cliente@empresa.co.mz"
                className="text-xs"
              />
            </div>

            {/* Plan Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase">
                Seleccionar Plano
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'basic', name: 'BÁSICO', price: '500 MT/mês' },
                  { id: 'pro', name: 'PRO', price: '1.500 MT/mês' },
                  { id: 'complete', name: 'COMPLETO', price: '3.500 MT/mês' },
                  { id: 'enterprise', name: 'ENTERPRISE', price: '7.500 MT/mês' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlan(p.id)}
                    className={`p-2.5 rounded-lg border text-center transition ${
                      selectedPlan === p.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">{p.name}</div>
                    <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">{p.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Validity Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase">
                Período de Validade
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { days: 30, label: '30 Dias' },
                  { days: 90, label: '3 Meses' },
                  { days: 180, label: '6 Meses' },
                  { days: 365, label: '1 Ano' },
                ].map((d) => (
                  <button
                    key={d.days}
                    type="button"
                    onClick={() => setDurationDays(d.days)}
                    className={`py-1.5 rounded border text-xs font-bold ${
                      durationDays === d.days
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-slate-50 border-slate-300 text-slate-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" type="button" onClick={() => setIsGenerateModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                🔑 Gerar e Assinar Chave
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: LICENÇA GERADA COM SUCESSO & DISPARO WHATSAPP */}
      {isSuccessModalOpen && lastGeneratedLicense && (
        <Modal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          title="🎉 LICENÇA DIGITAL EMITIDA COM SUCESSO"
          size="md"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 space-y-1">
              <div className="font-bold text-sm flex items-center gap-1.5">
                <CheckCircle2 className="text-emerald-600" size={18} />
                <span>Chave Criptográfica Gerada para {lastGeneratedLicense.customer_name}</span>
              </div>
              <p className="text-xs text-emerald-700">
                A licença está pronta para ser enviada diretamente para o WhatsApp do cliente.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-lg text-white space-y-2 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Chave de Ativação do TiConta v2:</div>
              <div className="text-base font-bold text-emerald-400 tracking-wider break-all bg-slate-950 p-2.5 rounded border border-slate-800">
                {lastGeneratedLicense.license_key}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Plano: {lastGeneratedLicense.plan.toUpperCase()}</span>
                <span>Validade: {new Date(lastGeneratedLicense.expires_at).toLocaleDateString('pt-MZ')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <Button
                variant="primary"
                onClick={() => handleSendWhatsApp(lastGeneratedLicense)}
                className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <Smartphone size={16} />
                <span>Enviar para WhatsApp</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleCopyKey(lastGeneratedLicense.license_key)}
                className="flex items-center justify-center gap-2 py-2.5"
              >
                {copiedKey === lastGeneratedLicense.license_key ? (
                  <Check size={16} className="text-emerald-600" />
                ) : (
                  <Copy size={16} />
                )}
                <span>{copiedKey === lastGeneratedLicense.license_key ? 'Copiado!' : 'Copiar Chave'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
