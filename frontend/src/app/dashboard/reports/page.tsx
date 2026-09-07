'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  DollarSign,
  PieChart
} from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ReportsPage() {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-700" />
            <span>Relatórios Gerenciais, Vendas & Fluxo de Caixa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Métricas de desempenho, faturamento por categoria e exportação para Excel/PDF.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => alert('Exportando relatório gerencial mensal em Excel/PDF...')} className="flex items-center gap-1.5">
          <Download size={14} />
          <span>Exportar Relatório Mensal</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-slate-500 uppercase">Faturação Acumulada Mês</div>
            <div className="text-2xl font-bold text-slate-900">{formatMZN(384200)}</div>
            <div className="text-[10px] text-emerald-700 font-semibold">+22.4% vs mês anterior</div>
          </CardContent>
        </Card>

        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-slate-500 uppercase">Lucro Bruto Estimado</div>
            <div className="text-2xl font-bold text-emerald-700">{formatMZN(145800)}</div>
            <div className="text-[10px] text-slate-500">Margem média de 37.9%</div>
          </CardContent>
        </Card>

        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-slate-500 uppercase">Ticket Médio por Venda</div>
            <div className="text-2xl font-bold text-slate-900">{formatMZN(890)}</div>
            <div className="text-[10px] text-slate-500">432 transações digitais</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
