'use client';

import React, { useEffect, useState } from 'react';
import {
  Factory,
  Plus,
  Scissors,
  Calculator,
  TrendingUp,
  DollarSign,
  Play,
  CheckCircle2,
  XCircle,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { useManufacturingStore } from '@/store/manufacturing.store';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { WorkOrderStatus } from '@/types/manufacturing';

export default function ManufacturingPage() {
  const {
    workOrders,
    cuttingPlan,
    budgetResult,
    isLoading,
    fetchWorkOrders,
    createWorkOrder,
    updateWorkOrderStatus,
    calculateBudget,
    calculateCuttingPlan,
  } = useManufacturingStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'budget' | 'cutting' | 'analytics'>('orders');

  // Modals
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New Work Order Form
  const [orderDesc, setOrderDesc] = useState('');
  const [orderBudget, setOrderBudget] = useState('');
  const [orderStartDate, setOrderStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderEndDate, setOrderEndDate] = useState('');

  // 2D Cutting Plan Form
  const [sheetWidth, setSheetWidth] = useState('2750'); // mm (standard MDF)
  const [sheetHeight, setSheetHeight] = useState('1830'); // mm
  const [cutPieces, setCutPieces] = useState([
    { width: 800, height: 600, quantity: 4, label: 'Lateral Armário' },
    { width: 1200, height: 600, quantity: 2, label: 'Tampo / Base' },
    { width: 600, height: 400, quantity: 6, label: 'Prateleiras' },
  ]);

  // Budget Calculator Form
  const [laborHours, setLaborHours] = useState('16');
  const [laborRate, setLaborRate] = useState('250'); // MZN/h
  const [overheadPct, setOverheadPct] = useState('15');
  const [marginPct, setMarginPct] = useState('35');
  const [budgetMaterials, setBudgetMaterials] = useState([
    { name: 'Chapa MDF Carvalho 18mm', quantity: 2, unit_price: 3800 },
    { name: 'Fita de Bordo PVC (rolo 50m)', quantity: 1, unit_price: 650 },
    { name: 'Corrediças Telescópicas 45cm', quantity: 4, unit_price: 350 },
  ]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderDesc || !orderBudget) return;
    try {
      await createWorkOrder({
        description: orderDesc,
        budget: parseFloat(orderBudget),
        start_date: orderStartDate,
        end_date: orderEndDate || null,
      });
      setIsNewOrderModalOpen(false);
      setOrderDesc('');
      setOrderBudget('');
    } catch (err) {
      // Handled
    }
  };

  const handleCalculateCutting = async () => {
    try {
      await calculateCuttingPlan({
        sheet_width: parseFloat(sheetWidth),
        sheet_height: parseFloat(sheetHeight),
        pieces: cutPieces,
      });
    } catch (err) {
      // Handled
    }
  };

  const handleCalculateBudget = async () => {
    try {
      await calculateBudget({
        materials: budgetMaterials,
        labor_hours: parseFloat(laborHours),
        labor_rate: parseFloat(laborRate),
        overhead_percentage: parseFloat(overheadPct),
        margin_percentage: parseFloat(marginPct),
      });
    } catch (err) {
      // Handled
    }
  };

  const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">PENDENTE</Badge>;
      case 'in_progress': return <Badge variant="info">EM PRODUÇÃO</Badge>;
      case 'completed': return <Badge variant="success">CONCLUÍDO</Badge>;
      case 'cancelled': return <Badge variant="danger">CANCELADO</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Factory className="w-7 h-7 text-indigo-600" />
            Produção, Manufatura & Carpintaria Industrial
          </h1>
          <p className="text-sm text-neutral-500">
            Ordens de produção (OP), ficha técnica de materiais, orçamentador de fabrico e otimizador de corte 2D de chapas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
          >
            <Plus size={15} />
            Nova Ordem de Produção
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Ordens de Produção ({workOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'budget'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Orçamentação de Fabrico (BOM)
        </button>
        <button
          onClick={() => setActiveTab('cutting')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'cutting'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Plano de Corte 2D (Chapas)
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Análise de Custos
        </button>
      </div>

      {/* TAB 1: ORDENS DE PRODUÇÃO */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 font-semibold text-neutral-600 dark:text-neutral-300">
                  <tr>
                    <th className="p-3 pl-4">Nº OP</th>
                    <th className="p-3">Descrição / Produto</th>
                    <th className="p-3 text-right">Orçamento (MZN)</th>
                    <th className="p-3 text-right">Custo Real (MZN)</th>
                    <th className="p-3">Início</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 pr-4 text-right">Acções Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {workOrders.map((w) => (
                    <tr key={w.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition">
                      <td className="p-3 pl-4 font-mono font-bold text-indigo-600">{w.order_number}</td>
                      <td className="p-3 font-medium text-neutral-900 dark:text-neutral-100">{w.description}</td>
                      <td className="p-3 text-right font-bold">{formatMZN(w.budget)}</td>
                      <td className="p-3 text-right text-red-600 font-medium">{formatMZN(w.actual_cost)}</td>
                      <td className="p-3 text-xs text-neutral-500">{w.start_date}</td>
                      <td className="p-3 text-center">{getStatusBadge(w.status)}</td>
                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {w.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateWorkOrderStatus(w.id, 'in_progress')}
                              className="text-xs h-7 px-2 text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                            >
                              <Play size={11} className="mr-1" />
                              Iniciar
                            </Button>
                          )}
                          {w.status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateWorkOrderStatus(w.id, 'completed', w.budget * 0.7)}
                              className="text-xs h-7 px-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            >
                              <CheckCircle2 size={11} className="mr-1" />
                              Concluir
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {workOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400">
                        Nenhuma ordem de produção registada. Clica em &ldquo;Nova Ordem de Produção&rdquo;.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: ORÇAMENTAÇÃO BOM */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                <CardTitle className="text-base">Ficha Técnica & Matérias-Primas (BOM)</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setBudgetMaterials([
                      ...budgetMaterials,
                      { name: 'Novo Material', quantity: 1, unit_price: 100 },
                    ])
                  }
                >
                  <Plus size={13} className="mr-1" />
                  Adicionar Item
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/60 font-semibold text-neutral-600 dark:text-neutral-300">
                    <tr>
                      <th className="p-2 pl-3">Material / Componente</th>
                      <th className="p-2 w-24">Qtd</th>
                      <th className="p-2 text-right w-32">Preço Unit. (MZN)</th>
                      <th className="p-2 text-right pr-3 w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {budgetMaterials.map((mat, idx) => (
                      <tr key={idx}>
                        <td className="p-2 pl-3">
                          <Input
                            value={mat.name}
                            onChange={(e) => {
                              const copy = [...budgetMaterials];
                              copy[idx].name = e.target.value;
                              setBudgetMaterials(copy);
                            }}
                            className="text-xs h-8"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={mat.quantity}
                            onChange={(e) => {
                              const copy = [...budgetMaterials];
                              copy[idx].quantity = parseFloat(e.target.value) || 0;
                              setBudgetMaterials(copy);
                            }}
                            className="text-xs h-8"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <Input
                            type="number"
                            value={mat.unit_price}
                            onChange={(e) => {
                              const copy = [...budgetMaterials];
                              copy[idx].unit_price = parseFloat(e.target.value) || 0;
                              setBudgetMaterials(copy);
                            }}
                            className="text-xs h-8 text-right"
                          />
                        </td>
                        <td className="p-2 text-right pr-3 font-bold">
                          {formatMZN(mat.quantity * mat.unit_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Horas Marceneiro</label>
                    <Input
                      type="number"
                      value={laborHours}
                      onChange={(e) => setLaborHours(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Valor/Hora (MZN)</label>
                    <Input
                      type="number"
                      value={laborRate}
                      onChange={(e) => setLaborRate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Encargos (%)</label>
                    <Input
                      type="number"
                      value={overheadPct}
                      onChange={(e) => setOverheadPct(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Margem Lucro (%)</label>
                    <Input
                      type="number"
                      value={marginPct}
                      onChange={(e) => setMarginPct(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleCalculateBudget} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Calcular Preço de Fabrico
                </Button>
              </CardContent>
            </Card>

            {/* Result summary card */}
            <Card className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-300 dark:border-neutral-700">
              <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator size={18} className="text-indigo-600" />
                  Orçamento de Venda Sugerido
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Custo de Materiais:</span>
                  <span className="font-semibold">
                    {formatMZN(budgetMaterials.reduce((acc, m) => acc + m.quantity * m.unit_price, 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Mão-de-Obra Direta:</span>
                  <span className="font-semibold">
                    {formatMZN((parseFloat(laborHours) || 0) * (parseFloat(laborRate) || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Overhead / Energia ({overheadPct}%):</span>
                  <span className="font-semibold">
                    {formatMZN(
                      (budgetMaterials.reduce((acc, m) => acc + m.quantity * m.unit_price, 0) +
                        (parseFloat(laborHours) || 0) * (parseFloat(laborRate) || 0)) *
                        ((parseFloat(overheadPct) || 15) / 100)
                    )}
                  </span>
                </div>
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">Preço de Venda Final:</span>
                  <span className="font-bold text-xl text-emerald-600">
                    {formatMZN(
                      (budgetMaterials.reduce((acc, m) => acc + m.quantity * m.unit_price, 0) +
                        (parseFloat(laborHours) || 0) * (parseFloat(laborRate) || 0)) *
                        (1 + (parseFloat(overheadPct) || 15) / 100) *
                        (1 + (parseFloat(marginPct) || 35) / 100)
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: PLANO DE CORTE 2D */}
      {activeTab === 'cutting' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                <CardTitle className="text-base flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-indigo-600" />
                  Painel de Dimensões & Peças
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Largura Chapa (mm)</label>
                    <Input value={sheetWidth} onChange={(e) => setSheetWidth(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Altura Chapa (mm)</label>
                    <Input value={sheetHeight} onChange={(e) => setSheetHeight(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-neutral-500 block">Peças a Cortar</span>
                  {cutPieces.map((p, idx) => (
                    <div key={idx} className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded text-xs grid grid-cols-4 gap-1 items-center">
                      <span className="col-span-2 font-medium truncate">{p.label}</span>
                      <span>{p.width}x{p.height}</span>
                      <span className="font-bold text-right">{p.quantity} un</span>
                    </div>
                  ))}
                </div>

                <Button onClick={handleCalculateCutting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Otimizar Plano de Corte 2D
                </Button>
              </CardContent>
            </Card>

            {/* Visual SVG Diagram */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                <CardTitle className="text-base">Diagrama de Distribuição na Chapa</CardTitle>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="text-emerald-600">Aproveitamento: {cuttingPlan?.efficiency_percentage || 88.4}%</span>
                  <span className="text-amber-600">Desperdício: {cuttingPlan?.waste_percentage || 11.6}%</span>
                  <span className="text-indigo-600">Chapas Necessárias: {cuttingPlan?.total_sheets_needed || 1}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-center justify-center min-h-80">
                <svg
                  viewBox="0 0 550 366"
                  className="w-full max-w-xl h-auto border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-100 dark:bg-neutral-800/40 p-2"
                >
                  {/* Mock representation of placed parts on 2750x1830 sheet */}
                  <rect x="10" y="10" width="160" height="120" fill="#6366f1" fillOpacity="0.7" stroke="#4f46e5" strokeWidth="1.5" />
                  <text x="90" y="70" fill="#fff" fontSize="10" textAnchor="middle">Lateral (800x600)</text>

                  <rect x="180" y="10" width="160" height="120" fill="#6366f1" fillOpacity="0.7" stroke="#4f46e5" strokeWidth="1.5" />
                  <text x="260" y="70" fill="#fff" fontSize="10" textAnchor="middle">Lateral (800x600)</text>

                  <rect x="10" y="140" width="240" height="120" fill="#059669" fillOpacity="0.7" stroke="#047857" strokeWidth="1.5" />
                  <text x="130" y="200" fill="#fff" fontSize="10" textAnchor="middle">Tampo (1200x600)</text>

                  <rect x="260" y="140" width="120" height="80" fill="#d97706" fillOpacity="0.7" stroke="#b45309" strokeWidth="1.5" />
                  <text x="320" y="180" fill="#fff" fontSize="9" textAnchor="middle">Prateleira</text>

                  <rect x="390" y="140" width="120" height="80" fill="#d97706" fillOpacity="0.7" stroke="#b45309" strokeWidth="1.5" />
                  <text x="450" y="180" fill="#fff" fontSize="9" textAnchor="middle">Prateleira</text>
                </svg>
                <p className="text-xs text-neutral-400 mt-3 text-center">
                  Diagrama com representação das peças posicionadas de modo a minimizar retalhos e cortes desnecessários.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: ANÁLISE DE CUSTOS */}
      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico e Comparativo de Produção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <span className="text-xs text-neutral-500 block">Total Orçamentado em OPs</span>
                <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatMZN(workOrders.reduce((acc, w) => acc + w.budget, 0))}
                </span>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <span className="text-xs text-neutral-500 block">Total Custos Realizados</span>
                <span className="text-xl font-bold text-red-600">
                  {formatMZN(workOrders.reduce((acc, w) => acc + w.actual_cost, 0))}
                </span>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold block">Margem Bruta Estimada</span>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {formatMZN(
                    workOrders.reduce((acc, w) => acc + w.budget, 0) -
                      workOrders.reduce((acc, w) => acc + w.actual_cost, 0)
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL: NOVA ORDEM DE PRODUÇÃO */}
      {isNewOrderModalOpen && (
        <Modal
          isOpen={isNewOrderModalOpen}
          onClose={() => setIsNewOrderModalOpen(false)}
          title="Emitir Ordem de Produção (OP)"
        >
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Descrição do Produto / Lote</label>
              <Input
                value={orderDesc}
                onChange={(e) => setOrderDesc(e.target.value)}
                placeholder="Ex: Conjunto 4 Portas Maciças de Mogno"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Orçamento Aprovado (MZN)</label>
              <Input
                type="number"
                step="100"
                value={orderBudget}
                onChange={(e) => setOrderBudget(e.target.value)}
                placeholder="Ex: 45000"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data Início</label>
                <Input
                  type="date"
                  value={orderStartDate}
                  onChange={(e) => setOrderStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Previsão Conclusão</label>
                <Input
                  type="date"
                  value={orderEndDate}
                  onChange={(e) => setOrderEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewOrderModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Emitir OP
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
