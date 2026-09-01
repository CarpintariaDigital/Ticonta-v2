'use client';

import React from 'react';
import { KeyRound, CheckCircle2, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { AdminStatsResponse } from '@/services/admin_licensing';

interface StatsCardsProps {
  stats?: AdminStatsResponse;
  isLoading?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-800/50 rounded-2xl border border-zinc-200/60 animate-pulse" />
        ))}
      </div>
    );
  }

  const formatMZN = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const cards = [
    {
      title: 'Total de Licenças',
      value: stats.total_licenses,
      subtext: `${stats.active_licenses} ativas • ${stats.expired_licenses} expiradas`,
      icon: KeyRound,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
      badge: `${stats.revoked_licenses} revogadas`,
      badgeColor: 'bg-slate-700/50 text-zinc-700',
    },
    {
      title: 'Licenças Ativas',
      value: stats.active_licenses,
      subtext: 'Instâncias em operação regular',
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      badge: '98% uptime',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      title: 'Receita Anual Estimada',
      value: formatMZN(stats.total_estimated_revenue_mzn),
      subtext: `Média de ${formatMZN(stats.average_license_value_mzn)} / cliente`,
      icon: DollarSign,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      badge: '+18.4% YoY',
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      title: 'A Expirar (Próximos 30d)',
      value: stats.upcoming_expirations_30_days,
      subtext: 'Requerem contacto para renovação',
      icon: AlertTriangle,
      color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
      badge: stats.upcoming_expirations_30_days > 0 ? 'Ação necessária' : 'Regularizado',
      badgeColor: stats.upcoming_expirations_30_days > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700/50 text-zinc-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-zinc-200 shadow-lg hover:border-zinc-200 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-zinc-500">{card.title}</span>
              <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-1">
              <div className="text-2xl font-bold text-zinc-900 tracking-tight">{card.value}</div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            <p className="text-xs text-zinc-500 font-normal">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
