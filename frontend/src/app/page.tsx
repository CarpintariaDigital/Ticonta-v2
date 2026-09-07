'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Cpu, 
  Smartphone, 
  Layers, 
  ArrowRight, 
  Terminal, 
  Building2,
  UtensilsCrossed,
  Wrench,
  Bike,
  Calculator,
  BookOpen,
  WifiOff,
  Database,
  CheckCircle2,
  Lock,
  ChevronRight,
  Activity,
  FileCheck,
  Send
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-emerald-600 selection:text-white">
      {/* Top Industrial Telemetry Strip */}
      <div className="brushed-steel-header px-4 py-1.5 border-b border-slate-300 text-xs font-mono text-slate-700 flex flex-wrap items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>TICONTA v2 KERNEL INDUSTRIAL</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-600 hidden sm:inline text-[11px]">
            AUTORIDADE TRIBUTÁRIA MZ: DEC-LEI 1/2018 (IVA 16%)
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-600 font-medium">MODO: WORKSTATION LOCAL</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-800 font-bold">FATURAÇÃO 100% DIGITAL (ZERO PAPEL)</span>
        </div>
      </div>

      {/* Main Technical Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-300 px-6 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm shadow-sm">
            TC
          </div>
          <div>
            <div className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5 font-mono">
              <span>TiConta</span>
              <span className="text-emerald-700 text-xs bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">v2 ERP</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">CARPINTARIA DIGITAL WORKSTATION</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" size="sm" className="font-mono text-xs">
              Terminal Operador
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm" className="font-mono text-xs flex items-center gap-1.5">
              <span>{isAuthenticated ? 'Abrir Console' : 'Aceder Workstation'}</span>
              <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Workstation Section */}
      <section className="workstation-grid py-14 px-6 border-b border-slate-300 bg-slate-100/60">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-200 border border-slate-300 text-xs font-mono text-slate-800">
            <Cpu size={14} className="text-emerald-700" />
            <span>ESTRUTURA DE ALUMÍNIO ANODIZADO & AÇO ESCOVADO</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-mono">
            Workstation Industrial de Gestão & <br className="hidden sm:inline" />
            <span className="text-emerald-700">Faturação 100% Digital em Moçambique</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-600 leading-relaxed">
            Elimine custos e dependência de impressoras e bobinas de papel. O <strong>TiConta v2</strong> emite e envia faturas certificadas via <strong>WhatsApp e SMS</strong> com conformidade fiscal do <strong>IVA a 16%</strong>, plano de contas <strong>PGC-NIRF</strong> e arquitetura <strong>Offline-First</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard/pos">
              <Button variant="primary" size="lg" className="font-mono text-xs sm:text-sm flex items-center gap-2">
                <Terminal size={16} />
                <span>Iniciar Terminal POS Digital</span>
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="secondary" size="lg" className="font-mono text-xs sm:text-sm flex items-center gap-2">
                <Layers size={16} />
                <span>Explorar Workstations</span>
              </Button>
            </Link>
          </div>

          {/* Quick Technical Telemetry Gauges */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto font-mono text-left">
            <div className="panel-bevel p-3 rounded-md bg-white">
              <div className="text-[10px] text-slate-500 uppercase">Emissão Digital</div>
              <div className="text-lg font-bold text-slate-900">WhatsApp & SMS</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Zero Papel / Zero Bobina</div>
            </div>

            <div className="panel-bevel p-3 rounded-md bg-white">
              <div className="text-[10px] text-slate-500 uppercase">Regime Tributário</div>
              <div className="text-lg font-bold text-slate-900">IVA 16%</div>
              <div className="text-[10px] text-slate-600">Decreto-Lei 1/2018 MZ</div>
            </div>

            <div className="panel-bevel p-3 rounded-md bg-white">
              <div className="text-[10px] text-slate-500 uppercase">Operação Local</div>
              <div className="text-lg font-bold text-slate-900">Offline-First</div>
              <div className="text-[10px] text-emerald-700 font-semibold">IndexedDB de Alta Velocidade</div>
            </div>

            <div className="panel-bevel p-3 rounded-md bg-white">
              <div className="text-[10px] text-slate-500 uppercase">Contabilidade</div>
              <div className="text-lg font-bold text-slate-900">PGC-NIRF</div>
              <div className="text-[10px] text-slate-600">Declaração M/20 Pronta</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Modular Workstations */}
      <section className="py-12 px-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <Badge variant="emerald" className="mb-1">ECOSSISTEMA MODULAR</Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-mono">
              Workstations Especializadas para Pequenas & Médias Empresas
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Ambiente unificado para balcão, fiado, cozinha, mecânica e entregas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Card Principal 1: POS & Faturação Digital (Ocupa 2 Colunas no Grid) */}
          <div className="md:col-span-2 lg:col-span-2 panel-bevel p-6 rounded-lg flex flex-col justify-between bg-white border-2 border-slate-300 relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Smartphone size={20} />
                </div>
                <Badge variant="emerald" className="font-mono text-[10px]">
                  CARD PRINCIPAL • FATURAÇÃO DIGITAL
                </Badge>
              </div>

              <h3 className="text-lg font-bold text-slate-900 font-mono">
                Ponto de Venda (POS) & Disparo Instantâneo WhatsApp/SMS
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Emita Facturas-Recibo certificadas em menos de 3 segundos com teclado de operador tátil e leitor de código de barras. O cliente recebe o documento com QR Code de autenticidade fiscal diretamente no telemóvel, eliminando 100% dos custos com bobinas térmicas.
              </p>

              <div className="pt-2 flex flex-wrap gap-2 font-mono text-[11px] text-slate-700">
                <span className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded">IVA 16% Automatizado</span>
                <span className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded">NUIT 9 Dígitos AT</span>
                <span className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded">M-Pesa & e-Mola</span>
              </div>
            </div>

            <div className="pt-5">
              <Link href="/dashboard/pos">
                <Button variant="primary" className="w-full justify-between font-mono text-xs">
                  <span>Abrir Terminal de Ponto de Venda</span>
                  <ChevronRight size={15} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: Caderno de Fiado & Scoring AI */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <BookOpen size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Caderno de Fiado & Score de Crédito
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Substituição digital do caderno de papel. Cálculo do score de confiabilidade do cliente (0 a 100) e disparo de cobrança amigável via WhatsApp.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/informal-sales">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Gerir Devedores</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 3: Restaurante & KDS Cozinha */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-cyan-700 text-white flex items-center justify-center shadow-xs">
                <UtensilsCrossed size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Mesas & KDS Cozinha
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Workstation para monitorização de mesas e comanda digital em tempo real na cozinha, com cronómetro por prato e fecho digital sem papel.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/restaurant">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Ver Mesas & KDS</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 4: Oficina Mecânica & Ordens de Serviço */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-slate-800 text-emerald-400 flex items-center justify-center shadow-xs">
                <Wrench size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Oficina Mecânica & OS
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Checklist veicular de entrada, orçamentos de peças/mão-de-obra e envio de relatório de diagnóstico detalhado por WhatsApp.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/auto-services">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Ordens de Serviço</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 5: Takeaway & Despacho de Estafetas */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-purple-700 text-white flex items-center justify-center shadow-xs">
                <Bike size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Takeaway & Estafetas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Fila de pedidos para entrega rápida, atribuição de motoqueiros e notificação instantânea por SMS ao cliente no momento da saída.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/takeaway">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Despacho Takeaway</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 6: Contabilidade PGC-NIRF & IVA 16% (Ocupa 2 Colunas) */}
          <div className="md:col-span-2 panel-bevel p-5 rounded-lg flex flex-col justify-between bg-slate-900 text-white border border-slate-800">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-md bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <Calculator size={18} />
                </div>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/40 font-mono text-[10px]">
                  CONFORMIDADE FISCAL MOÇAMBIQUE
                </Badge>
              </div>
              <h3 className="text-base font-bold text-white font-mono">
                Contabilidade PGC-NIRF & Apuramento do IVA a 16%
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Balancete de verificação analítico em tempo real, saldo líquido do IVA (Conta 4.4.3 vs 4.4.2 = Conta 4.4.5) e exportação da declaração modelo M/20 pronta para a Autoridade Tributária.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/accounting">
                <Button variant="primary" size="sm" className="w-full justify-between font-mono text-xs">
                  <span>Aceder Módulo Contábil PGC-NIRF</span>
                  <ChevronRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Footer */}
      <footer className="mt-auto border-t border-slate-300 bg-white py-6 px-6 text-xs text-slate-600 font-mono select-none">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-900 text-emerald-400 rounded flex items-center justify-center text-[10px] font-bold">
              TC
            </div>
            <span>TiConta v2 ERP — Desenvolvido pela <strong>Carpintaria Digital</strong></span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Maputo / Matola, Moçambique</span>
            <span>•</span>
            <span>Zero Bobina / 100% Digital</span>
            <span>•</span>
            <span>Decreto-Lei 1/2018</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
