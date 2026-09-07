'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  BookOpen, 
  Users,
  UtensilsCrossed, 
  Wrench, 
  Bike, 
  Factory,
  Egg,
  FolderKanban,
  Users2,
  PiggyBank,
  BarChart3,
  Calculator, 
  KeyRound,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useLicenseStore } from '@/store/licenseStore';

const navigationItems = [
  {
    category: 'OPERAÇÕES PRINCIPAIS',
    items: [
      { name: 'Dashboard Geral', href: '/dashboard', icon: LayoutDashboard, badge: 'Live' },
      { name: 'Terminal POS (PDV)', href: '/dashboard/pos', icon: ShoppingCart, badge: 'Zero Papel' },
      { name: 'Caderno de Fiado', href: '/dashboard/informal-sales', icon: BookOpen, badge: 'Score AI' },
      { name: 'CRM & Clientes', href: '/dashboard/crm', icon: Users, badge: 'WhatsApp' },
    ],
  },
  {
    category: 'SETORES ESPECÍFICOS',
    items: [
      { name: 'Restaurante & KDS', href: '/dashboard/restaurant', icon: UtensilsCrossed, badge: 'Mesas' },
      { name: 'Oficina Mecânica', href: '/dashboard/auto-services', icon: Wrench, badge: 'OS' },
      { name: 'Takeaway & Despacho', href: '/dashboard/takeaway', icon: Bike, badge: 'Delivery/Balcão' },
      { name: 'Produção & Fabricação', href: '/dashboard/manufacturing', icon: Factory, badge: 'Custos' },
      { name: 'Avicultura & Agro', href: '/dashboard/poultry', icon: Egg, badge: 'Lotes' },
      { name: 'Projetos & Obras', href: '/dashboard/projects', icon: FolderKanban, badge: 'Orçamentos' },
    ],
  },
  {
    category: 'GESTÃO, RH & FISCALIDADE',
    items: [
      { name: 'Contabilidade PGC-NIRF', href: '/dashboard/accounting', icon: Calculator, badge: '16% IVA' },
      { name: 'RH & Folha de Salários', href: '/dashboard/hr', icon: Users2, badge: 'INSS' },
      { name: 'Xitique Digital', href: '/dashboard/xitique', icon: PiggyBank, badge: 'Poupança' },
      { name: 'Relatórios Gerenciais', href: '/dashboard/reports', icon: BarChart3, badge: 'Excel/PDF' },
      { name: 'Licença Criptográfica', href: '/dashboard/license', icon: KeyRound, badge: 'Ativa' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { license } = useLicenseStore();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 select-none">
      {/* Brand Header com Logotipo Oficial */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-950">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo-ticonta.png"
            alt="TiConta v2"
            className="h-8 w-8 object-contain rounded bg-white p-0.5"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/icon.png';
            }}
          />
          <div>
            <div className="font-bold text-sm tracking-wide text-white flex items-center gap-1 font-mono">
              <span>TiConta</span>
              <span className="text-emerald-400 text-xs">v2</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">CARPINTARIA DIGITAL</p>
          </div>
        </Link>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {navigationItems.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
              {section.category}
            </h3>
            <nav className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        size={15}
                        className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded truncate ${
                          isActive
                            ? 'bg-emerald-700 text-emerald-100'
                            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom License & Compliance Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 font-mono text-xs">
        <Link
          href="/dashboard/license"
          className="p-2 bg-slate-900 border border-slate-800 rounded-md block hover:border-emerald-500 transition group"
        >
          <div className="flex items-center justify-between text-[11px] mb-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck size={13} />
              <span>PLANO {license.plan.toUpperCase()}</span>
            </div>
            <span className="text-[10px] text-slate-400">{license.daysRemaining}d</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Licença Criptográfica</span>
            <span className="text-emerald-400 group-hover:translate-x-0.5 transition">→</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
