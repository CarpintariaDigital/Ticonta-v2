'use client';

import React, { useState } from 'react';
import { Smartphone, CheckCircle2, ShieldCheck, AlertCircle, Copy, Check } from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ManualMobilePaymentConfirmProps {
  amount: number;
  provider: 'M-Pesa' | 'e-Mola';
  companyPhone?: string;
  companyName?: string;
  clientPhone?: string;
  onConfirm: (transactionId: string, notes?: string) => void;
  isLoading?: boolean;
}

export function ManualMobilePaymentConfirm({
  amount,
  provider,
  companyPhone = '+258 84 100 2000',
  companyName = 'TiConta Pay',
  clientPhone = '',
  onConfirm,
  isLoading = false,
}: ManualMobilePaymentConfirmProps) {
  const [transactionId, setTransactionId] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [error, setError] = useState('');

  const isMpesa = provider === 'M-Pesa';
  const providerColor = isMpesa ? 'text-red-600' : 'text-amber-600';
  const providerBg = isMpesa ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200';
  const defaultAccount = isMpesa ? '84 000 1234 (M-Pesa Empresa)' : '86 000 1234 (e-Mola Empresa)';

  const handleCopy = () => {
    navigator.clipboard.writeText(companyPhone || defaultAccount);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const handleExecute = () => {
    if (!transactionId.trim() || transactionId.trim().length < 4) {
      setError('Por favor insira o Código de Transação / TxID recebido por SMS.');
      return;
    }
    setError('');
    onConfirm(transactionId.trim(), `Confirmado manualmente via SMS ${provider}`);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Instructions & Account Info */}
      <div className={`p-3.5 rounded-lg border ${providerBg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-md bg-white border border-slate-200 shadow-sm shrink-0">
            <Smartphone size={20} className={providerColor} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 uppercase">Recebimento {provider}</span>
              <Badge variant={isMpesa ? 'red' : 'amber'}>Manual SMS</Badge>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Solicite ao cliente o envio de <strong className="text-slate-900">{formatMZN(amount)}</strong> para a conta do negócio:
            </p>
            <div className="font-bold text-slate-800 text-xs mt-1 flex items-center gap-2">
              <span>Conta / Agente: {companyPhone || defaultAccount}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[10px] text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
              >
                {copiedAccount ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copiedAccount ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-right sm:border-l sm:pl-4 border-slate-300 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
          <span className="text-[10px] text-slate-500 uppercase">Valor a Receber</span>
          <span className="text-base font-bold text-emerald-700 font-mono">{formatMZN(amount)}</span>
        </div>
      </div>

      {/* SMS Transaction Code Input */}
      <div className="panel-inset p-3 rounded-lg space-y-2.5 bg-slate-50 border border-slate-200">
        <label className="block text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Código de Transação / TxID do SMS ({provider})</span>
        </label>
        <p className="text-[11px] text-slate-500">
          Introduza o código da mensagem de confirmação (ex: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">{isMpesa ? 'MP260925.1630.B812' : 'EM98201458'}</code>):
        </p>

        <Input
          value={transactionId}
          onChange={(e) => {
            setTransactionId(e.target.value.toUpperCase());
            if (error) setError('');
          }}
          placeholder={isMpesa ? 'Ex: MP260925.1740.A901' : 'Ex: EM84920194'}
          className="text-sm font-mono font-bold uppercase tracking-wider bg-white"
          autoFocus
        />

        {error && (
          <p className="text-[11px] text-red-600 flex items-center gap-1">
            <AlertCircle size={12} />
            <span>{error}</span>
          </p>
        )}
      </div>

      {/* Big Action Button for Manual Confirmation */}
      <Button
        variant="primary"
        size="md"
        onClick={handleExecute}
        disabled={isLoading || !transactionId.trim()}
        className="w-full py-3 text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold"
      >
        <CheckCircle2 size={18} />
        <span>✅ Confirmar Pagamento Manualmente ({provider})</span>
      </Button>
    </div>
  );
}
