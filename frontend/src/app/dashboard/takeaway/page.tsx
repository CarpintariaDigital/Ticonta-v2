'use client';

import React, { useState } from 'react';
import { 
  Bike, 
  MapPin, 
  Phone, 
  Send, 
  CheckCircle, 
  Clock, 
  Smartphone,
  Plus
} from 'lucide-react';
import { useTakeawayStore, TakeawayOrder } from '@/store/takeawayStore';
import { formatMZN } from '@/lib/currency';
import { generateSMSTakeawayText } from '@/lib/sms';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export default function TakeawayPage() {
  const { orders, dispatchOrder, markDelivered } = useTakeawayStore();
  const [selectedOrder, setSelectedOrder] = useState<TakeawayOrder | null>(null);
  const [courierName, setCourierName] = useState('Estafeta Amisse (Moto 03)');
  const [courierPhone, setCourierPhone] = useState('+258 87 400 1122');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  const handleOpenDispatch = (order: TakeawayOrder) => {
    setSelectedOrder(order);
    setIsDispatchModalOpen(true);
  };

  const handleConfirmDispatch = () => {
    if (selectedOrder) {
      dispatchOrder(selectedOrder.id, courierName, courierPhone);
      const sms = generateSMSTakeawayText(selectedOrder.orderNumber, 'A CAMINHO', courierName);
      navigator.clipboard.writeText(sms);
      alert(`SMS de tracking copiado:\n\n"${sms}"`);
      setIsDispatchModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bike size={18} className="text-purple-700" />
            <span>Takeaway, Encomendas & Despacho de Estafetas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor de encomendas para entrega ao domicílio com alertas SMS automáticos para o cliente.
          </p>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        {orders.map((order) => (
          <Card key={order.id} className="border-slate-300">
            <CardHeader className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">{order.orderNumber}</span>
                <span className="text-xs text-slate-600 font-semibold">{order.clientName}</span>
              </div>
              <Badge variant={order.status === 'Em Trânsito' ? 'purple' : order.status === 'Entregue' ? 'emerald' : 'amber'}>
                {order.status.toUpperCase()}
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-start gap-2 text-slate-700">
                <MapPin size={15} className="text-slate-500 shrink-0 mt-0.5" />
                <span className="text-[11px]">{order.address}</span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1">
                <div className="text-slate-500 uppercase text-[10px]">Itens do Pedido:</div>
                <div className="font-semibold text-slate-800">{order.itemsSummary}</div>
                <div className="text-slate-900 font-bold pt-1">Total: {formatMZN(order.total)}</div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                <div>Estafeta: <span className="font-bold text-slate-800">{order.courierName}</span></div>
                {order.smsSent && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Smartphone size={12} />
                    <span>SMS Enviado</span>
                  </span>
                )}
              </div>

              <div className="pt-1 flex gap-2">
                {order.status === 'Pronto p/ Envio' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenDispatch(order)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Send size={13} />
                    <span>Despachar com Estafeta</span>
                  </Button>
                )}
                {order.status === 'Em Trânsito' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => markDelivered(order.id)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 border-emerald-300"
                  >
                    <CheckCircle size={13} className="text-emerald-600" />
                    <span>Confirmar Entrega</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Despacho */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="DESPACHAR ENCOMENDA COM ESTAFETA"
        size="md"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsDispatchModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirmDispatch}>
              Confirmar Despacho & Copiar SMS
            </Button>
          </div>
        }
      >
        <div className="space-y-3 font-mono text-xs">
          <Input
            label="Nome do Estafeta / Moto"
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            required
          />
          <Input
            label="Contacto do Estafeta"
            value={courierPhone}
            onChange={(e) => setCourierPhone(e.target.value)}
            required
          />
        </div>
      </Modal>
    </div>
  );
}
