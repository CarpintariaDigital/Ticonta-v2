'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLicenseStore } from '@/store/licenseStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ModuleGuardProps {
  moduleId: string;
  moduleName: string;
  moduleDescription?: string;
  children: React.ReactNode;
}

export function ModuleGuard({ moduleId, moduleName, moduleDescription, children }: ModuleGuardProps) {
  const { isModuleAllowed, license } = useLicenseStore();

  const isAllowed = isModuleAllowed(moduleId);

  if (isAllowed) {
    return <>{children}</>;
  }

  const whatsappMessage = encodeURIComponent(
    `Olá Carpintaria Digital! Gostaria de ativar o módulo *${moduleName}* no meu TiConta ERP v2 (Licença: ${license.key}). Poderiam disponibilizar a ativação por +300 MT/mês?`
  );

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 font-mono text-xs">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-300 shadow-xl p-6 sm:p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <Lock size={32} />
        </div>

        <div className="space-y-2">
          <Badge variant="warning" className="uppercase font-bold tracking-wider">
            Módulo Opcional Não Contratado
          </Badge>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {moduleName}
          </h2>
          <p className="text-slate-600 font-sans text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            {moduleDescription || 'Este recurso especializado não está ativo no seu pacote atual. O Dashboard e o Terminal POS continuam 100% ativos e disponíveis para o seu comércio.'}
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-left">
          <div className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-600" />
            <span>Ativação Direta & Acessível:</span>
          </div>
          <ul className="space-y-1.5 text-slate-600 font-sans text-xs">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span>Adicione este módulo à sua subscrição a partir de <strong>300 MT / mês</strong>.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span>Sem necessidade de reinstalar a aplicação (ativação remota imediata).</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={`https://wa.me/258840000000?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 block"
          >
            <Button variant="primary" size="md" className="w-full font-mono text-xs flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white">
              <MessageSquare size={14} />
              <span>Ativar via WhatsApp (300 MT)</span>
            </Button>
          </a>

          <Link href="/dashboard/license" className="sm:w-auto">
            <Button variant="outline" size="md" className="w-full font-mono text-xs flex items-center justify-center gap-1.5">
              <span>Ver Licença</span>
              <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
