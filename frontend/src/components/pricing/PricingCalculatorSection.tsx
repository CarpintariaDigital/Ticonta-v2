'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Sparkles, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Calculator, 
  Zap, 
  Tag, 
  Layers, 
  ChevronRight,
  TrendingDown,
  Gift
} from 'lucide-react';
import { usePricingCatalogStore } from '@/store/pricing_catalog.store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function PricingCalculatorSection() {
  const { 
    modules, 
    plans, 
    startingPriceMzn, 
    fetchCatalog, 
    calculateCustomPlan 
  } = usePricingCatalogStore();

  const [cycle, setCycle] = useState<'monthly' | 'semiannual' | 'annual'>('monthly');
  const [selectedModules, setSelectedModules] = useState<string[]>(['pos', 'informal_sales', 'fiado', 'document_delivery']);
  const [coupon, setCoupon] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [showCouponInput, setShowCouponInput] = useState<boolean>(false);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const toggleModule = (id: string) => {
    if (selectedModules.includes(id)) {
      if (selectedModules.length > 1) {
        setSelectedModules(selectedModules.filter((m) => m !== id));
      }
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  const selectAll = () => {
    setSelectedModules(modules.map((m) => m.module_id));
  };

  const resetToStarter = () => {
    setSelectedModules(['pos', 'informal_sales', 'fiado', 'document_delivery']);
  };

  const calculation = calculateCustomPlan(selectedModules, cycle, appliedCoupon);

  const formatMZN = (val: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      maximumFractionDigits: 0,
    }).format(val).replace('MZN', 'MT');
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedCoupon(coupon.trim().toUpperCase());
  };

  const generateWhatsAppOrderLink = () => {
    const chosenNames = calculation.breakdown.map((b) => b.name).join(', ');
    const cycleText = cycle === 'annual' ? 'Anual (20% desconto)' : cycle === 'semiannual' ? 'Semestral (10% desconto)' : 'Mensal';
    const text = encodeURIComponent(
      `Olá Carpintaria Digital! Gostaria de ativar a minha licença do TiConta ERP v2:\n\n` +
      `📦 *Módulos Escolhidos:* ${chosenNames}\n` +
      `⏱️ *Ciclo de Pagamento:* ${cycleText}\n` +
      `💰 *Total:* ${formatMZN(calculation.cycle_total_mzn)} (${formatMZN(calculation.effective_monthly_mzn)}/mês)\n` +
      (appliedCoupon ? `🎟️ *Cupão:* ${appliedCoupon}\n` : '') +
      `\nPoderiam emitir a minha chave de ativação para o meu dispositivo?`
    );
    return `https://wa.me/258840000000?text=${text}`;
  };

  return (
    <section id="pricing" className="py-16 px-6 bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header com destaque nos 300 MT */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
            <Sparkles size={14} className="text-emerald-400" />
            <span>TRANSPARÊNCIA TOTAL • SEM CUSTOS OCULTOS • SEM FIDELIZAÇÃO</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-mono text-white">
            Preços Justos para Moçambique <br />
            <span className="text-emerald-400">Módulos & Planos a partir de {startingPriceMzn} MT / mês</span>
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto font-sans leading-relaxed">
            Escolha um pacote pronto ou monte o seu próprio sistema à medida do seu comércio. Pague apenas pelos módulos que realmente utiliza na sua banca, loja ou empresa.
          </p>

          {/* Seletor de Ciclo de Pagamento */}
          <div className="pt-2 flex items-center justify-center">
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex items-center gap-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setCycle('monthly')}
                className={`px-3.5 py-1.5 rounded-md transition-all ${
                  cycle === 'monthly'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setCycle('semiannual')}
                className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  cycle === 'semiannual'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Semestral</span>
                <span className="bg-emerald-950 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded border border-emerald-500/30">
                  -10%
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCycle('annual')}
                className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  cycle === 'annual'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Anual</span>
                <span className="bg-amber-950 text-amber-300 text-[10px] px-1.5 py-0.2 rounded border border-amber-500/30 font-bold">
                  2 Meses Grátis (-20%)
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Grade de Planos Predefinidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((p) => {
            const isHighlighted = p.plan_id === 'starter' || p.plan_id === 'basic';
            const multiplier = cycle === 'annual' ? 0.8 : cycle === 'semiannual' ? 0.9 : 1;
            const effectivePrice = Math.round(p.monthly_price_mzn * multiplier);

            return (
              <div
                key={p.plan_id}
                className={`rounded-xl p-5 flex flex-col justify-between transition-all border ${
                  isHighlighted
                    ? 'bg-slate-800/90 border-emerald-500/50 shadow-lg shadow-emerald-950/40 relative'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-500 text-slate-950 font-bold font-mono text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      {p.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold font-mono text-white">{p.name}</h3>
                    <p className="text-slate-400 text-xs mt-1 font-sans">{p.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                        {formatMZN(effectivePrice)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">/ mês</span>
                    </div>
                    {cycle !== 'monthly' && (
                      <p className="text-[11px] text-emerald-400/80 font-mono mt-0.5">
                        Faturado {cycle === 'annual' ? 'anualmente' : 'semestralmente'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Módulos Inclusos:</p>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                      {p.included_modules.includes('*') ? (
                        <li className="flex items-center gap-2 text-emerald-300 font-medium">
                          <Check size={14} className="text-emerald-400 shrink-0" />
                          <span>Todos os 13 Módulos do Sistema</span>
                        </li>
                      ) : (
                        p.included_modules.map((mId) => {
                          const modInfo = modules.find((m) => m.module_id === mId);
                          return (
                            <li key={mId} className="flex items-center gap-2">
                              <Check size={14} className="text-emerald-400 shrink-0" />
                              <span>{modInfo ? modInfo.name : mId}</span>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <a
                    href={`https://wa.me/258840000000?text=${encodeURIComponent(
                      `Olá Carpintaria Digital! Quero aderir ao plano *${p.name}* do TiConta v2 ERP (${formatMZN(effectivePrice)}/mês no ciclo ${cycle}). Poderiam dar seguimento à ativação?`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <Button
                      variant={isHighlighted ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full font-mono text-xs flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare size={13} />
                      <span>Aderir via WhatsApp</span>
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* SIMULADOR INTERATIVO: MONTE O SEU PACOTE */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-800 to-slate-850 p-6 sm:p-8 border border-slate-700 shadow-xl space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700 pb-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Calculator size={16} />
                <span>Simulador Personalizado</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                Monte o Seu Pacote Personalizado
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5">
                Selecione os módulos que o seu comércio necessita e veja os descontos aplicados em tempo real.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={resetToStarter}
                className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all"
              >
                Micro Starter (300 MT)
              </button>
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1.5 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all font-bold"
              >
                Selecionar Todos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Módulos Selecionáveis */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modules.map((m) => {
                const isSelected = selectedModules.includes(m.module_id);
                return (
                  <div
                    key={m.module_id}
                    onClick={() => toggleModule(m.module_id)}
                    className={`p-3.5 rounded-lg border cursor-pointer select-none transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-xs'
                        : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-600 bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-mono text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {m.name}
                        </span>
                        <span className="font-mono text-xs text-emerald-400 font-bold shrink-0">
                          {formatMZN(m.base_price_mzn)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 font-sans leading-tight">
                        {m.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumo do Cálculo e Descontos */}
            <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-700 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h4 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Tag size={15} className="text-emerald-400" />
                  <span>Resumo do Pacote</span>
                </h4>

                <div className="space-y-2 border-b border-slate-800 pb-4 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Módulos Selecionados:</span>
                    <span className="text-white font-bold">{calculation.selected_modules_count}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Mensal:</span>
                    <span className="text-white">{formatMZN(calculation.monthly_subtotal_mzn)}</span>
                  </div>

                  {calculation.applied_discounts.length > 0 && (
                    <div className="space-y-1 pt-1.5">
                      <span className="text-[11px] text-emerald-400 font-bold">Descontos Aplicados:</span>
                      {calculation.applied_discounts.map((d, i) => (
                        <div key={i} className="flex items-center gap-1 text-[11px] text-emerald-300 font-sans">
                          <TrendingDown size={12} className="text-emerald-400 shrink-0" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {calculation.cycle_discount_mzn > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold pt-1">
                      <span>Total Desconto:</span>
                      <span>-{formatMZN(calculation.cycle_discount_mzn)}</span>
                    </div>
                  )}
                </div>

                {/* Cupão Promocional */}
                <div className="space-y-2">
                  {!showCouponInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCouponInput(true)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
                    >
                      <Gift size={13} />
                      <span>Tem um cupão de desconto?</span>
                    </button>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: CARPINTARIA300"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono uppercase focus:outline-hidden focus:border-emerald-500 flex-1"
                      />
                      <Button type="submit" variant="outline" size="sm" className="font-mono text-xs">
                        Aplicar
                      </Button>
                    </form>
                  )}
                  {appliedCoupon && (
                    <div className="text-[11px] text-emerald-300 font-mono flex items-center gap-1">
                      <Check size={12} />
                      <span>Cupão <strong>{appliedCoupon}</strong> ativo!</span>
                    </div>
                  )}
                </div>

                {/* Preço Final */}
                <div className="pt-2">
                  <div className="text-[11px] text-slate-400 font-mono">VALOR TOTAL DO INVESTIMENTO:</div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-3xl font-extrabold font-mono text-emerald-400">
                      {formatMZN(calculation.cycle_total_mzn)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ({formatMZN(calculation.effective_monthly_mzn)}/mês)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {cycle === 'annual' ? 'Pagamento anual único' : cycle === 'semiannual' ? 'Pagamento semestral' : 'Pagamento mensal'} • Ativação imediata
                  </p>
                </div>
              </div>

              {/* Botão de Envio WhatsApp */}
              <div className="pt-2">
                <a
                  href={generateWhatsAppOrderLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full font-mono text-xs flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500"
                  >
                    <Send size={14} />
                    <span>Pedir Ativação via WhatsApp</span>
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
