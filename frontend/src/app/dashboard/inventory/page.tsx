'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  ArrowDownRight, 
  ArrowUpRight, 
  TrendingUp, 
  RefreshCw, 
  Barcode, 
  Layers, 
  Building2, 
  Truck,
  CheckCircle2
} from 'lucide-react';
import { useInventoryStore, InventoryItem } from '@/store/inventory.store';
import { ModuleGuard } from '@/components/auth/ModuleGuard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatMZN } from '@/lib/currency';

export default function InventoryPage() {
  const { items, overview, movements, isLoading, fetchInventory, createItem, recordMovement } = useInventoryStore();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<InventoryItem | null>(null);

  // New Item Form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Alimentar');
  const [unit, setUnit] = useState('un');
  const [costPrice, setCostPrice] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [initialStock, setInitialStock] = useState(10);
  const [minStockAlert, setMinStockAlert] = useState(5);

  // Movement Form
  const [movementType, setMovementType] = useState('in_purchase');
  const [movementQty, setMovementQty] = useState(10);
  const [movementCost, setMovementCost] = useState(0);
  const [refDoc, setRefDoc] = useState('');
  const [movementNotes, setMovementNotes] = useState('');

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await createItem({
      name,
      sku: sku || `SKU-${Date.now().toString().slice(-5)}`,
      category,
      unit,
      cost_price: Number(costPrice),
      unit_price: Number(unitPrice),
      current_stock: Number(initialStock),
      min_stock_alert: Number(minStockAlert),
      iva_rate: 16,
      active: true,
    });
    setIsItemModalOpen(false);
    setName('');
    setSku('');
  };

  const handleOpenMovementModal = (item: InventoryItem) => {
    setSelectedItemForMovement(item);
    setMovementCost(item.cost_price);
    setIsMovementModalOpen(true);
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForMovement) return;

    await recordMovement({
      product_id: selectedItemForMovement.id,
      movement_type: movementType,
      quantity: Number(movementQty),
      unit_cost: Number(movementCost),
      reference_document: refDoc,
      notes: movementNotes,
    });

    setIsMovementModalOpen(false);
    setRefDoc('');
    setMovementNotes('');
  };

  const filteredItems = items.filter((item) => {
    if (categoryFilter !== 'all' && item.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    if (search) {
      const s = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(s) ||
        item.sku.toLowerCase().includes(s) ||
        (item.barcode && item.barcode.includes(s))
      );
    }
    return true;
  });

  return (
    <ModuleGuard
      moduleId="inventory"
      moduleName="Stock & Aprovisionamento"
      moduleDescription="Controlo de stock físico, alertas de rutura, valorização a preço de custo/venda e ordens de aprovisionamento que alimentam POS, Restaurante, Oficina e Manufatura."
    >
      <div className="space-y-6 font-mono text-xs">
        {/* Header */}
        <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Package size={18} className="text-emerald-700" />
                <span>STOCK & APROVISIONAMENTO</span>
              </h1>
              <Badge variant="outline" className="text-emerald-700 border-emerald-300 font-bold">
                MULTI-SETORIAL
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Gestão de inventário centralizado que alimenta as vendas do POS, mesas de Restaurante, matérias-primas e lotes agropecuários.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setIsItemModalOpen(true)}
              variant="primary"
              size="sm"
              className="font-mono text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500"
            >
              <Plus size={14} />
              <span>Novo Artigo de Stock</span>
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-300">
              <CardContent className="p-4 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase flex justify-between items-center">
                  <span>Artigos em Catálogo</span>
                  <Package size={14} className="text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{overview.total_items}</div>
                <div className="text-[10px] text-slate-500">Unidades Totais: {overview.total_stock_units}</div>
              </CardContent>
            </Card>

            <Card className="border-slate-300">
              <CardContent className="p-4 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase flex justify-between items-center">
                  <span>Alertas de Stock Baixo</span>
                  <AlertTriangle size={14} className="text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-amber-600">{overview.low_stock_count}</div>
                <div className="text-[10px] text-amber-600 font-semibold">Requer aprovisionamento</div>
              </CardContent>
            </Card>

            <Card className="border-slate-300">
              <CardContent className="p-4 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase flex justify-between items-center">
                  <span>Valor a Preço de Custo</span>
                  <ArrowDownRight size={14} className="text-slate-500" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{formatMZN(overview.total_cost_value_mzn)}</div>
                <div className="text-[10px] text-slate-500">Capital imobilizado</div>
              </CardContent>
            </Card>

            <Card className="border-slate-300">
              <CardContent className="p-4 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase flex justify-between items-center">
                  <span>Valor Potencial de Venda</span>
                  <TrendingUp size={14} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-700">{formatMZN(overview.total_retail_value_mzn)}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Margem: {formatMZN(overview.potential_margin_mzn)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-300">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'Alimentar', 'Restaurante', 'Agro', 'Auto', 'Construção', 'Geral'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-md font-bold text-xs transition shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'Todas Categorias' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, SKU ou barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-300 text-xs font-mono focus:outline-hidden focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Tabela de Inventário */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 select-none">
                <tr>
                  <th className="py-3 px-4">Artigo & SKU</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-right">Stock Atual</th>
                  <th className="py-3 px-4 text-right">Preço Custo (MT)</th>
                  <th className="py-3 px-4 text-right">Preço Venda (MT)</th>
                  <th className="py-3 px-4 text-right">Valor Total (MT)</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-500">SKU: {item.sku}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {item.current_stock} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {formatMZN(item.cost_price)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-800">
                      {formatMZN(item.unit_price)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatMZN(item.stock_value_retail_mzn)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.is_low_stock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center justify-center gap-1">
                          <AlertTriangle size={11} />
                          <span>Baixo</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center justify-center gap-1">
                          <CheckCircle2 size={11} />
                          <span>Normal</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        type="button"
                        onClick={() => handleOpenMovementModal(item)}
                        variant="outline"
                        size="sm"
                        className="text-[11px] px-2 py-1 font-mono"
                      >
                        Movimentar / Entrada
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Novo Artigo */}
        {isItemModalOpen && (
          <Modal
            isOpen={isItemModalOpen}
            onClose={() => setIsItemModalOpen(false)}
            title="NOVO ARTIGO NO CATÁLOGO DE INVENTÁRIO"
            size="md"
          >
            <form onSubmit={handleCreateItem} className="space-y-4 font-mono text-xs">
              <Input
                label="Nome do Produto / Artigo *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sacos de Arroz 25kg"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Código SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ex: ALIM-ARR-025"
                />
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  >
                    <option value="Alimentar">Alimentar</option>
                    <option value="Restaurante">Restaurante</option>
                    <option value="Agro">Agro / Avicultura</option>
                    <option value="Auto">Oficina / Auto</option>
                    <option value="Construção">Construção</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Preço Custo (MT)"
                  type="number"
                  step="10"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                />
                <Input
                  label="Preço Venda (MT) *"
                  type="number"
                  step="10"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  required
                />
                <Input
                  label="Stock Inicial"
                  type="number"
                  value={initialStock}
                  onChange={(e) => setInitialStock(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsItemModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  Cadastrar Artigo
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal: Registar Entrada / Saída de Stock */}
        {isMovementModalOpen && selectedItemForMovement && (
          <Modal
            isOpen={isMovementModalOpen}
            onClose={() => setIsMovementModalOpen(false)}
            title={`MOVIMENTO DE STOCK: ${selectedItemForMovement.name}`}
            size="md"
          >
            <form onSubmit={handleRecordMovement} className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-slate-900">{selectedItemForMovement.name}</div>
                <div className="text-slate-600">Stock Atual: <strong>{selectedItemForMovement.current_stock} {selectedItemForMovement.unit}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Movimento</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                >
                  <option value="in_purchase">📥 Entrada por Compra (Aprovisionamento)</option>
                  <option value="in_adjustment">📥 Entrada por Ajuste de Inventário</option>
                  <option value="out_damage">📤 Saída por Avaria / Quebra</option>
                  <option value="out_consumption">📤 Saída por Consumo Interno</option>
                  <option value="out_adjustment">📤 Saída por Ajuste Negativo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Quantidade *"
                  type="number"
                  min="1"
                  value={movementQty}
                  onChange={(e) => setMovementQty(Number(e.target.value))}
                  required
                />
                <Input
                  label="Custo Unitário (MT)"
                  type="number"
                  value={movementCost}
                  onChange={(e) => setMovementCost(Number(e.target.value))}
                />
              </div>

              <Input
                label="Documento de Referência (ex: FT-FORN/2026)"
                value={refDoc}
                onChange={(e) => setRefDoc(e.target.value)}
                placeholder="N.º da fatura do fornecedor"
              />

              <Input
                label="Observações / Justificativo"
                value={movementNotes}
                onChange={(e) => setMovementNotes(e.target.value)}
                placeholder="Detalhes adicionais do movimento"
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsMovementModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  Confirmar Movimento
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </ModuleGuard>
  );
}
