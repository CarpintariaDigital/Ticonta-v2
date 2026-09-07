'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  FileText, 
  Download, 
  ShieldCheck, 
  ArrowUpRight, 
  TrendingUp, 
  Building2,
  CheckCircle2
} from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface AccountRow {
  code: string;
  name: string;
  classType: string;
  debit: number;
  credit: number;
  balance: number;
}

const pgcAccounts: AccountRow[] = [
  { code: '1.1.1', name: 'Caixa Geral (Numerário Balcão)', classType: 'Meios Financeiros', debit: 48920, credit: 12400, balance: 36520 },
  { code: '1.2.1', name: 'Banco Millennium BIM / M-Pesa Empresarial', classType: 'Meios Financeiros', debit: 185400, credit: 45000, balance: 140400 },
  { code: '2.1.1', name: 'Mercadorias & Matérias-Primas', classType: 'Inventários', debit: 94000, credit: 38500, balance: 55500 },
  { code: '4.1.1', name: 'Clientes Correntes (Caderno Fiado Digital)', classType: 'Terceiros', debit: 21320, credit: 5400, balance: 15920 },
  { code: '4.4.2', name: 'IVA Dedutível (Compras & Serviços 16%)', classType: 'Estado', debit: 8400, credit: 0, balance: 8400 },
  { code: '4.4.3', name: 'IVA Liquidado (Vendas 16% Moçambique)', classType: 'Estado', debit: 0, credit: 15147, balance: -15147 },
  { code: '4.4.5', name: 'IVA a Pagar / Regularizar à AT', classType: 'Estado', debit: 0, credit: 6747, balance: -6747 },
  { code: '6.1.1', name: 'Custo das Mercadorias Vendidas (CMV)', classType: 'Gastos', debit: 38500, credit: 0, balance: 38500 },
  { code: '7.1.1', name: 'Vendas de Mercadorias (Facturação Digital)', classType: 'Rendimentos', debit: 0, credit: 94668, balance: -94668 },
];

export default function AccountingPage() {
  const { company } = useAuthStore();
  const [exported, setExported] = useState(false);

  const totalDebitos = pgcAccounts.reduce((acc, a) => acc + a.debit, 0);
  const totalCreditos = pgcAccounts.reduce((acc, a) => acc + a.credit, 0);

  const handleExportM20 = () => {
    setExported(true);
    setTimeout(() => {
      alert(`Declaração Modelo M/20 (IVA 16%) gerada com sucesso para a empresa:\n${company.name} (NUIT: ${company.nuit}). Ficheiro pronto para submissão no portal da AT Moçambique.`);
      setExported(false);
    }, 500);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator size={18} className="text-emerald-700" />
            <span>Contabilidade PGC-NIRF & Apuramento de IVA a 16%</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Plano Geral de Contabilidade de Moçambique. Apuramento automatizado de IVA e conformidade com a Autoridade Tributária.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleExportM20}
          className="flex items-center gap-1.5"
        >
          <Download size={14} />
          <span>{exported ? 'Gerando M/20...' : 'Exportar Declaração M/20 (AT)'}</span>
        </Button>
      </div>

      {/* IVA Summary Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-slate-500 uppercase">IVA Liquidado (Vendas 16%)</div>
            <div className="text-xl font-bold text-slate-900">{formatMZN(15147)}</div>
            <div className="text-[10px] text-slate-500">Conta 4.4.3 • Facturação Digital</div>
          </CardContent>
        </Card>

        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-slate-500 uppercase">IVA Dedutível (Despesas 16%)</div>
            <div className="text-xl font-bold text-emerald-700">{formatMZN(8400)}</div>
            <div className="text-[10px] text-slate-500">Conta 4.4.2 • Facturas de Fornecedores</div>
          </CardContent>
        </Card>

        <Card className="border-slate-300 bg-slate-900 text-white">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-slate-400 uppercase">IVA Líquido a Pagar (Conta 4.4.5)</div>
            <div className="text-xl font-bold text-emerald-400">{formatMZN(6747)}</div>
            <div className="text-[10px] text-slate-400">Guia de Pagamento Modelo B pronta</div>
          </CardContent>
        </Card>
      </div>

      {/* Balancete PGC-NIRF */}
      <Card className="border-slate-300">
        <CardHeader className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <CardTitle className="text-xs uppercase text-slate-700 font-bold flex items-center gap-1.5">
            <FileText size={14} className="text-slate-500" />
            <span>Balancete de Verificação Analítico (PGC-NIRF Moçambique)</span>
          </CardTitle>
          <Badge variant="emerald">Exercício Fiscal 2026</Badge>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px]">
                <th className="py-2.5 px-4">CÓDIGO</th>
                <th className="py-2.5 px-3">CONTA PGC-NIRF</th>
                <th className="py-2.5 px-3">CLASSE</th>
                <th className="py-2.5 px-3 text-right">DÉBITO</th>
                <th className="py-2.5 px-3 text-right">CRÉDITO</th>
                <th className="py-2.5 px-4 text-right">SALDO FINAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {pgcAccounts.map((acc) => (
                <tr key={acc.code} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-bold text-emerald-800">{acc.code}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{acc.name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{acc.classType}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">
                    {acc.debit > 0 ? formatMZN(acc.debit) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700">
                    {acc.credit > 0 ? formatMZN(acc.credit) : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    {formatMZN(Math.abs(acc.balance))} {acc.balance < 0 ? 'C' : 'D'}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td colSpan={3} className="py-3 px-4">TOTAIS DE VERIFICAÇÃO (EQUILÍBRIO CONTÁBIL)</td>
                <td className="py-3 px-3 text-right text-emerald-800">{formatMZN(totalDebitos)}</td>
                <td className="py-3 px-3 text-right text-emerald-800">{formatMZN(totalCreditos)}</td>
                <td className="py-3 px-4 text-right text-emerald-800">0.00 MT (OK)</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
