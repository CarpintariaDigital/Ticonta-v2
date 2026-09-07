'use client';

import React, { useState } from 'react';
import { 
  PiggyBank, 
  Users, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function XitiquePage() {
  const groups = [
    {
      id: 'XT-01',
      name: 'Xitique Solidário Comerciantes Mercado Central',
      monthlyContribution: 5000,
      totalMembers: 10,
      potSize: 50000,
      currentRound: 6,
      currentBeneficiary: 'Dona Teresa (Banca 4)',
      status: 'Em Curso',
      nextPayoutDate: '2026-09-30',
    },
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PiggyBank size={18} className="text-amber-700" />
            <span>Xitique Digital & Poupança Rotativa Comunitária</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Tradição moçambicana de crédito e poupança mútua com rastreio digital de quotas, rondas e beneficiários.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((g) => (
          <Card key={g.id} className="border-slate-300">
            <CardHeader className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900">{g.name}</span>
              <Badge variant="amber">{g.status}</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded text-slate-800 space-y-1">
                <div className="text-[11px] text-amber-900 font-semibold">Beneficiário da Ronda Atual ({g.currentRound}/{g.totalMembers}):</div>
                <div className="text-sm font-bold text-amber-950">{g.currentBeneficiary}</div>
                <div className="text-base font-bold text-emerald-800 pt-1">Bolo a Receber: {formatMZN(g.potSize)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>Quota Mensal: <span className="font-bold text-slate-900">{formatMZN(g.monthlyContribution)}</span></div>
                <div>Próximo Pagamento: <span className="font-bold text-slate-900">{g.nextPayoutDate}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
