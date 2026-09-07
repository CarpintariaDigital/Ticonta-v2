'use client';

import React, { useState } from 'react';
import { 
  Bike, 
  Store, 
  MapPin, 
  Phone, 
  Send, 
  CheckCircle, 
  Clock, 
  Smartphone,
  Plus,
  CreditCard,
  Banknote,
  Search,
  MessageSquare
} from 'lucide-react';
import { useTakeawayStore, TakeawayOrder } from '@/store/takeawayStore';
import { formatMZN } from '@/lib/currency';
import { generateSMSTakeawayText } from '@/lib/sms';
import { openWhatsApp } from '@/lib/whatsapp';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export default function TakeawayPage() {
  const { orders, dispatchOrder, markDelivered, markPickedUp, addOrder } = useTakeawayStore();
  const [filterType, setFilterType] = useState<'all' | 'delivery' | 'pickup'>('all');
  const [selectedOrder, setSelectedOrder] = useState<TakeawayOrder | null>(null);
  const [courierName, setCourierName] = useState('Estafeta Amisse (Moto 03)');
  const [courierPhone, setCourierPhone] = useState('+258 87 400 1122');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New Order Form state
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+258 84 ');
  const [address, setAddress] = useState('');
  const [itemsSummary, setItemsSummary] = useState('');
  const [itemsValue, setItemsValue] = useState(600);
  const [deliveryFee, setDeliveryFee] = useState(150);
  const [paymentMethod, setPaymentMethod] = useState<TakeawayOrder['paymentMethod']>('M-Pesa');

  const filteredOrders = orders.filter((o) => {
    if (filterType === 'all') return true;
    return o.type === filterType;
  });

  const handleOpenDispatch = (order: TakeawayOrder) => {
    setSelectedOrder(order);
    setIsDispatchModalOpen(true);
  };

  const handleConfirmDispatch = () => {
    if (selectedOrder) {
      dispatchOrder(selectedOrder.id, courierName, courierPhone);
      const sms = generateSMSTakeawayText(selectedOrder.orderNumber, 'A CAMINHO', courierName);
      navigator.clipboard.writeText(sms);
      alert(`SMS de tracking copiado para envio:\n\n"${sms}"`);
      setIsDispatchModalOpen(false);
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !itemsSummary) return;

    const fee = orderType === 'delivery' ? Number(deliveryFee) : 0;
    const total = Number(itemsValue) + fee;

    const newOrder: TakeawayOrder = {
      id: `TK-${Date.now().toString(36).toUpperCase()}`,
      orderNumber: `#${Math.floor(500 + Math.random() * 500)}`,
      type: orderType,
      clientName,
      clientPhone,
      address: orderType === 'delivery' ? address : 'Levantamento no Balcão da Loja Central',
      deliveryFee: fee,
      itemsSummary,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'Numerário no Balcão' ? 'Pendente no Balcão' : 'Pago',
      status: orderType === 'delivery' ? 'Pronto p/ Envio' : 'Pronto p/ Levantamento',
      estimatedMinutes: orderType === 'delivery' ? 25 : 10,
      smsSent: false,
      createdAt: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
    };

    addOrder(newOrder);
    setIsNewOrderModalOpen(false);
    setClientName('');
    setItemsSummary('');
    setAddress('');
  };

  const handleSendWhatsAppReady = (order: TakeawayOrder) => {
    const msg = order.type === 'delivery'
      ? `Olá *${order.clientName}*! O seu pedido ${order.orderNumber} está pronto e a caminho com a equipa de estafetas.`
      : `Olá *${order.clientName}*! O seu pedido ${order.orderNumber} está pronto para levantamento no balcão. Total: ${formatMZN(order.total)}. Obrigado!`;
    openWhatsApp(order.clientPhone, msg);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bike size={18} className="text-purple-700" />
            <span>Takeaway, Encomendas & Despacho (Delivery vs Balcão)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Gestão unificada de entregas ao domicílio e levantamento/pagamento direto no balcão com SMS/WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Novo Pedido Takeaway</span>
          </Button>
        </div>
      </div>

      {/* Mode Filter Bar */}
      <div className="flex items-center justify-between bg-slate-200/80 p-1.5 rounded-lg border border-slate-300">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md font-bold transition ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos os Pedidos ({orders.length})
          </button>

          <button
            onClick={() => setFilterType('delivery')}
            className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 ${
              filterType === 'delivery'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike size={13} />
            <span>Entrega ao Domicílio ({orders.filter((o) => o.type === 'delivery').length})</span>
          </button>

          <button
            onClick={() => setFilterType('pickup')}
            className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 ${
              filterType === 'pickup'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store size={13} />
            <span>Levantamento no Balcão ({orders.filter((o) => o.type === 'pickup').length})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden md:inline">
          Modo Operacional Ativo
        </span>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="border-slate-300">
            <CardHeader className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">{order.orderNumber}</span>
                <span className="text-xs text-slate-700 font-semibold">{order.clientName}</span>
                <Badge variant={order.type === 'delivery' ? 'purple' : 'emerald'} className="text-[10px]">
                  {order.type === 'delivery' ? 'DELIVERY' : 'BALCÃO'}
                </Badge>
              </div>
              <Badge
                variant={
                  order.status === 'Em Trânsito'
                    ? 'purple'
                    : order.status === 'Entregue' || order.status === 'Levantado'
                    ? 'emerald'
                    : 'amber'
                }
              >
                {order.status.toUpperCase()}
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {/* Location or Pickup Notice */}
              <div className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                {order.type === 'delivery' ? (
                  <MapPin size={15} className="text-purple-600 shrink-0 mt-0.5" />
                ) : (
                  <Store size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-500 uppercase">
                    {order.type === 'delivery' ? 'Endereço de Entrega:' : 'Modalidade:'}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-900">{order.address}</div>
                </div>
              </div>

              {/* Items Summary & Financials */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1">
                <div className="text-slate-500 uppercase text-[10px]">Itens do Pedido:</div>
                <div className="font-semibold text-slate-800 text-[11px]">{order.itemsSummary}</div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                  <span className="text-[10px] text-slate-500">
                    {order.type === 'delivery' && order.deliveryFee > 0 ? `Taxa Entrega: ${formatMZN(order.deliveryFee)}` : 'Sem Taxa de Entrega'}
                  </span>
                  <span className="text-slate-900 font-bold text-sm">TOTAL: {formatMZN(order.total)}</span>
                </div>
              </div>

              {/* Payment and Courier details */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 border-t border-slate-100 pt-2 gap-2">
                <div>
                  <span className="text-slate-500">Pagamento: </span>
                  <span className="font-bold text-slate-800">{order.paymentMethod}</span>
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    order.paymentStatus === 'Pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>

                {order.type === 'delivery' && (
                  <div>
                    <span className="text-slate-500">Estafeta: </span>
                    <span className="font-bold text-slate-800">{order.courierName || 'Pendente'}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-1 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendWhatsAppReady(order)}
                  className="text-[11px] flex items-center justify-center gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                >
                  <MessageSquare size={13} className="text-emerald-600" />
                  <span>WhatsApp Cliente</span>
                </Button>

                {order.type === 'delivery' ? (
                  order.status === 'Pronto p/ Envio' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenDispatch(order)}
                      className="text-[11px] flex items-center justify-center gap-1.5"
                    >
                      <Send size={13} />
                      <span>Despachar Moto</span>
                    </Button>
                  ) : order.status === 'Em Trânsito' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => markDelivered(order.id)}
                      className="text-[11px] flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-300"
                    >
                      <CheckCircle size={13} className="text-emerald-600" />
                      <span>Confirmar Entrega</span>
                    </Button>
                  ) : (
                    <div className="text-center font-bold text-emerald-700 py-1 text-[11px]">
                      ✅ Entrega Concluída
                    </div>
                  )
                ) : (
                  order.status === 'Pronto p/ Levantamento' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => markPickedUp(order.id)}
                      className="text-[11px] flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle size={13} />
                      <span>Registar Levantamento</span>
                    </Button>
                  ) : (
                    <div className="text-center font-bold text-emerald-700 py-1 text-[11px]">
                      ✅ Levantado no Balcão
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Despacho com Estafeta */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="DESPACHAR ENCOMENDA COM ESTAFETA"
        size="md"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsDispatchModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="md" onClick={handleConfirmDispatch}>Confirmar Despacho & Copiar SMS</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input label="Nome do Estafeta / Moto" value={courierName} onChange={(e) => setCourierName(e.target.value)} required />
          <Input label="Contacto do Estafeta" value={courierPhone} onChange={(e) => setCourierPhone(e.target.value)} required />
        </div>
      </Modal>

      {/* Modal Novo Pedido Takeaway com Seleção Explícita de Modalidade */}
      <Modal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        title="REGISTAR NOVO PEDIDO TAKEAWAY"
        size="lg"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsNewOrderModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="md" onClick={handleCreateOrder}>
              Gravar Pedido ({formatMZN(Number(itemsValue) + (orderType === 'delivery' ? Number(deliveryFee) : 0))})
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          {/* Modalidade Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase font-mono">
              Modalidade do Pedido
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`py-3 px-4 rounded-lg border flex items-center justify-center gap-2 font-bold text-xs transition ${
                  orderType === 'delivery'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Bike size={18} />
                <span>Entrega ao Domicílio (Delivery)</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`py-3 px-4 rounded-lg border flex items-center justify-center gap-2 font-bold text-xs transition ${
                  orderType === 'pickup'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Store size={18} />
                <span>Levantamento no Balcão (Takeaway)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Nome do Cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
            <Input label="Telemóvel (WhatsApp/SMS)" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required />
          </div>

          {orderType === 'delivery' && (
            <Input
              label="Endereço de Entrega (Bairro / Rua / Nº / Ponto de Referência)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Bairro Central, Av. 24 de Julho, Prédio 10"
              required
            />
          )}

          <Input
            label="Resumo dos Itens do Pedido"
            value={itemsSummary}
            onChange={(e) => setItemsSummary(e.target.value)}
            placeholder="Ex: 2x Frango Assado + 1x Arroz + 2x Bebidas"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Valor dos Itens (MT)"
              type="number"
              value={itemsValue}
              onChange={(e) => setItemsValue(Number(e.target.value))}
              required
            />
            {orderType === 'delivery' ? (
              <Input
                label="Taxa de Entrega (MT)"
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                required
              />
            ) : (
              <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] flex items-center text-slate-500">
                Taxa de Entrega: 0,00 MT (Levantamento no Balcão)
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Método de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as TakeawayOrder['paymentMethod'])}
                className="w-full h-9 rounded border border-slate-300 bg-white px-2 text-xs"
              >
                <option value="M-Pesa">M-Pesa</option>
                <option value="e-Mola">e-Mola</option>
                <option value="Numerário no Balcão">Numerário no Balcão</option>
                <option value="POS Cartão">POS / Cartão</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
