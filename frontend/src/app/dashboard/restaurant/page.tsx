'use client';

import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle,
  Plus,
  Users,
  ChefHat,
  AlertCircle,
  Eye,
  DollarSign,
  Calendar,
  Split,
  Search,
  BookOpen,
  PieChart,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ManualMobilePaymentConfirm } from '@/components/payment/ManualMobilePaymentConfirm';
import { BankCardTerminalConnector } from '@/components/payment/BankCardTerminalConnector';

interface RestaurantTableItem {
  id: number;
  number: number;
  capacity: number;
  status: 'free' | 'occupied' | 'billing' | 'reserved';
  activeOrder?: {
    orderNumber: string;
    items: Array<{ name: string; quantity: number; price: number; notes?: string }>;
    subtotal: number;
  };
}

interface MenuItemData {
  id: number;
  name: string;
  category: 'ENTRADA' | 'PRATO' | 'SOBREMESA' | 'BEBIDA';
  price: number;
  available: boolean;
  imageEmoji: string;
}

interface KDSTicket {
  id: number;
  orderNumber: string;
  tableNumber: number;
  item: string;
  quantity: number;
  notes?: string;
  status: 'PENDENTE' | 'PREPARANDO' | 'PRONTO';
  elapsedMinutes: number;
}

const defaultMenu: MenuItemData[] = [
  { id: 1, name: 'Frango Peri-Peri no Churrasco', category: 'PRATO', price: 650, available: true, imageEmoji: '🍗' },
  { id: 2, name: 'Matapa com Camarão e Arroz', category: 'PRATO', price: 750, available: true, imageEmoji: '🍤' },
  { id: 3, name: 'Camarão Nacional Grelhado', category: 'PRATO', price: 1200, available: true, imageEmoji: '🦞' },
  { id: 4, name: 'Chamuças de Carne (4 un)', category: 'ENTRADA', price: 200, available: true, imageEmoji: '🥟' },
  { id: 5, name: 'Lulinhas Grelhadas com Alho', category: 'ENTRADA', price: 550, available: true, imageEmoji: '🦑' },
  { id: 6, name: 'Bolo de Chocolate Húmido', category: 'SOBREMESA', price: 250, available: true, imageEmoji: '🍰' },
  { id: 7, name: 'Pudim de Leite Condensado', category: 'SOBREMESA', price: 180, available: true, imageEmoji: '🍮' },
  { id: 8, name: 'Cerveja 2M 330ml', category: 'BEBIDA', price: 100, available: true, imageEmoji: '🍺' },
  { id: 9, name: 'Cerveja Laurentina Preta', category: 'BEBIDA', price: 120, available: true, imageEmoji: '🍻' },
  { id: 10, name: 'Sumo Natural de Manga', category: 'BEBIDA', price: 150, available: true, imageEmoji: '🥤' },
];

const defaultTables: RestaurantTableItem[] = [
  {
    id: 1,
    number: 1,
    capacity: 2,
    status: 'occupied',
    activeOrder: {
      orderNumber: 'PED-101',
      items: [
        { name: 'Frango Peri-Peri no Churrasco', quantity: 2, price: 650 },
        { name: 'Cerveja 2M 330ml', quantity: 3, price: 100 },
      ],
      subtotal: 1600,
    },
  },
  {
    id: 2,
    number: 2,
    capacity: 4,
    status: 'billing',
    activeOrder: {
      orderNumber: 'PED-102',
      items: [
        { name: 'Matapa com Camarão e Arroz', quantity: 2, price: 750 },
        { name: 'Chamuças de Carne (4 un)', quantity: 1, price: 200 },
        { name: 'Sumo Natural de Manga', quantity: 2, price: 150 },
      ],
      subtotal: 2000,
    },
  },
  { id: 3, number: 3, capacity: 4, status: 'free' },
  { id: 4, number: 4, capacity: 6, status: 'free' },
  { id: 5, number: 5, capacity: 2, status: 'reserved' },
  { id: 6, number: 6, capacity: 8, status: 'free' },
];

const defaultKdsTickets: KDSTicket[] = [
  { id: 101, orderNumber: 'PED-101', tableNumber: 1, item: 'Frango Peri-Peri no Churrasco', quantity: 2, status: 'PREPARANDO', elapsedMinutes: 12, notes: 'Bem picante' },
  { id: 102, orderNumber: 'PED-102', tableNumber: 2, item: 'Matapa com Camarão e Arroz', quantity: 2, status: 'PRONTO', elapsedMinutes: 18 },
  { id: 103, orderNumber: 'PED-103', tableNumber: 5, item: 'Camarão Nacional Grelhado', quantity: 1, status: 'PENDENTE', elapsedMinutes: 3, notes: 'Sem sal extra' },
];

