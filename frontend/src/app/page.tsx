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
  Send,
  Factory,
  Egg,
  FolderKanban,
  Users2,
  PiggyBank,
  KeyRound,
  Users,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PricingCalculatorSection } from '@/components/pricing/PricingCalculatorSection';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

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
          <span className="text-emerald-800 font-bold">100% DIGITAL • WHATSAPP & SMS • ZERO PAPEL</span>
        </div>
      </div>

      {/* Main Technical Navigation Bar com Logotipo Oficial */}
      <header className="h-16 bg-white border-b border-slate-300 px-6 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/logo-ticonta.png"
            alt="TiConta v2 ERP"
            className="h-9 w-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/icon.png';
            }}
          />
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
            <span>ESTRUTURA INDUSTRIAL • OPERAÇÃO OFFLINE-FIRST • MOÇAMBIQUE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-mono">
            Workstation de Gestão & Faturação <br className="hidden sm:inline" />
            <span className="text-emerald-700">100% Digital via WhatsApp & SMS</span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm md:text-base text-slate-600 leading-relaxed font-sans">
            Elimine custos com bobinas térmicas e impressoras lentas. No <strong>TiConta v2</strong>, cada venda, recibo, ordem de serviço, cobrança amigável de fiado e confirmação de entrega é transmitida instantaneamente para o telemóvel do cliente via <strong>WhatsApp e SMS</strong> com conformidade fiscal do <strong>IVA a 16%</strong>, contabilidade <strong>PGC-NIRF</strong> e chaves criptográficas <strong>HMAC-SHA256</strong>.
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
                <span>Explorar Todos os 14 Módulos</span>
              </Button>
            </Link>
          </div>

          {/* Core Hardware & Protocol Badges */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left font-mono">
            <div className="p-3 bg-white border border-slate-300 rounded shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <MessageSquare size={14} />
                <span>100% Digital WhatsApp</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-sans">Faturas, recibos e alertas sem papel.</p>
            </div>

            <div className="p-3 bg-white border border-slate-300 rounded shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <WifiOff size={14} />
                <span>100% Offline-First</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-sans">Opera sem Internet com SQLite/IndexedDB.</p>
            </div>

            <div className="p-3 bg-white border border-slate-300 rounded shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <ShieldCheck size={14} />
                <span>IVA 16% & PGC-NIRF</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-sans">Conformidade com a Autoridade Tributária.</p>
            </div>

            <div className="p-3 bg-white border border-slate-300 rounded shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <KeyRound size={14} />
                <span>HMAC-SHA256</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-sans">Chaves de ativação invioláveis e seguras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Bento Grid: Industrial Workstation Suite */}
      <section className="py-12 px-6 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-mono">
              SUÍTE DE MÓDULOS INDUSTRIAIS & SETORIAIS
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
              Solução completa para comércio, restauração, oficinas, agropecuária, indústria, obras e finanças.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-xs px-3 py-1 bg-white">
            14 MÓDULOS ATIVOS
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Terminal POS */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                <Terminal size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Terminal POS / Caixa Digital
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Vendas ultrarrápidas, atalhos de teclado F1-F12, M-Pesa, e-Mola, Cartão POS e emissão de recibo digital por WhatsApp.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/pos">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Abrir Caixa POS</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: Caderno de Fiado */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-amber-700 text-white flex items-center justify-center shadow-xs">
                <BookOpen size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Caderno de Fiado & Score AI
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Substituição do caderno de papel. Cálculo do score de risco de crédito e lembretes de cobrança amigáveis via WhatsApp.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/informal-sales">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Gerir Fiado</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 3: CRM & Clientes */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-blue-700 text-white flex items-center justify-center shadow-xs">
                <Users size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                CRM & WhatsApp Marketing
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Base de clientes com NUIT, segmentação VIP/Corporativo e disparo de mensagens e promoções diretas no WhatsApp.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/crm">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Base de Clientes</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 4: Restaurante & KDS */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-cyan-700 text-white flex items-center justify-center shadow-xs">
                <UtensilsCrossed size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Restaurante, Mesas & KDS
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Monitorização de mesas em tempo real, pedidos com cronómetro na cozinha e fecho digital sem papel.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/restaurant">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Mesas & Cozinha</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 5: Oficina & OS */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-slate-800 text-emerald-400 flex items-center justify-center shadow-xs">
                <Wrench size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Oficina Mecânica & OS
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Checklist veicular de entrada, orçamentos e envio de relatório de diagnóstico detalhado por WhatsApp.
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

          {/* Card 6: Takeaway (Delivery vs Balcão) */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-purple-700 text-white flex items-center justify-center shadow-xs">
                <Bike size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Takeaway (Delivery / Balcão)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Gestão de encomendas com taxa de entrega para estafetas ou levantamento rápido no balcão da loja.
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

          {/* Card 7: Produção & Marcenaria */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-slate-700 text-white flex items-center justify-center shadow-xs">
                <Factory size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Produção & Fabricação
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Controlo de matérias-primas, mão-de-obra e custo unitário real de marcenaria, carpintaria e indústria.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/manufacturing">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Ver Produção</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 8: Avicultura & Agropecuária */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-emerald-800 text-white flex items-center justify-center shadow-xs">
                <Egg size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Avicultura & Agropecuária
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Controlo de lotes de frangos de corte e poedeiras, taxa de mortalidade, consumo de ração e postura de ovos.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/poultry">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Gestão de Lotes</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 9: Projetos & Obras */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-indigo-700 text-white flex items-center justify-center shadow-xs">
                <FolderKanban size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Projetos & Obras
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Orçamentação real vs previsto, acompanhamento de marcos de execução e controlo de despesas por obra.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/projects">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Ver Obras</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 10: RH & Salários */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-teal-700 text-white flex items-center justify-center shadow-xs">
                <Users2 size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                RH & Folha de Salários
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Processamento salarial conforme a Lei do Trabalho de MZ, apuramento de INSS (3% + 4%) e retenções na fonte de IRPS.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/hr">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Folha de Salários</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 11: Xitique Digital */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <PiggyBank size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Xitique Digital
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Gestão de grupos de poupança rotativa comunitária, registo de quotas pagas e calendário de desembolsos.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/xitique">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Grupos de Xitique</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 12: Licenças Criptográficas */}
          <div className="panel-bevel p-5 rounded-lg flex flex-col justify-between bg-white border border-slate-300">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-slate-900 text-emerald-400 flex items-center justify-center shadow-xs">
                <KeyRound size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Licença Criptográfica
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Ativação oficial via HMAC-SHA256, verificação offline de validade e controlo de dias restantes por empresa.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/license">
                <Button variant="secondary" size="sm" className="w-full justify-between font-mono text-[11px]">
                  <span>Gestão de Licença</span>
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 13: Contabilidade PGC-NIRF & IVA 16% (Ocupa 3 colunas em tela grande) */}
          <div className="lg:col-span-3 panel-bevel p-6 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-slate-900 text-white border border-slate-800">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <Calculator size={18} />
                </div>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/40 font-mono text-[10px]">
                  CONFORMIDADE FISCAL MOÇAMBIQUE • PGC-NIRF
                </Badge>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono">
                Contabilidade PGC-NIRF, IVA a 16% & Declaração M/20
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Balancete analítico em tempo real, saldo líquido do IVA (Conta 4.4.3 IVA Liquidado vs 4.4.2 IVA Dedutível = 4.4.5 IVA a Pagar/Recuperar) e exportação da declaração modelo M/20 para submissão à Autoridade Tributária.
              </p>
            </div>
            <div className="w-full sm:w-auto shrink-0">
              <Link href="/dashboard/accounting">
                <Button variant="primary" size="md" className="w-full sm:w-auto font-mono text-xs flex items-center justify-center gap-2">
                  <span>Aceder Contabilidade</span>
                  <ChevronRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO OFICIAL DE PREÇOS E DESCONTOS (A PARTIR DE 300 MT) */}
      <PricingCalculatorSection />

      {/* Technical Footer com Logotipo */}
      <footer className="mt-auto border-t border-slate-300 bg-white py-6 px-6 text-xs text-slate-600 font-mono select-none">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-ticonta.png"
              alt="TiConta v2"
              className="h-6 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/icon.png';
              }}
            />
            <span>TiConta v2 ERP — Desenvolvido pela <strong>Carpintaria Digital</strong></span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Maputo / Matola, Moçambique</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">100% Digital • WhatsApp & SMS • Zero Papel</span>
            <span>•</span>
            <span>Decreto-Lei 1/2018</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
