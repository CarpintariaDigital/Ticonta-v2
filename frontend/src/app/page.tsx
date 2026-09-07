'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Cpu, 
  Smartphone, 
  FileText, 
  Layers, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Terminal, 
  Database,
  Building2,
  UtensilsCrossed,
  Wrench,
  Bike,
  Calculator,
  QrCode,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Telemetry Header */}
      <div className="brushed-steel-header px-4 py-2 border-b border-slate-300 text-xs font-mono text-slate-700 flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>TICONTA INDUSTRIAL KERNEL v2.4</span>
          </div>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 hidden sm:inline">AUTORIDADE TRIBUTÁRIA MZ: DEC-LEI 1/2018</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-slate-600 font-semibold">IVA 16% REGULADO</span>
          <span className="text-slate-400">|</span>
          <span className="text-emerald-700 font-bold">ZERO PAPEL / 100% DIGITAL</span>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="h-16 bg-white/90 backdrop-blur border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-slate-900 flex items-center justify-center font-mono font-bold text-emerald-400 text-base shadow-sm border border-slate-700">
            TC
          </div>
          <div>
            <div className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>TiConta</span>
              <span className="text-emerald-600 font-mono text-xs bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">v2 ERP</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">CARPINTARIA DIGITAL WORKSTATION</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Terminal Operador
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm" className="flex items-center gap-1.5">
              <span>Abrir Workstation</span>
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="workstation-grid py-16 px-6 border-b border-slate-300 relative overflow-hidden bg-slate-50">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 border border-slate-300 text-xs font-mono text-slate-800">
            <Cpu size={14} className="text-emerald-600" />
            <span>ARQUITETURA DE AÇO ESCOVADO & ALUMÍNIO ANODIZADO</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
            ERP Industrial & Faturação Fiscal <br className="hidden md:inline" />
            <span className="text-emerald-700">100% Digital via WhatsApp e SMS</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base md:text-lg text-slate-600 leading-relaxed">
            Elimine impressoras térmicas, bobinas de papel e dependência de internet. 
            O <strong>TiConta v2</strong> opera em modo <strong>Offline-First (IndexedDB)</strong> com conformidade tributária total em Moçambique (IVA a 16%, PGC-NIRF e NUIT de 9 dígitos).
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard/pos">
              <Button variant="primary" size="lg" className="flex items-center gap-2 shadow-lg">
                <Terminal size={18} />
                <span>Testar Terminal POS Digital</span>
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="secondary" size="lg" className="flex items-center gap-2">
                <Layers size={18} />
                <span>Explorar Todos os Módulos</span>
              </Button>
            </Link>
          </div>

          {/* Quick Stats Banner */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto font-mono text-left">
            <div className="panel-bevel p-3.5 rounded-lg">
              <div className="text-[11px] text-slate-500 uppercase">Economia Papel</div>
              <div className="text-xl font-bold text-slate-900">0 MT / Mês</div>
              <div className="text-[10px] text-emerald-600 font-semibold">100% Zero Bobina</div>
            </div>
            <div className="panel-bevel p-3.5 rounded-lg">
              <div className="text-[11px] text-slate-500 uppercase">Regime Tributário</div>
              <div className="text-xl font-bold text-slate-900">IVA 16%</div>
              <div className="text-[10px] text-slate-600">Decreto-Lei 1/2018</div>
            </div>
            <div className="panel-bevel p-3.5 rounded-lg">
              <div className="text-[11px] text-slate-500 uppercase">Latência Offline</div>
              <div className="text-xl font-bold text-slate-900">&lt; 5ms</div>
              <div className="text-[10px] text-emerald-600 font-semibold">IndexedDB Local</div>
            </div>
            <div className="panel-bevel p-3.5 rounded-lg">
              <div className="text-[11px] text-slate-500 uppercase">Validação Fiscal</div>
              <div className="text-xl font-bold text-slate-900">SHA-256</div>
              <div className="text-[10px] text-slate-600">QR Code Digital</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid — Modular Industrial Workstation */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="emerald">ECOSSISTEMA MODULAR INTEGRADO</Badge>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Workstations Especializadas para Cada Setor da Economia Moçambicana
          </h2>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            Da mercearia e loja de ferragens ao restaurante com KDS e oficina mecânica de frotas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {/* Card 1: Main Highlight - POS Digital (Spans 2 cols, 2 rows) */}
          <div className="md:col-span-2 lg:col-span-2 panel-bevel p-6 rounded-xl flex flex-col justify-between relative overflow-hidden group bg-gradient-to-br from-white to-slate-50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Smartphone size={20} />
                </div>
                <Badge variant="emerald">DESTAQUE PRINCIPAL</Badge>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Terminal POS com Checkout 100% Digital via WhatsApp & SMS
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Emita Facturas-Recibo certificadas em menos de 3 segundos. O cliente recebe o documento com QR Code de validação diretamente no WhatsApp ou via SMS. Elimina custos mensais com bobinas térmicas de papel.
              </p>

              <div className="pt-2 flex flex-wrap gap-2 font-mono text-xs text-slate-700">
                <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded">Cálculo IVA 16%</span>
                <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded">Validador NUIT 9 Dígitos</span>
                <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded">M-Pesa & e-Mola</span>
              </div>
            </div>

            <div className="pt-6">
              <Link href="/dashboard/pos">
                <Button variant="primary" className="w-full justify-between">
                  <span>Abrir Terminal POS</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: Caderno de Fiado com Machine Scoring */}
          <div className="panel-bevel p-5 rounded-xl flex flex-col justify-between bg-white">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Calculator size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Caderno de Fiado & Score AI
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Substitua o caderno de fiado em papel por um ledger digital com score de confiabilidade do cliente (0 a 100) e alertas amigáveis pré-formatados para WhatsApp.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/informal-sales">
                <Button variant="secondary" size="sm" className="w-full justify-between text-xs">
                  <span>Gerir Devedores</span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 3: Restaurante & KDS Cozinha */}
          <div className="panel-bevel p-5 rounded-xl flex flex-col justify-between bg-white">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-sm">
                <UtensilsCrossed size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Restaurante & KDS Cozinha
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Workstation para controlo de mesas em tempo real, pedidos com cronómetro de preparação de pratos e fecho direto de conta sem papel.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/restaurant">
                <Button variant="secondary" size="sm" className="w-full justify-between text-xs">
                  <span>Painel Restaurante</span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 4: Oficina & Ordens de Serviço */}
          <div className="panel-bevel p-5 rounded-xl flex flex-col justify-between bg-white">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center shadow-sm">
                <Wrench size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Oficina Mecânica & OS
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Checklist técnico de entrada, alocação de mecânico, peças e mão-de-obra com envio de diagnóstico digital por WhatsApp ao proprietário.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/auto-services">
                <Button variant="secondary" size="sm" className="w-full justify-between text-xs">
                  <span>Ver Ordens de Serviço</span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 5: Takeaway & Despacho de Estafetas */}
          <div className="panel-bevel p-5 rounded-xl flex flex-col justify-between bg-white">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-sm">
                <Bike size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Takeaway & Estafetas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gestão de encomendas para entrega ao domicílio, despacho de motoqueiros e notificação SMS instantânea ao cliente no envio.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/takeaway">
                <Button variant="secondary" size="sm" className="w-full justify-between text-xs">
                  <span>Despacho Takeaway</span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 6: Contabilidade PGC-NIRF & Balancetes (Spans 2 cols) */}
          <div className="md:col-span-2 panel-bevel p-5 rounded-xl flex flex-col justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <FileText size={18} />
                </div>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/40">
                  CONFORMIDADE TRIBUTÁRIA
                </Badge>
              </div>
              <h3 className="text-base font-bold text-white">
                Contabilidade PGC-NIRF, IVA 16% & Mapa de Retenções
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Geração automática do Balancete de Verificação, apuramento do IVA a pagar (Conta 4.4.3), mapa de retenção na fonte de IRPS/IRPC e exportação de ficheiro para declaração M/20 da Autoridade Tributária.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/accounting">
                <Button variant="primary" size="sm" className="w-full justify-between text-xs">
                  <span>Aceder ao Módulo Contábil PGC-NIRF</span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-300 bg-white py-8 px-6 text-xs text-slate-600 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-900 text-emerald-400 rounded flex items-center justify-center text-[10px] font-bold">
              TC
            </div>
            <span>TiConta v2 ERP — Desenvolvido pela <strong>Carpintaria Digital</strong></span>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-slate-500">
            <span>Maputo / Matola, Moçambique</span>
            <span>•</span>
            <span>Offline-First Engine</span>
            <span>•</span>
            <span>Zero Papel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
