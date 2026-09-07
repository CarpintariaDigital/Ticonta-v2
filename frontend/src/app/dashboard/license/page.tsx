'use client';

import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Smartphone, 
  Building2, 
  Clock, 
  Lock,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useLicenseStore } from '@/store/licenseStore';
import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export default function LicensePage() {
  const { license, activateLicense } = useLicenseStore();
  const { company } = useAuthStore();
  const [keyInput, setKeyInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = activateLicense(keyInput);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setKeyInput('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <KeyRound size={18} className="text-emerald-700" />
            <span>Sistema de Licenciamento Criptográfico TiConta v2</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Assinatura HMAC-SHA256 e validação autônoma em modo Offline-First com suporte a dispositivos autorizados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="emerald" className="font-bold text-xs py-1 px-3">
            PLANO: {license.plan.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* License Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-slate-500 uppercase">Estado da Licença</div>
            <div className="text-xl font-bold text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck size={18} />
              <span>{license.status}</span>
            </div>
            <div className="text-[10px] text-slate-500">HMAC-SHA256 Válido</div>
          </CardContent>
        </Card>

        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-slate-500 uppercase">Tempo Restante</div>
            <div className="text-xl font-bold text-slate-900">{license.daysRemaining} Dias</div>
            <div className="text-[10px] text-slate-500">Expira em: {license.expiresAt}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-slate-500 uppercase">Dispositivos Vinculados</div>
            <div className="text-xl font-bold text-slate-900">
              {license.activeDevices} / {license.maxDevices} Dispositivos
            </div>
            <div className="text-[10px] text-slate-500">PDVs e Terminais autorizados</div>
          </CardContent>
        </Card>

        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-slate-500 uppercase">Tolerância Offline</div>
            <div className="text-xl font-bold text-emerald-700">{license.offlineGraceDays} Dias</div>
            <div className="text-[10px] text-slate-500">Sem necessidade de internet</div>
          </CardContent>
        </Card>
      </div>

      {/* Activation & Certificate Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Activation Form */}
        <Card className="border-slate-300">
          <CardHeader className="p-3 bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-xs uppercase text-slate-800 font-bold flex items-center gap-1.5">
              <Lock size={14} className="text-slate-600" />
              <span>Ativar / Renovar Chave de Licença</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <form onSubmit={handleActivate} className="space-y-3">
              <Input
                label="Chave Criptográfica de Ativação (Formato: TC-PLAN-ANO-XXXX-SHA256)"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Ex: TC-PRO-2026-MZ-8942-SHA256"
                className="font-mono text-xs"
                required
              />

              {feedback && (
                <div
                  className={`p-2.5 rounded border text-xs flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-red-50 border-red-300 text-red-800'
                  }`}
                >
                  {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{feedback.message}</span>
                </div>
              )}

              <Button variant="primary" type="submit" className="w-full">
                Validar e Aplicar Chave de Licença
              </Button>
            </form>

            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
              <p>Precisa de uma nova chave ou extensão para filiais?</p>
              <a
                href="https://wa.me/258840000000?text=Ol%C3%A1%20Carpintaria%20Digital,%20gostaria%20de%20solicitar%20uma%20chave%20de%20licen%C3%A7a%20TiConta%20v2"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Contactar Suporte Comercial da Carpintaria Digital</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Card */}
        <Card className="border-slate-300 bg-slate-900 text-white">
          <CardHeader className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
            <CardTitle className="text-xs uppercase text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>Certificado de Licença de Software</span>
            </CardTitle>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/40">
              OFFLINE READY
            </Badge>
          </CardHeader>

          <CardContent className="p-4 space-y-3 text-xs">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <div className="text-[10px] text-slate-400 uppercase">Titular da Licença:</div>
              <div className="font-bold text-white text-sm">{company.name}</div>
              <div className="text-[11px] text-slate-400">NUIT: {company.nuit} • {company.address}</div>
            </div>

            <div className="space-y-1 border-b border-slate-800 pb-3">
              <div className="text-[10px] text-slate-400 uppercase">Chave de Ativação Ativa:</div>
              <div className="font-mono text-emerald-300 text-xs break-all bg-slate-950 p-2 rounded border border-slate-800">
                {license.key}
              </div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Assinatura Digital do Motor:</span>
              <span className="font-mono text-slate-300">{license.signature}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
