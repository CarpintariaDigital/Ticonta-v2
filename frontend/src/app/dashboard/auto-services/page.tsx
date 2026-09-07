'use client';

import React, { useState } from 'react';
import { 
  Wrench, 
  Car, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Plus, 
  Clock, 
  ShieldCheck,
  Search
} from 'lucide-react';
import { useAutoStore, ServiceOrder } from '@/store/autoStore';
import { formatMZN } from '@/lib/currency';
import { generateWhatsAppAutoDiagnosis } from '@/lib/whatsapp';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export default function AutoServicesPage() {
  const { orders, updateStatus, addOrder } = useAutoStore();
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isNewOsModalOpen, setIsNewOsModalOpen] = useState(false);

  // New OS form state
  const [newPlate, setNewPlate] = useState('AFG-123-MC');
  const [newModel, setNewModel] = useState('Toyota Hilux GD6');
  const [newClient, setNewClient] = useState('Transportes Maputo Lda');
  const [newPhone, setNewPhone] = useState('+258 84 990 1122');
  const [newMechanic, setNewMechanic] = useState('Mestre Carlos');
  const [newDesc, setNewDesc] = useState('Revisão geral do sistema de travagem e suspensão');
  const [newParts, setNewParts] = useState(4500);
  const [newLabor, setNewLabor] = useState(2500);

  const handleSendWhatsAppOS = (os: ServiceOrder) => {
    const encoded = generateWhatsAppAutoDiagnosis(
      os.osNumber,
      os.clientName,
      `${os.vehicleModel} (${os.vehiclePlate})`,
      os.total,
      `https://ticonta.mz/os/${os.id}`
    );
    const cleanPhone = os.clientPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = Number(newParts);
    const labor = Number(newLabor);
    const newOs: ServiceOrder = {
      id: `OS-${Date.now().toString(36).toUpperCase()}`,
      osNumber: `OS-2026/${Math.floor(100 + Math.random() * 900)}`,
      vehiclePlate: newPlate,
      vehicleModel: newModel,
      clientName: newClient,
      clientPhone: newPhone,
      mechanic: newMechanic,
      serviceDescription: newDesc,
      checklist: [
        { item: 'Nível Óleo Motor', ok: true },
        { item: 'Fluido Travões', ok: false },
        { item: 'Filtro Combustível', ok: false },
        { item: 'Suspensão Dianteira', ok: true },
      ],
      partsTotal: parts,
      laborTotal: labor,
      total: parts + labor,
      status: 'Diagnóstico',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    addOrder(newOs);
    setIsNewOsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench size={18} className="text-slate-800" />
            <span>Oficina Mecânica & Ordens de Serviço (OS Industrial)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Checklist técnico veicular, cotação de peças e mão-de-obra, relatório digital WhatsApp.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsNewOsModalOpen(true)}
          className="flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>Criar Nova Ordem de Serviço</span>
        </Button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        {orders.map((os) => (
          <Card key={os.id} className="border-slate-300">
            <CardHeader className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Car size={16} className="text-slate-700" />
                <span className="font-bold text-slate-900 text-xs">{os.osNumber}</span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-[11px] font-bold">
                  {os.vehiclePlate}
                </span>
              </div>
              <Badge
                variant={
                  os.status === 'Em Execução'
                    ? 'cyan'
                    : os.status === 'Concluída'
                    ? 'emerald'
                    : 'outline'
                }
              >
                {os.status.toUpperCase()}
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <div className="text-sm font-bold text-slate-900">{os.vehicleModel}</div>
                <div className="text-[11px] text-slate-500">
                  Cliente: {os.clientName} ({os.clientPhone})
                </div>
                <div className="text-[11px] text-slate-500">
                  Mecânico Responsável: <span className="font-semibold text-slate-700">{os.mechanic}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px]">
                <div className="text-slate-500 uppercase text-[10px]">Diagnóstico & Descrição:</div>
                <div className="text-slate-800 mt-0.5">{os.serviceDescription}</div>
              </div>

              {/* Checklist Badges */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase mb-1">Checklist de Entrada:</div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {os.checklist.map((c, i) => (
                    <div key={i} className="flex items-center gap-1">
                      {c.ok ? (
                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle size={12} className="text-red-600 shrink-0" />
                      )}
                      <span className={c.ok ? 'text-slate-700' : 'text-red-700 font-semibold'}>
                        {c.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="p-2.5 bg-slate-100 border border-slate-200 rounded flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">Peças: {formatMZN(os.partsTotal)} | MDO: {formatMZN(os.laborTotal)}</div>
                  <div className="text-slate-900 font-bold text-sm">TOTAL: {formatMZN(os.total)}</div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSendWhatsAppOS(os)}
                  className="text-[11px] h-8 px-2.5 flex items-center gap-1.5"
                >
                  <MessageSquare size={13} />
                  <span>Enviar Diagnóstico</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Nova OS */}
      <Modal
        isOpen={isNewOsModalOpen}
        onClose={() => setIsNewOsModalOpen(false)}
        title="ABRIR NOVA ORDEM DE SERVIÇO"
        size="lg"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsNewOsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" onClick={handleCreateOS}>
              Gravar OS & Checklist
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateOS} className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Matrícula do Veículo"
              value={newPlate}
              onChange={(e) => setNewPlate(e.target.value)}
              placeholder="Ex: AFG-832-MC"
              required
            />
            <Input
              label="Marca e Modelo"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              placeholder="Ex: Toyota Hilux 2.8 D4D"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nome do Cliente / Empresa"
              value={newClient}
              onChange={(e) => setNewClient(e.target.value)}
              required
            />
            <Input
              label="Telemóvel do Proprietário"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Mecânico Encarregado"
              value={newMechanic}
              onChange={(e) => setNewMechanic(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Peças (MT)"
                type="number"
                value={newParts}
                onChange={(e) => setNewParts(Number(e.target.value))}
                required
              />
              <Input
                label="MDO (MT)"
                type="number"
                value={newLabor}
                onChange={(e) => setNewLabor(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Descrição das Avarias e Serviços
            </label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full rounded border border-slate-300 p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
