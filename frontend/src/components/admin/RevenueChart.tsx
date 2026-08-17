'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { AdminStatsResponse } from '@/services/admin_licensing';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface RevenueChartProps {
  stats?: AdminStatsResponse;
  isLoading?: boolean;
}

const PLAN_COLORS: Record<string, string> = {
  basic: '#38bdf8', // Sky 400
  professional: '#818cf8', // Indigo 400
  complete: '#34d399', // Emerald 400
  enterprise: '#fbbf24', // Amber 400
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-72 bg-slate-800/50 rounded-2xl border border-slate-700/60 animate-pulse" />
        <div className="h-72 bg-slate-800/50 rounded-2xl border border-slate-700/60 animate-pulse" />
      </div>
    );
  }

  const trendData = stats.revenue_trend || [
    { month: 'Mar', revenue_mzn: 45000, licenses_count: 12 },
    { month: 'Abr', revenue_mzn: 62000, licenses_count: 18 },
    { month: 'Mai', revenue_mzn: 78000, licenses_count: 24 },
    { month: 'Jun', revenue_mzn: 95000, licenses_count: 29 },
    { month: 'Jul', revenue_mzn: 110000, licenses_count: 35 },
    { month: 'Ago', revenue_mzn: 135000, licenses_count: 42 },
  ];

  const planData = Object.entries(stats.by_plan || {}).map(([planKey, data]) => ({
    name: planKey.toUpperCase(),
    value: data.count,
    revenue: data.revenue_mzn,
    color: PLAN_COLORS[planKey.toLowerCase()] || '#94a3b8',
  }));

  const formatCurrency = (val: number) => {
    return `${(val / 1000).toFixed(0)}k MT`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Gráfico de Tendência de Faturação */}
      <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Tendência de Receita Mensal (MZN)
            </h3>
            <p className="text-xs text-slate-400">Evolução do faturamento dos últimos 6 meses</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            +24.5% este mês
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatCurrency} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${Number(val).toLocaleString('pt-MZ')} MT`, 'Receita']}
              />
              <Bar dataKey="revenue_mzn" radius={[6, 6, 0, 0]}>
                {trendData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === trendData.length - 1 ? '#10b981' : '#38bdf8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Distribuição de Licenças por Plano */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-400" />
            Licenças por Plano
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-2">Proporção de assinantes por categoria</p>

        <div className="h-52 w-full">
          {planData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planData.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val} licenças (${Number(item.payload.revenue).toLocaleString('pt-MZ')} MT/ano)`,
                    name,
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-slate-500">
              Nenhuma licença registada
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
