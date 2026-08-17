'use client';

import React, { useState } from 'react';
import { X, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';
import { AdminLicenseItem } from '@/services/admin_licensing';

interface RenewalFormModalProps {
  license: AdminLicenseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRenew: (id: number, days: number) => Promise<any>;
  isRenewing?: boolean;
}

export const RenewalForm: React.FC<RenewalFormModalProps> = ({
  license,
  isOpen,
  onClose,
  onRenew,
  isRenewing = false,
}) => {
  const [days, setDays] = useState(365);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !license) return null;

  const currentExpiry = new Date(license.expires_at);
  const calculatedExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await onRenew(license.id, days);
      setSuccessResult(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Falha ao renovar licença.');
    }
  };

  const handleClose = () => {
    setDays(365);
    setSuccessResult(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Renovação de Licença</h2>
              <p className="text-xs text-slate-400">{license.customer_name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
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

        {!successResult ? (
          <form onSubmit={handleRenew} className="space-y-4 mt-5">
            <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Plano Atual:</span>
                <span className="font-semibold text-slate-200 uppercase">{license.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Validade Atual:</span>
                <span className="font-semibold text-slate-200">
                  {new Date(license.expires_at).toLocaleDateString('pt-MZ')} ({license.days_remaining} dias)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Período de Extensão *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value={30}>+30 Dias (1 Mês)</option>
                  <option value={90}>+90 Dias (3 Meses)</option>
                  <option value={180}>+180 Dias (6 Meses)</option>
                  <option value={365}>+365 Dias (1 Ano Completo)</option>
                  <option value={730}>+730 Dias (2 Anos)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-medium">
              📅 Nova data estimada de expiração: <span className="font-bold">{calculatedExpiry.toLocaleDateString('pt-MZ')}</span>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isRenewing}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isRenewing ? 'animate-spin' : ''}`} />
                {isRenewing ? 'A renovar...' : 'Confirmar Renovação'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 mt-5">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-300">Licença Renovada com Sucesso!</h4>
                <p className="text-xs text-slate-400">
                  Nova validade até {new Date(successResult.new_expiry).toLocaleDateString('pt-MZ')}.
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
