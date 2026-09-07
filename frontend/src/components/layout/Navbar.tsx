'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  UserCircle, 
  Power, 
  Clock, 
  HelpCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function Navbar() {
  const pathname = usePathname();
  const { user, company, toggleShift, logout } = useAuthStore();
  const [time, setTime] = React.useState<string>('');

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = (path: string) => {
    if (path.includes('/dashboard/pos')) return 'Terminal de Ponto de Venda (PDV Digital)';
    if (path.includes('/dashboard/informal-sales')) return 'Caderno de Fiado & Scoring de Crédito';
    if (path.includes('/dashboard/restaurant')) return 'Mesas & Comandas KDS (Cozinha)';
    if (path.includes('/dashboard/auto-services')) return 'Oficina Mecânica & Ordens de Serviço';
    if (path.includes('/dashboard/takeaway')) return 'Takeaway & Despacho de Estafetas';
    if (path.includes('/dashboard/accounting')) return 'Contabilidade PGC-NIRF & IVA 16%';
    if (path === '/dashboard') return 'Telemetria & Painel Executivo';
    return 'TiConta v2 ERP';
  };

  return (
    <header className="h-14 bg-white border-b border-slate-300 px-4 flex items-center justify-between shadow-xs">
      {/* Page Context / Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-600 rounded-sm"></div>
          <h1 className="text-sm font-bold text-slate-800 tracking-tight">
            {getPageTitle(pathname)}
          </h1>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-mono rounded">
          MODO: INDUSTRIAL v2.4
        </span>
      </div>

      {/* Operator & System Status */}
      <div className="flex items-center gap-3 font-mono text-xs">
        {/* Clock */}
        <div className="hidden lg:flex items-center gap-1 text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          <Clock size={13} className="text-slate-500" />
          <span className="font-semibold">{time || '00:00:00'}</span>
        </div>

        {/* Company Badge */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-700 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          <Building2 size={13} className="text-slate-500" />
          <span className="truncate max-w-[150px] font-medium">{company.name}</span>
          <span className="text-[10px] text-slate-400">({company.nuit})</span>
        </div>

        {/* User / Shift Button */}
        {user && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleShift}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition ${
                user.shiftActive
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-red-50 border-red-300 text-red-800'
              }`}
              title="Alternar Turno"
            >
              <UserCircle size={14} />
              <span className="font-semibold text-[11px]">{user.operatorCode}: {user.name}</span>
              <span className={`w-2 h-2 rounded-full ${user.shiftActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </button>

            <button
              onClick={logout}
              className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition"
              title="Terminar Sessão"
            >
              <Power size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
