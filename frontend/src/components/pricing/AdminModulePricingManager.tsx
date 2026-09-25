'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Percent, 
  Save, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Tag, 
  Sliders, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';
import { usePricingCatalogStore } from '@/store/pricing_catalog.store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function AdminModulePricingManager() {
  const { 
    modules, 
    startingPriceMzn, 
    isLoading, 
    isSaving, 
    saveSuccess, 
    fetchCatalog, 
    updateModulePrice, 
    saveCatalog 
  } = usePricingCatalogStore();

  const [localStartingPrice, setLocalStartingPrice] = useState<number>(startingPriceMzn);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    setLocalStartingPrice(startingPriceMzn);
  }, [startingPriceMzn]);

  const handlePriceChange = (moduleId: string, value: string) => {
    const num = parseFloat(value) || 0;
    const current = modules.find((m) => m.module_id === moduleId);
    updateModulePrice(moduleId, num, current?.discount_percent || 0, current?.is_active ?? true);
  };

  const handleDiscountChange = (moduleId: string, value: string) => {
    const num = Math.min(100, Math.max(0, parseFloat(value) || 0));
    const current = modules.find((m) => m.module_id === moduleId);
    updateModulePrice(moduleId, current?.base_price_mzn || 0, num, current?.is_active ?? true);
  };

  const handleToggleActive = (moduleId: string) => {
    const current = modules.find((m) => m.module_id === moduleId);
    if (current) {
      updateModulePrice(moduleId, current.base_price_mzn, current.discount_percent, !current.is_active);
    }
  };

  const handleSave = async () => {
    await saveCatalog();
  };

  const filteredModules = filterCategory === 'all' 
    ? modules 
    : modules.filter((m) => m.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header com instruções */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Sliders size={15} />
            <span>Configurador do Criador & Licenciador</span>
          </div>
          <h3 className="text-lg font-bold font-mono text-white mt-1">
            Gestão de Preços & Descontos dos Módulos ERP
          </h3>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Defina o preço base mensal em Meticais (MT) e as percentagens de desconto de cada módulo do sistema.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            variant="primary"
            size="md"
            className="font-mono text-xs flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 w-full sm:w-auto justify-center"
          >
            {isSaving ? (
              <span>A Guardar...</span>
            ) : saveSuccess ? (
              <>
                <Check size={14} />
                <span>Preços Atualizados!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Guardar Tabela de Preços</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-mono flex items-center gap-2">
          <Check size={16} className="text-emerald-700" />
          <span>Tabela de preços e descontos sincronizada com sucesso no backend e na landing page!</span>
        </div>
      )}

      {/* Barra de Filtros e Preço Mínimo */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-300 shadow-xs">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500 font-bold">Filtrar Categoria:</span>
          {['all', 'retail', 'operations', 'finance', 'agro', 'core'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-600 font-medium">Preço de Partida Mínimo:</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={localStartingPrice}
              onChange={(e) => setLocalStartingPrice(Number(e.target.value) || 300)}
              className="w-20 px-2 py-1 rounded border border-slate-300 font-mono text-xs text-right font-bold text-emerald-800"
            />
            <span className="text-slate-500 font-bold">MT</span>
          </div>
        </div>
      </div>

      {/* Tabela de Configuração dos Módulos */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 select-none">
              <tr>
                <th className="py-3 px-4">Módulo</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-right">Preço Base (MT/mês)</th>
                <th className="py-3 px-4 text-right">Desconto (%)</th>
                <th className="py-3 px-4 text-right">Preço Líquido (MT)</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredModules.map((m) => {
                const base = Number(m.base_price_mzn) || 0;
                const discPercent = Number(m.discount_percent) || 0;
                const net = Math.max(0, base - (base * discPercent) / 100);

                return (
                  <tr key={m.module_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-slate-500 font-sans mt-0.5 line-clamp-1">
                        {m.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        {m.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          step="10"
                          min="0"
                          value={m.base_price_mzn}
                          onChange={(e) => handlePriceChange(m.module_id, e.target.value)}
                          className="w-24 px-2 py-1 rounded border border-slate-300 text-right font-mono text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-600"
                        />
                        <span className="text-slate-500 text-[11px]">MT</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={m.discount_percent}
                          onChange={(e) => handleDiscountChange(m.module_id, e.target.value)}
                          className="w-16 px-2 py-1 rounded border border-slate-300 text-right font-mono text-xs font-bold text-emerald-700 focus:outline-hidden focus:border-emerald-600"
                        />
                        <span className="text-slate-500 text-[11px]">%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      <span className={discPercent > 0 ? 'text-emerald-700' : 'text-slate-900'}>
                        {Math.round(net)} MT
                      </span>
                      {discPercent > 0 && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {Math.round(base)} MT
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(m.module_id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                          m.is_active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-200 text-slate-500 border border-slate-300'
                        }`}
                      >
                        {m.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
