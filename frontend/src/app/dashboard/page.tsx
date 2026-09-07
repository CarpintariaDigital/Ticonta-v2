'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShoppingCart, 
  BookOpen, 
  UtensilsCrossed, 
  Wrench, 
  Bike, 
  Calculator, 
  ArrowUpRight, 
  ShieldCheck, 
  Smartphone, 
  Clock, 
  FileText,
  AlertTriangle,
  CheckCircle2,
  Users
} from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePosStore } from '@/store/posStore';
import { useFiadoStore } from '@/store/fiadoStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useAutoStore } from '@/store/autoStore';
import { useTakeawayStore } from '@/store/takeawayStore';

export default function DashboardOverview() {
  const { products } = usePosStore();
  const { debtors } = useFiadoStore();
  const { tables, kdsOrders } = useRestaurantStore();
  const { orders: autoOrders } = useAutoStore();
  const { orders: takeawayOrders } = useTakeawayStore();

  const totalFiadoPendente = debtors.reduce((acc, d) => acc + d.balance, 0);
  const totalMesasAtivas = tables.filter((t) => t.status === 'Ocupada').length;
  const totalOsAndamento = autoOrders.filter((o) => o.status === 'Em Execução' || o.status === 'Diagnóstico').length;
  const totalEntregasTrânsito = takeawayOrders.filter((o) => o.status === 'Em Trânsito').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / System Telemetry Summary */}
      <div className="panel-bevel p-4 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-base font-bold font-mono tracking-tight text-white">
              SISTEMA OPERACIONAL ATIVO — MAPUTO REGIONAL NODE
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Faturação 100% digital ativa. Zero despesas com bobinas térmicas. IVA a 16% apurado em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/pos">
            <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md">
              <ShoppingCart size={14} />
              <span>Abrir Caixa PDV</span>
            </Button>
          </Link>
          <Link href="/dashboard/accounting">
            <Button variant="secondary" size="sm" className="flex items-center gap-1.5 bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700">
              <Calculator size={14} />
              <span>Relatório PGC-NIRF</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Card 1: Vendas Hoje */}
        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>FATURAÇÃO DIGITAL HOJE</span>
              <Smartphone size={15} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatMZN(48920)}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <TrendingUp size={12} />
              <span>+18.4% vs dia anterior (Zero Papel)</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: IVA 16% Apurado */}
        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>IVA 16% RETIDO (CONTA 4.4.3)</span>
              <ShieldCheck size={15} className="text-slate-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatMZN(6747.58)}
            </div>
            <div className="text-[11px] text-slate-600">
              Autoridade Tributária MZ Ready
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Fiado em Aberto */}
        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>FIADO TOTAL EM ABERTO</span>
              <AlertTriangle size={15} className="text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatMZN(totalFiadoPendente)}
            </div>
            <div className="text-[11px] text-amber-700 font-semibold">
              {debtors.length} clientes em registo digital
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Operações Vivas */}
        <Card className="border-slate-300">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>WORKSTATIONS ATIVAS</span>
              <Users size={15} className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {totalMesasAtivas + totalOsAndamento + totalEntregasTrânsito} Ativas
            </div>
            <div className="text-[11px] text-slate-600">
              {totalMesasAtivas} Mesas • {totalOsAndamento} OS • {totalEntregasTrânsito} Entregas
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Acesso aos Módulos Operacionais */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
          Módulos de Execução & Workstations de Trabalho
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Módulo POS */}
          <Link href="/dashboard/pos" className="block group">
            <Card className="h-full border-slate-300 hover:border-emerald-500 transition-all hover:shadow-md bg-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <ShoppingCart size={16} />
                  </div>
                  <Badge variant="emerald">PDV Digital</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    Terminal Ponto de Venda
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Grelha tátil, teclado de operador, cálculo de 16% IVA e envio WhatsApp/SMS em 1 clique.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                  <span>Abrir Caixa</span>
                  <ArrowUpRight size={13} />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Módulo Fiado */}
          <Link href="/dashboard/informal-sales" className="block group">
            <Card className="h-full border-slate-300 hover:border-amber-500 transition-all hover:shadow-md bg-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <BookOpen size={16} />
                  </div>
                  <Badge variant="amber">Score AI</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition">
                    Caderno de Fiado & Cobrança
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Gestão de saldos devedores, score de crédito do cliente e envio de lembretes automáticos.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-amber-700 font-semibold flex items-center gap-1 pt-1">
                  <span>Ver Devedores ({debtors.length})</span>
                  <ArrowUpRight size={13} />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Módulo Restaurante */}
          <Link href="/dashboard/restaurant" className="block group">
            <Card className="h-full border-slate-300 hover:border-cyan-500 transition-all hover:shadow-md bg-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                    <UtensilsCrossed size={16} />
                  </div>
                  <Badge variant="cyan">{totalMesasAtivas} Mesas Ocupadas</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition">
                    Mesas & KDS Cozinha
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Monitor de mesas em tempo real, pedidos com cronómetro de cozinha e fecho digital.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-cyan-700 font-semibold flex items-center gap-1 pt-1">
                  <span>Ver KDS & Mesas</span>
                  <ArrowUpRight size={13} />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Módulo Oficina */}
          <Link href="/dashboard/auto-services" className="block group">
            <Card className="h-full border-slate-300 hover:border-slate-600 transition-all hover:shadow-md bg-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded bg-slate-200 text-slate-800 flex items-center justify-center font-bold">
                    <Wrench size={16} />
                  </div>
                  <Badge variant="outline">{totalOsAndamento} em Curso</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-700 transition">
                    Oficina Mecânica & OS
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Checklist de inspeção veicular, alocação de mecânico e relatório WhatsApp com orçamento.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-slate-700 font-semibold flex items-center gap-1 pt-1">
                  <span>Gerir Ordens de Serviço</span>
                  <ArrowUpRight size={13} />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Módulo Takeaway */}
          <Link href="/dashboard/takeaway" className="block group">
            <Card className="h-full border-slate-300 hover:border-purple-500 transition-all hover:shadow-md bg-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <Bike size={16} />
                  </div>
                  <Badge variant="purple">{totalEntregasTrânsito} em Trânsito</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition">
                    Takeaway & Despacho
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Fila de encomendas, atribuição de estafeta de moto e disparo de SMS ao cliente.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-purple-700 font-semibold flex items-center gap-1 pt-1">
                  <span>Painel de Despacho</span>
                  <ArrowUpRight size={13} />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Módulo Contabilidade */}
          <Link href="/dashboard/accounting" className="block group">
            <Card className="h-full border-slate-300 hover:border-emerald-600 transition-all hover:shadow-md bg-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                    <Calculator size={16} />
                  </div>
                  <Badge variant="emerald">PGC-NIRF</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    Contabilidade PGC-NIRF & IVA
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Balancete de verificação, apuramento de IVA a pagar e exportação da declaração M/20.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                  <span>Aceder Balancete</span>
                  <ArrowUpRight size={13} />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
