'use client';

import React, { useState } from 'react';
import { 
  Users2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  DollarSign,
  FileText
} from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function HRPage() {
  const employees = [
    { id: 'EMP-01', name: 'Carlos Manhiça', role: 'Mestre Marceneiro', baseSalary: 28500, inss: 855, irps: 2280, netSalary: 25365, attendance: '100% Presente' },
    { id: 'EMP-02', name: 'Beto Muthemba', role: 'Chefe de Sala & Garçom', baseSalary: 18000, inss: 540, irps: 900, netSalary: 16560, attendance: '98% Presente' },
    { id: 'EMP-03', name: 'Zacarias Sitoe', role: 'Operador de Máquinas', baseSalary: 22000, inss: 660, irps: 1320, netSalary: 20020, attendance: '100% Presente' },
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 size={18} className="text-emerald-700" />
            <span>Recursos Humanos, Folha de Salários & Retenções INSS/IRPS</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Cálculo de salários conforme a Lei do Trabalho de Moçambique com apuramento de INSS (3% trabalhador + 4% empresa) e IRPS.
          </p>
        </div>
      </div>

      <Card className="border-slate-300">
        <CardHeader className="p-3 bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-xs text-slate-900 font-bold">Quadro de Pessoal Ativo</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px]">
                <th className="py-2.5 px-4">FUNCIONÁRIO</th>
                <th className="py-2.5 px-3">CARGO</th>
                <th className="py-2.5 px-3 text-right">SALÁRIO BASE</th>
                <th className="py-2.5 px-3 text-right">INSS (3%)</th>
                <th className="py-2.5 px-3 text-right">IRPS</th>
                <th className="py-2.5 px-4 text-right">LÍQUIDO A PAGAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{e.name}</td>
                  <td className="py-3 px-3 text-slate-600">{e.role}</td>
                  <td className="py-3 px-3 text-right">{formatMZN(e.baseSalary)}</td>
                  <td className="py-3 px-3 text-right text-slate-500">{formatMZN(e.inss)}</td>
                  <td className="py-3 px-3 text-right text-slate-500">{formatMZN(e.irps)}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-800">{formatMZN(e.netSalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