export default function RestaurantPage() {
  const [activeTab, setActiveTab] = useState<'tables' | 'kds' | 'menu' | 'reports'>('tables');
  const [tables, setTables] = useState<RestaurantTableItem[]>(defaultTables);
  const [menu, setMenu] = useState<MenuItemData[]>(defaultMenu);
  const [kdsTickets, setKdsTickets] = useState<KDSTicket[]>(defaultKdsTickets);

  // Selected table for Order / Billing
  const [selectedTable, setSelectedTable] = useState<RestaurantTableItem | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isNewMenuItemModalOpen, setIsNewMenuItemModalOpen] = useState(false);

  // Order modal sub-tab
  const [orderModalTab, setOrderModalTab] = useState<'add' | 'active'>('add');
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Split bill states
  const [splitMethod, setSplitMethod] = useState<'EQUAL' | 'CUSTOM'>('EQUAL');
  const [splitCount, setSplitCount] = useState('2');
  const [serviceChargePct, setServiceChargePct] = useState('10');
  const [payMethod, setPayMethod] = useState('CASH');

  // Reservation Form
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('+258 84 ');
  const [resDate, setResDate] = useState(new Date().toISOString().split('T')[0]);
  const [resTime, setResTime] = useState('19:30');
  const [resGuests, setResGuests] = useState('4');
  const [resTableNum, setResTableNum] = useState('5');

  // New Menu Item Form
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState<'ENTRADA' | 'PRATO' | 'SOBREMESA' | 'BEBIDA'>('PRATO');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishEmoji, setNewDishEmoji] = useState('🍲');

  const handleOpenTableOrder = (table: RestaurantTableItem) => {
    setSelectedTable(table);
    setOrderModalTab(table.status === 'occupied' ? 'active' : 'add');
    setIsOrderModalOpen(true);
  };

  const handleOpenBill = (table: RestaurantTableItem) => {
    setSelectedTable(table);
    setIsBillModalOpen(true);
  };

  const handleAddItemToTableOrder = (item: MenuItemData) => {
    if (!selectedTable) return;
    const currentItems = selectedTable.activeOrder?.items || [];
    const existingIndex = currentItems.findIndex((i) => i.name === item.name);

    let updatedItems = [...currentItems];
    if (existingIndex >= 0) {
      updatedItems[existingIndex].quantity += 1;
    } else {
      updatedItems.push({ name: item.name, quantity: 1, price: item.price });
    }

    const subtotal = updatedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

    const updatedTable: RestaurantTableItem = {
      ...selectedTable,
      status: 'occupied',
      activeOrder: {
        orderNumber: selectedTable.activeOrder?.orderNumber || `PED-${Date.now().toString().slice(-3)}`,
        items: updatedItems,
        subtotal,
      },
    };

    setTables(tables.map((t) => (t.id === selectedTable.id ? updatedTable : t)));
    setSelectedTable(updatedTable);

    // Add to KDS
    const newKds: KDSTicket = {
      id: Date.now(),
      orderNumber: updatedTable.activeOrder!.orderNumber,
      tableNumber: selectedTable.number,
      item: item.name,
      quantity: 1,
      status: 'PENDENTE',
      elapsedMinutes: 0,
    };
    setKdsTickets([newKds, ...kdsTickets]);
  };

  const handleAdvanceKDS = (ticketId: number) => {
    setKdsTickets(
      kdsTickets.map((t) => {
        if (t.id === ticketId) {
          if (t.status === 'PENDENTE') return { ...t, status: 'PREPARANDO' };
          if (t.status === 'PREPARANDO') return { ...t, status: 'PRONTO' };
        }
        return t;
      })
    );
  };

  const handleCloseBill = () => {
    if (!selectedTable) return;
    setTables(
      tables.map((t) => (t.id === selectedTable.id ? { ...t, status: 'free', activeOrder: undefined } : t))
    );
    setIsBillModalOpen(false);
    setSelectedTable(null);
  };

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) return;
    const item: MenuItemData = {
      id: Date.now(),
      name: newDishName,
      category: newDishCategory,
      price: parseFloat(newDishPrice),
      available: true,
      imageEmoji: newDishEmoji,
    };
    setMenu([...menu, item]);
    setIsNewMenuItemModalOpen(false);
    setNewDishName('');
    setNewDishPrice('');
  };

  const filteredMenu = menu.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(menuSearch.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const getUrgencyColor = (minutes: number) => {
    if (minutes < 5) return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800 text-emerald-800';
    if (minutes <= 15) return 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 text-amber-800';
    return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800 text-red-800';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <UtensilsCrossed className="w-7 h-7 text-cyan-600" />
            Restaurante, Mapa de Mesas & KDS Cozinha
          </h1>
          <p className="text-sm text-neutral-500">
            Workstation em tempo real para salão, emissão para cozinha (KDS), divisão de contas e cardápio digital.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsReserveModalOpen(true)}
            variant="outline"
            className="flex items-center gap-1.5"
          >
            <Calendar size={15} />
            Nova Reserva
          </Button>
          <Button
            onClick={() => setIsNewMenuItemModalOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1.5"
          >
            <Plus size={15} />
            Novo Prato / Item
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6">
        <button
          onClick={() => setActiveTab('tables')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'tables'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Mapa de Mesas ({tables.length})
        </button>
        <button
          onClick={() => setActiveTab('kds')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'kds'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <ChefHat size={16} />
          KDS Cozinha ({kdsTickets.filter((t) => t.status !== 'PRONTO').length})
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'menu'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Cardápio Digital ({menu.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Relatório do Salão
        </button>
      </div>

      {/* TAB 1: MAPA DE MESAS */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((t) => {
            const isOcupada = t.status === 'occupied';
            const isConta = t.status === 'billing';
            const isLivre = t.status === 'free';
            const isReservada = t.status === 'reserved';

            return (
              <Card
                key={t.id}
                className={`transition-all border-2 ${
                  isConta
                    ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20'
                    : isOcupada
                    ? 'border-cyan-500 bg-cyan-50/20 dark:bg-cyan-950/20'
                    : isReservada
                    ? 'border-purple-400 bg-purple-50/20 dark:bg-purple-950/20'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="font-extrabold text-lg text-neutral-900 dark:text-neutral-100 font-mono">
                    MESA {t.number.toString().padStart(2, '0')}
                  </span>
                  <Badge
                    variant={
                      isConta ? 'warning' : isOcupada ? 'info' : isReservada ? 'neutral' : 'success'
                    }
                  >
                    {isConta ? 'CONTA' : isOcupada ? 'OCUPADA' : isReservada ? 'RESERVADA' : 'LIVRE'}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Users size={13} /> {t.capacity} Lugares
                    </span>
                    {t.activeOrder && (
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        {t.activeOrder.items.length} Itens
                      </span>
                    )}
                  </div>

                  {t.activeOrder && (
                    <div className="p-2.5 bg-white dark:bg-neutral-800/80 rounded border border-neutral-200 dark:border-neutral-700 text-xs flex justify-between items-center font-mono">
                      <span className="text-neutral-500">Subtotal:</span>
                      <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                        {formatMZN(t.activeOrder.subtotal)}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <Button
                      size="sm"
                      onClick={() => handleOpenTableOrder(t)}
                      className="w-full text-xs bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      {isLivre ? 'Abrir Pedido' : '🍽️ Ver / Pedir'}
                    </Button>
                    {(isOcupada || isConta) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenBill(t)}
                        className="text-xs border-amber-400 text-amber-700 hover:bg-amber-50"
                      >
                        <DollarSign size={13} />
                        Conta
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 2: KDS COZINHA */}
      {activeTab === 'kds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-neutral-900 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ChefHat className="text-emerald-400" />
              Monitor KDS Cozinha (Kitchen Display System em Tempo Real)
            </div>
            <div className="flex gap-4 text-xs font-mono">
              <span className="text-emerald-400">&lt;5 min: Rápido</span>
              <span className="text-amber-400">5-15 min: Atenção</span>
              <span className="text-red-400">&gt;15 min: Urgente</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kdsTickets.map((ticket) => (
              <Card key={ticket.id} className={`border-2 ${getUrgencyColor(ticket.elapsedMinutes)}`}>
                <CardHeader className="p-3 border-b border-inherit flex flex-row justify-between items-center">
                  <span className="font-bold font-mono">MESA {ticket.tableNumber}</span>
                  <span className="text-xs font-mono font-bold flex items-center gap-1">
                    <Clock size={12} /> {ticket.elapsedMinutes} min decorridos
                  </span>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                        {ticket.quantity}x {ticket.item}
                      </div>
                      {ticket.notes && (
                        <span className="text-xs font-medium text-red-600 dark:text-red-400 block mt-1">
                          Obs: {ticket.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-inherit">
                    <Badge variant={ticket.status === 'PRONTO' ? 'success' : ticket.status === 'PREPARANDO' ? 'info' : 'warning'}>
                      {ticket.status}
                    </Badge>
                    {ticket.status !== 'PRONTO' && (
                      <Button
                        size="sm"
                        onClick={() => handleAdvanceKDS(ticket.id)}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs h-7"
                      >
                        {ticket.status === 'PENDENTE' ? 'Iniciar Preparo ➔' : 'Marcar Pronto ✓'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {kdsTickets.length === 0 && (
              <div className="col-span-full text-center py-12 text-neutral-400">
                🎉 Todos os pedidos da cozinha estão concluídos!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CARDÁPIO DIGITAL */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Input
              placeholder="Pesquisar prato ou bebida..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full sm:w-72"
            />
            <div className="flex gap-2">
              {['ALL', 'ENTRADA', 'PRATO', 'SOBREMESA', 'BEBIDA'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                    selectedCategory === cat
                      ? 'bg-cyan-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                  }`}
                >
                  {cat === 'ALL' ? 'Todos' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMenu.map((item) => (
              <Card key={item.id} className="p-4 space-y-3">
                <div className="text-3xl text-center py-2">{item.imageEmoji}</div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{item.name}</h3>
                  <span className="text-xs text-neutral-500">{item.category}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="font-bold text-cyan-600 font-mono text-base">{formatMZN(item.price)}</span>
                  <Badge variant={item.available ? 'success' : 'neutral'}>
                    {item.available ? 'Disponível' : 'Esgotado'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RELATÓRIOS DO SALÃO */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Vendas do Dia</span>
                <div className="text-2xl font-bold text-emerald-600">{formatMZN(45800)}</div>
                <span className="text-xs text-neutral-400">28 Mesas atendidas</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Ticket Médio por Mesa</span>
                <div className="text-2xl font-bold text-cyan-600">{formatMZN(1635)}</div>
                <span className="text-xs text-neutral-400">Média por grupo de clientes</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Item Mais Vendido</span>
                <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Frango Peri-Peri</div>
                <span className="text-xs text-neutral-400">18 Unidades vendidas hoje</span>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* MODAL: PEDIDO DA MESA */}
      {isOrderModalOpen && selectedTable && (
        <Modal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          title={`Mesa ${selectedTable.number} - Gestão de Pedidos`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <button
                onClick={() => setOrderModalTab('add')}
                className={`text-sm font-semibold ${orderModalTab === 'add' ? 'text-cyan-600 font-bold' : 'text-neutral-500'}`}
              >
                🍽️ Adicionar do Cardápio
              </button>
              <button
                onClick={() => setOrderModalTab('active')}
                className={`text-sm font-semibold ${orderModalTab === 'active' ? 'text-cyan-600 font-bold' : 'text-neutral-500'}`}
              >
                📋 Pedidos Activos na Mesa ({selectedTable.activeOrder?.items.length || 0})
              </button>
            </div>

            {orderModalTab === 'add' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                {menu.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg flex justify-between items-center bg-white dark:bg-neutral-800"
                  >
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1.5">
                        <span>{item.imageEmoji}</span> {item.name}
                      </div>
                      <span className="text-xs font-bold text-cyan-600 font-mono">{formatMZN(item.price)}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddItemToTableOrder(item)}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-7 px-2.5"
                    >
                      + Pedir
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {orderModalTab === 'active' && (
              <div className="space-y-3">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-neutral-50 dark:bg-neutral-800 font-semibold">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5">Qtd</th>
                      <th className="p-2.5 text-right">Preço</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {selectedTable.activeOrder?.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-sans font-medium">{it.name}</td>
                        <td className="p-2.5 font-bold">{it.quantity}</td>
                        <td className="p-2.5 text-right">{formatMZN(it.price)}</td>
                        <td className="p-2.5 text-right font-bold">{formatMZN(it.price * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded flex justify-between items-center font-mono">
                  <span className="font-bold">Total do Pedido:</span>
                  <span className="text-lg font-bold text-cyan-600">{formatMZN(selectedTable.activeOrder?.subtotal || 0)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: FECHO DE CONTA & DIVISÃO */}
      {isBillModalOpen && selectedTable && (
        <Modal
          isOpen={isBillModalOpen}
          onClose={() => setIsBillModalOpen(false)}
          title={`Conta da Mesa ${selectedTable.number}`}
          size="md"
        >
          <div className="space-y-4 font-mono text-xs">
            {(() => {
              const subtotal = selectedTable.activeOrder?.subtotal || 0;
              const serviceCharge = subtotal * (parseFloat(serviceChargePct) / 100);
              const iva = subtotal * 0.16;
              const total = subtotal + serviceCharge + iva;
              const perPerson = parseFloat(splitCount) > 0 ? total / parseFloat(splitCount) : total;

              return (
                <>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/80 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal Consumo:</span>
                      <span className="font-bold">{formatMZN(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Serviço ({serviceChargePct}%):</span>
                      <span className="font-bold">{formatMZN(serviceCharge)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA Moçambique (16% AT):</span>
                      <span className="font-bold">{formatMZN(iva)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-neutral-300 dark:border-neutral-600 text-sm font-bold">
                      <span>TOTAL A PAGAR:</span>
                      <span className="text-cyan-600 text-base">{formatMZN(total)}</span>
                    </div>
                  </div>

                  {/* Divisão de Conta */}
                  <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg space-y-2">
                    <span className="font-bold block text-neutral-800 dark:text-neutral-200">Divisão de Conta:</span>
                    <div className="flex items-center gap-3">
                      <label className="text-xs">Dividir igualmente por:</label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={splitCount}
                        onChange={(e) => setSplitCount(e.target.value)}
                        className="w-20 font-bold"
                      />
                      <span>Pessoas</span>
                    </div>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded font-bold text-center">
                      Cada pessoa paga: {formatMZN(perPerson)}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-semibold uppercase font-mono text-neutral-700 dark:text-neutral-300">
                      Forma de Liquidação
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'CASH', label: '💵 Numerário' },
                        { id: 'MPESA', label: '📱 M-Pesa / e-Mola' },
                        { id: 'POS', label: '💳 POS Cartão' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPayMethod(m.id)}
                          className={`py-2 px-2 rounded-md border text-xs font-mono font-bold transition ${
                            payMethod === m.id
                              ? 'bg-cyan-600 text-white border-cyan-700 shadow-sm'
                              : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {payMethod === 'MPESA' ? (
                      <ManualMobilePaymentConfirm
                        amount={total}
                        provider="M-Pesa"
                        onConfirm={handleCloseBill}
                      />
                    ) : payMethod === 'POS' ? (
                      <BankCardTerminalConnector
                        amount={total}
                        onConfirm={handleCloseBill}
                      />
                    ) : (
                      <div className="flex justify-between gap-2 pt-2">
                        <Button variant="outline" onClick={() => setIsBillModalOpen(false)}>
                          Voltar
                        </Button>
                        <Button onClick={handleCloseBill} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          Confirmar em Numerário & Libertar Mesa
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </Modal>
      )}

      {/* MODAL: RESERVA */}
      {isReserveModalOpen && (
        <Modal
          isOpen={isReserveModalOpen}
          onClose={() => setIsReserveModalOpen(false)}
          title="Registar Reserva de Mesa"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Cliente</label>
              <Input value={resName} onChange={(e) => setResName(e.target.value)} placeholder="Ex: Dr. Armando Guebuza" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contacto Telefónico</label>
              <Input value={resPhone} onChange={(e) => setResPhone(e.target.value)} placeholder="+258 84 123 4567" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <Input type="date" value={resDate} onChange={(e) => setResDate(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hora</label>
                <Input type="time" value={resTime} onChange={(e) => setResTime(e.target.value)} required />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsReserveModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  alert('Reserva confirmada com sucesso!');
                  setIsReserveModalOpen(false);
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Confirmar Reserva
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: NOVO ITEM DO CARDÁPIO */}
      {isNewMenuItemModalOpen && (
        <Modal
          isOpen={isNewMenuItemModalOpen}
          onClose={() => setIsNewMenuItemModalOpen(false)}
          title="Adicionar Item ao Cardápio"
        >
          <form onSubmit={handleCreateMenuItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Prato / Bebida</label>
              <Input value={newDishName} onChange={(e) => setNewDishName(e.target.value)} placeholder="Ex: Peixe da Pedra Grelhado" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
                  value={newDishCategory}
                  onChange={(e) => setNewDishCategory(e.target.value as any)}
                >
                  <option value="ENTRADA">Entrada</option>
                  <option value="PRATO">Prato Principal</option>
                  <option value="SOBREMESA">Sobremesa</option>
                  <option value="BEBIDA">Bebida</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preço (MZN)</label>
                <Input type="number" step="10" value={newDishPrice} onChange={(e) => setNewDishPrice(e.target.value)} placeholder="850" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ícone / Emoji</label>
              <Input value={newDishEmoji} onChange={(e) => setNewDishEmoji(e.target.value)} placeholder="🐟" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsNewMenuItemModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                Guardar Item
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
