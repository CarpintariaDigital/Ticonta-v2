'use client';

import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  DollarSign
} from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function ProjectsPage() {
  const projects = [
    { id: 'PRJ-01', title: 'Construção Pavilhão Industrial Matola', client: 'Agro-Matola Lda', budget: 450000, spent: 312000, progress: 70, status: 'Em Execução', deadline: '2026-11-30' },
    { id: 'PRJ-02', title: 'Remodelação & Mobiliário Escritório Maputo', client: 'Advogados & Associados', budget: 180000, spent: 175000, progress: 95, status: 'Quase Concluído', deadline: '2026-09-20' },
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderKanban size={18} className="text-purple-700" />
            <span>Gestão de Projetos, Obras & Orçamentação Real</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Acompanhamento de orçamento previsto vs realizado, prazos e marcos de execução.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Card key={p.id} className="border-slate-300">
            <CardHeader className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900">{p.id}</span>
              <Badge variant="purple">{p.status}</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                <div className="text-slate-500 text-[11px]">Cliente: {p.client} • Prazo: {p.deadline}</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>Progresso da Obra:</span>
                  <span className="font-bold">{p.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between text-[11px]">
                <div>Orçamento: <span className="font-bold text-slate-900">{formatMZN(p.budget)}</span></div>
                <div>Gasto Real: <span className="font-bold text-purple-900">{formatMZN(p.spent)}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
