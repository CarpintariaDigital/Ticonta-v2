'use client';

import React, { useState } from 'react';
import { X, KeyRound, Copy, Check, Sparkles, Building, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { GenerateLicensePayload } from '@/services/admin_licensing';

interface GenerateLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: GenerateLicensePayload) => Promise<any>;
  isGenerating?: boolean;
}

export const GenerateLicenseModal: React.FC<GenerateLicenseModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating = false,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [plan, setPlan] = useState('complete');
  const [days, setDays] = useState(365);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await onGenerate({
        customer_name: customerName,
        customer_email: customerEmail || undefined,
        plan,
        days: Number(days),
      });
      setGeneratedResult(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Erro ao gerar chave de licença.');
    }
  };

  const handleCopy = () => {
    if (generatedResult?.license_key) {
      navigator.clipboard.writeText(generatedResult.license_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setPlan('complete');
    setDays(365);
    setGeneratedResult(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Emitir Chave de Licença</h2>
              <p className="text-xs text-slate-400">Assinatura Criptográfica HMAC-SHA256 Offline</p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
            {errorMsg}
          </div>
        )}

        {!generatedResult ? (
          /* Formulário de Emissão */
          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nome da Empresa / Cliente *
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="ex: Mercearia Boa Esperança Lda"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email de Notificação (Opcional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="cliente@empresa.co.mz"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Plano Contratado *
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="basic">BÁSICO (500 MT/mês)</option>
                  <option value="professional">PROFISSIONAL (1.500 MT/mês)</option>
                  <option value="complete">COMPLETO (3.500 MT/mês)</option>
                  <option value="enterprise">ENTERPRISE (Custom)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Validade (Dias) *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value={30}>30 Dias (1 Mês)</option>
                    <option value={90}>90 Dias (3 Meses)</option>
                    <option value={180}>180 Dias (Semestral)</option>
                    <option value={365}>365 Dias (1 Ano)</option>
                    <option value={730}>730 Dias (2 Anos)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'A gerar chave...' : 'Gerar Chave de Licença'}
              </button>
            </div>
          </form>
        ) : (
          /* Resultado da Emissão */
          <div className="space-y-5 mt-5">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                <ShieldCheck className="w-5 h-5" />
                Chave Criptográfica Gerada com Sucesso!
              </div>
              <p className="text-xs text-slate-400">
                A chave foi registada e está pronta para ativação na instância do cliente.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Chave de Ativação (HMAC-SHA256)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedResult.license_key}
                  className="w-full px-3.5 py-3 bg-slate-950 font-mono text-sm text-emerald-300 font-bold border border-slate-700 rounded-xl select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors shrink-0"
                  title="Copiar Chave"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">ID do Cliente:</span>
                <span className="font-semibold text-slate-200">{generatedResult.customer_id}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Plano:</span>
                <span className="font-semibold text-slate-200 uppercase">{generatedResult.plan}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Preço Calculado:</span>
                <span className="font-semibold text-emerald-400">
                  {Number(generatedResult.price_mzn || 0).toLocaleString('pt-MZ')} MZN
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Expira em:</span>
                <span className="font-semibold text-slate-200">
                  {new Date(generatedResult.expires_at).toLocaleDateString('pt-MZ')}
                </span>
              </div>
            </div>

            {/* Ações de Compartilhamento WhatsApp e Cópia */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const planNames: Record<string, string> = {
                    basic: 'Básico (500 MT/mês)',
                    professional: 'Profissional (1.500 MT/mês)',
                    complete: 'Completo (3.500 MT/mês)',
                    enterprise: 'Enterprise (Personalizado)',
                  };
                  const planText = planNames[generatedResult.plan] || generatedResult.plan;
                  const expiryText = new Date(generatedResult.expires_at).toLocaleDateString('pt-MZ');

                  const waText = `🔐 *TICONTA ERP v2 — ATIVAÇÃO DE LICENÇA OFICIAL*
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *Cliente:* ${generatedResult.customer_name}
📋 *Plano:* ${planText}
📅 *Validade:* ${expiryText} (${generatedResult.days_remaining} dias)
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 *CHAVE DE ATIVAÇÃO:*
\`${generatedResult.license_key}\`
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ *COMO ATIVAR:*
1. Abra o TiConta ERP no seu dispositivo (computador ou telemóvel);
2. Aceda a *Definições > Licença*;
3. Cole a Chave de Ativação acima e clique em *Ativar Licença*;
4. O sistema desbloqueará imediatamente todos os módulos contratados, mesmo sem internet.

🇲🇿 *Suporte Técnico Carpintaria Digital:* +258 84 000 0000`;

                  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
                  window.open(waUrl, '_blank');
                }}
                className="w-full py-2.5 px-4 text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all"
              >
                <span>📲 Enviar Chave & Instruções via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full py-2.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Concluir & Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
