'use client';

import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Clock, 
  CheckCircle, 
  Plus, 
  Users, 
  Flame, 
  ChefHat, 
  AlertCircle,
  Eye,
  FileCheck
} from 'lucide-react';
import { useRestaurantStore, Table, KdsOrder } from '@/store/restaurantStore';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export default function RestaurantPage() {
  const { tables, kdsOrders, updateKdsStatus, openTable, closeTable } = useRestaurantStore();
  const [activeTab, setActiveTab] = useState<'tables' | 'kds'>('tables');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  return (
    <div className="space-y-6">
      {/* Top Header & Switcher */}
      <div className="panel-bevel p-4 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-cyan-700" />
            <span>Restaurante, Mapa de Mesas & KDS Cozinha</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Workstation em tempo real para salão e cozinha. Fecho de conta e emissão digital sem papel.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-300 rounded-lg">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition ${
              activeTab === 'tables'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mapa de Mesas ({tables.length})
          </button>
          <button
            onClick={() => setActiveTab('kds')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              activeTab === 'kds'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ChefHat size={14} className={activeTab === 'kds' ? 'text-emerald-400' : ''} />
            <span>KDS Cozinha ({kdsOrders.filter((k) => k.status !== 'Pronto').length})</span>
          </button>
        </div>
      </div>

      {/* View: Mapa de Mesas */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => {
            const isOcupada = table.status === 'Ocupada';
            const isConta = table.status === 'Conta Solicitada';
            return (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`panel-bevel p-4 rounded-lg cursor-pointer transition border-2 ${
                  isConta
                    ? 'border-amber-400 bg-amber-50/40'
                    : isOcupada
                    ? 'border-cyan-500 bg-cyan-50/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    MESA {table.number.toString().padStart(2, '0')}
                  </span>
                  <Badge
                    variant={isConta ? 'amber' : isOcupada ? 'cyan' : 'outline'}
                    className="font-mono text-[10px]"
                  >
                    {table.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1.5 text-xs font-mono text-slate-600">
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Lugares:</span>
                    <span className="font-semibold text-slate-800">{table.capacity} pax</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Garçom:</span>
                    <span className="font-semibold text-slate-800">{table.waiter}</span>
                  </div>
                  {isOcupada && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Abertura:</span>
                      <span className="text-slate-500">{table.openedAt}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Subtotal:</span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {formatMZN(table.currentTotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View: KDS Cozinha (Kitchen Display System) */}
      {activeTab === 'kds' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kdsOrders.map((kds) => {
            const isLate = kds.timeElapsedMin > 15;
            return (
              <div
                key={kds.id}
                className={`panel-bevel rounded-lg overflow-hidden border-2 flex flex-col justify-between ${
                  kds.status === 'Pronto'
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : isLate
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {/* KDS Ticket Header */}
                <div className="brushed-steel-header p-3 border-b border-slate-300 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-extrabold text-sm text-slate-900">
                      MESA {kds.tableNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono ml-2">
                      ({kds.id})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-700">
                    <Clock size={12} className={isLate ? 'text-red-600 animate-pulse' : 'text-slate-500'} />
                    <span className={isLate ? 'text-red-700' : ''}>{kds.timeElapsedMin}m atrás</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 space-y-2 flex-1">
                  {kds.items.map((item, i) => (
                    <div key={i} className="font-mono text-xs">
                      <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                      {item.notes && (
                        <div className="text-[11px] text-red-600 italic">
                          ⚠️ Obs: {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="pt-2 text-[10px] text-slate-400 font-mono">
                    Garçom: {kds.waiter}
                  </div>
                </div>

                {/* Status Trigger Action */}
                <div className="p-3 bg-slate-50 border-t border-slate-200">
                  {kds.status === 'Pendente' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateKdsStatus(kds.id, 'Preparando')}
                      className="w-full flex items-center justify-center gap-1.5"
                    >
                      <Flame size={14} className="text-amber-600" />
                      <span>Iniciar Preparação</span>
                    </Button>
                  )}
                  {kds.status === 'Preparando' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateKdsStatus(kds.id, 'Pronto')}
                      className="w-full flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle size={14} />
                      <span>Pronto para Servir</span>
                    </Button>
                  )}
                  {kds.status === 'Pronto' && (
                    <div className="text-center font-mono text-xs text-emerald-700 font-bold py-1">
                      ✅ Pedido Pronto na Mesa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detalhes da Mesa */}
      <Modal
        isOpen={!!selectedTable}
        onClose={() => setSelectedTable(null)}
        title={selectedTable ? `CONTROLO DA MESA ${selectedTable.number}` : ''}
        size="md"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setSelectedTable(null)}>
              Fechar
            </Button>
            {selectedTable && selectedTable.status !== 'Livre' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  closeTable(selectedTable.id);
                  setSelectedTable(null);
                }}
              >
                Fechar Conta ({formatMZN(selectedTable.currentTotal)})
              </Button>
            ) : selectedTable ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  openTable(selectedTable.id, 'Beto Garçom');
                  setSelectedTable(null);
                }}
              >
                Abrir Mesa
              </Button>
            ) : null}
          </div>
        }
      >
        {selectedTable && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="flex justify-between">
                <span>Estado:</span>
                <Badge variant={selectedTable.status === 'Livre' ? 'outline' : 'cyan'}>
                  {selectedTable.status}
                </Badge>
              </div>
              <div className="flex justify-between mt-2">
                <span>Total Acumulado:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatMZN(selectedTable.currentTotal)}
                </span>
              </div>
              <div className="flex justify-between mt-1 text-[11px] text-slate-500">
                <span>Garçom Alocado:</span>
                <span>{selectedTable.waiter}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
