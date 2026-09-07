'use client';

import React, { useState } from 'react';
import { 
  Factory, 
  Plus, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BarChart3,
  Boxes
} from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface ProductionOrder {
  id: string;
  orderNumber: string;
  productName: string;
  targetQty: number;
  completedQty: number;
  status: 'Planeada' | 'Em Produção' | 'Concluída';
  rawMaterialCost: number;
  laborCost: number;
  totalCost: number;
  unitCost: number;
  dueDate: string;
}

const initialOrders: ProductionOrder[] = [
  { id: 'OP-01', orderNumber: 'OP-2026/042', productName: 'Mesa de Escritório em Madeira Chanfuta', targetQty: 10, completedQty: 6, status: 'Em Produção', rawMaterialCost: 28000, laborCost: 12000, totalCost: 40000, unitCost: 4000, dueDate: '2026-09-15' },
  { id: 'OP-02', orderNumber: 'OP-2026/043', productName: 'Portas Maciças de Umbila 2.10x0.90', targetQty: 25, completedQty: 25, status: 'Concluída', rawMaterialCost: 85000, laborCost: 35000, totalCost: 120000, unitCost: 4800, dueDate: '2026-09-04' },
];

export default function ManufacturingPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>(initialOrders);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [targetQty, setTargetQty] = useState(10);
  const [rawCost, setRawCost] = useState(15000);
  const [laborCost, setLaborCost] = useState(5000);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(targetQty);
    const raw = Number(rawCost);
    const labor = Number(laborCost);
    const total = raw + labor;
    const newOp: ProductionOrder = {
      id: `OP-${Date.now().toString(36).toUpperCase()}`,
      orderNumber: `OP-2026/${Math.floor(100 + Math.random() * 900)}`,
      productName,
      targetQty: qty,
      completedQty: 0,
      status: 'Em Produção',
      rawMaterialCost: raw,
      laborCost: labor,
      totalCost: total,
      unitCost: total / qty,
      dueDate: '2026-09-30',
    };
    setOrders([newOp, ...orders]);
    setIsNewModalOpen(false);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Factory size={18} className="text-slate-800" />
            <span>Produção, Fabricação & Cálculo de Custos Industriais</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Controlo de matérias-primas, mão-de-obra e custo unitário real de produção.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsNewModalOpen(true)} className="flex items-center gap-1.5">
          <Plus size={14} />
          <span>Nova Ordem de Produção</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((op) => (
          <Card key={op.id} className="border-slate-300">
            <CardHeader className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900">{op.orderNumber}</span>
              <Badge variant={op.status === 'Concluída' ? 'emerald' : 'cyan'}>
                {op.status.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="font-bold text-slate-900 text-sm">{op.productName}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Prazo de Entrega: {op.dueDate}</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>Progresso da Produção:</span>
                  <span className="font-bold">{op.completedQty} / {op.targetQty} un ({Math.round((op.completedQty / op.targetQty) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{ width: `${(op.completedQty / op.targetQty) * 100}%` }} />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center text-[11px]">
                <div>
                  <span className="text-slate-500">Custo Total: </span>
                  <span className="font-bold text-slate-900">{formatMZN(op.totalCost)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Custo Unitário: </span>
                  <span className="font-bold text-emerald-800">{formatMZN(op.unitCost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="CRIAR ORDEM DE PRODUÇÃO"
        size="md"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsNewModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="md" onClick={handleCreate}>Iniciar Produção</Button>
          </div>
        }
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Produto a Fabricar" value={productName} onChange={(e) => setProductName(e.target.value)} required />
          <Input label="Quantidade Alvo (unidades)" type="number" value={targetQty} onChange={(e) => setTargetQty(Number(e.target.value))} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Custo Matéria-Prima (MT)" type="number" value={rawCost} onChange={(e) => setRawCost(Number(e.target.value))} required />
            <Input label="Custo Mão-de-Obra (MT)" type="number" value={laborCost} onChange={(e) => setLaborCost(Number(e.target.value))} required />
          </div>
        </form>
      </Modal>
    </div>
  );
}
