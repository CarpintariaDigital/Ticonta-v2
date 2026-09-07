'use client';

import React, { useState } from 'react';
import { 
  Egg, 
  Activity, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  Wheat
} from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface Flock {
  id: string;
  flockCode: string;
  type: 'Frango de Corte (Broiler)' | 'Poedeiras (Ovos)' | 'Patos/Outros';
  initialBirds: number;
  currentBirds: number;
  mortalityCount: number;
  mortalityRate: number;
  ageWeeks: number;
  feedConsumedKg: number;
  eggsCollectedToday?: number;
  status: 'Ativo' | 'Abatido/Vendido';
  startDate: string;
}

const initialFlocks: Flock[] = [
  { id: 'FL-01', flockCode: 'LOTE-2026/A', type: 'Frango de Corte (Broiler)', initialBirds: 1000, currentBirds: 978, mortalityCount: 22, mortalityRate: 2.2, ageWeeks: 5, feedConsumedKg: 2400, status: 'Ativo', startDate: '2026-08-01' },
  { id: 'FL-02', flockCode: 'LOTE-2026/B', type: 'Poedeiras (Ovos)', initialBirds: 500, currentBirds: 494, mortalityCount: 6, mortalityRate: 1.2, ageWeeks: 24, feedConsumedKg: 4200, eggsCollectedToday: 462, status: 'Ativo', startDate: '2026-03-15' },
];

export default function PoultryPage() {
  const [flocks, setFlocks] = useState<Flock[]>(initialFlocks);

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Egg size={18} className="text-amber-600" />
            <span>Avicultura, Produção Agropecuária & Controlo de Lotes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Mortalidade, consumo de ração, postura de ovos e custo de engorda por ave.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flocks.map((f) => (
          <Card key={f.id} className="border-slate-300">
            <CardHeader className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900">{f.flockCode}</span>
              <Badge variant="emerald">{f.type}</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Aves Vivas: <span className="font-bold text-slate-900">{f.currentBirds} / {f.initialBirds}</span></div>
                <div>Idade: <span className="font-bold text-slate-900">{f.ageWeeks} Semanas</span></div>
                <div>Mortalidade: <span className="font-bold text-red-600">{f.mortalityRate}% ({f.mortalityCount} aves)</span></div>
                <div>Ração Consumida: <span className="font-bold text-slate-900">{f.feedConsumedKg} kg</span></div>
              </div>

              {f.eggsCollectedToday && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded flex justify-between items-center">
                  <span className="text-amber-900 font-semibold">Postura de Ovos Hoje:</span>
                  <span className="font-bold text-amber-950 text-sm">{f.eggsCollectedToday} Ovos ({Math.round((f.eggsCollectedToday / f.currentBirds) * 100)}% postura)</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
