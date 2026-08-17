'use client';

import React, { useState } from 'react';
import { X, Ban, AlertTriangle } from 'lucide-react';
import { AdminLicenseItem } from '@/services/admin_licensing';

interface RevokeModalProps {
  license: AdminLicenseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRevoke: (id: number, reason: string) => Promise<any>;
  isRevoking?: boolean;
}

export const RevokeModal: React.FC<RevokeModalProps> = ({
  license,
  isOpen,
  onClose,
  onRevoke,
  isRevoking = false,
}) => {
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !license) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Por favor informe o motivo da revogação.');
      return;
    }
    setErrorMsg('');
    try {
      await onRevoke(license.id, reason);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Erro ao revogar licença.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Revogar Licença</h2>
              <p className="text-xs text-slate-400">{license.customer_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-xs text-rose-300">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <span className="font-bold block">Ação Irreversível:</span>
              A instância do ERP do cliente deixará de emitir novas faturas assim que for sincronizada ou reiniciada.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Motivo do Cancelamento / Revogação *
            </label>
            <textarea
              required
              rows={3}
              placeholder="ex: Falta de pagamento da subscrição ou pedido de rescisão contratual..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isRevoking}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              <Ban className="w-4 h-4" />
              {isRevoking ? 'A revogar...' : 'Confirmar Revogação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
