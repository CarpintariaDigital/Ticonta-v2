'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  BookOpen, 
  UtensilsCrossed, 
  Wrench, 
  Bike, 
  Calculator, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const navigationItems = [
  {
    category: 'OPERAÇÕES PRINCIPAIS',
    items: [
      { name: 'Dashboard Geral', href: '/dashboard', icon: LayoutDashboard, badge: 'Live' },
      { name: 'Terminal POS (PDV)', href: '/dashboard/pos', icon: ShoppingCart, badge: 'Zero Papel' },
      { name: 'Caderno de Fiado', href: '/dashboard/informal-sales', icon: BookOpen, badge: 'Score AI' },
    ],
  },
  {
    category: 'SETORES ESPECÍFICOS',
    items: [
      { name: 'Restaurante & KDS', href: '/dashboard/restaurant', icon: UtensilsCrossed, badge: 'Mesas' },
      { name: 'Oficina Mecânica', href: '/dashboard/auto-services', icon: Wrench, badge: 'OS' },
      { name: 'Takeaway & Entregas', href: '/dashboard/takeaway', icon: Bike, badge: 'SMS' },
    ],
  },
  {
    category: 'GESTÃO & FISCALIDADE',
    items: [
      { name: 'Contabilidade PGC-NIRF', href: '/dashboard/accounting', icon: Calculator, badge: '16% IVA' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-950">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-mono font-bold text-white shadow-md shadow-emerald-950">
            TC
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-white flex items-center gap-1">
              <span>TiConta</span>
              <span className="text-emerald-400 font-mono text-xs">v2</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">ERP & FATURAÇÃO MZ</p>
          </div>
        </Link>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navigationItems.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
              {section.category}
            </h3>
            <nav className="space-y-1 pt-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={16}
                        className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
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

      {/* Bottom Compliance & Carpintaria Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 font-mono text-[11px] text-slate-400">
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <ShieldCheck size={14} />
          <span className="font-semibold text-[10px]">AUTORIDADE TRIBUTÁRIA MZ</span>
        </div>
        <div className="text-[10px] text-slate-500">
          Dec-Lei 1/2018 | IVA 16% Ativo
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span>Carpintaria Digital</span>
          <span className="text-emerald-500 font-semibold">Engine v2.4</span>
        </div>
      </div>
    </aside>
  );
}
