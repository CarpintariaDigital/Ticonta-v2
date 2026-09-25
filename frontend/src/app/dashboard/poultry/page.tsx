'use client';

import React, { useState } from 'react';
import {
  Egg,
  Plus,
  TrendingUp,
  AlertTriangle,
  Wheat,
  Activity,
  HeartPulse,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface PoultryFlockItem {
  id: string;
  flockCode: string;
  species: 'BROILER' | 'LAYER';
  breed: string;
  initialQuantity: number;
  currentQuantity: number;
  mortalityCount: number;
  mortalityRate: number;
  ageWeeks: number;
  feedConsumedKg: number;
  fcr: number;
  costPerBird: number;
  eggsToday?: number;
  eggsTotal?: number;
  startDate: string;
  status: 'ACTIVE' | 'CLOSED';
}

interface DailyEggLog {
  date: string;
  quantity: number;
  broken: number;
}

interface DailyFeedLog {
  date: string;
  kg: number;
  feedType: string;
  cost: number;
}

interface DailyMortalityLog {
  date: string;
  count: number;
  cause: string;
}

interface VaccineLog {
  date: string;
  name: string;
  dose: string;
  cost: number;
  vet: string;
}

const defaultFlocks: PoultryFlockItem[] = [
  {
    id: 'FL-001',
    flockCode: 'LOTE-2026/BR-01',
    species: 'BROILER',
    breed: 'Cobb 500 (Corte)',
    initialQuantity: 1000,
    currentQuantity: 976,
    mortalityCount: 24,
    mortalityRate: 2.4,
    ageWeeks: 5,
    feedConsumedKg: 2850,
    fcr: 1.65,
    costPerBird: 145.0,
    startDate: '2026-08-15',
    status: 'ACTIVE',
  },
  {
    id: 'FL-002',
    flockCode: 'LOTE-2026/LY-01',
    species: 'LAYER',
    breed: 'Lohmann Brown (Poedeiras)',
    initialQuantity: 500,
    currentQuantity: 492,
    mortalityCount: 8,
    mortalityRate: 1.6,
    ageWeeks: 26,
    feedConsumedKg: 5400,
    fcr: 2.1,
    costPerBird: 220.0,
    eggsToday: 468,
    eggsTotal: 18450,
    startDate: '2026-03-01',
    status: 'ACTIVE',
  },
];

export default function PoultryPage() {
  const [flocks, setFlocks] = useState<PoultryFlockItem[]>(defaultFlocks);
  const [selectedFlockId, setSelectedFlockId] = useState<string>('FL-001');
  const [activeTab, setActiveTab] = useState<'flocks' | 'daily' | 'analytics'>('flocks');

  // Logs state
  const [eggLogs, setEggLogs] = useState<DailyEggLog[]>([
    { date: '2026-09-24', quantity: 468, broken: 4 },
    { date: '2026-09-23', quantity: 460, broken: 2 },
  ]);

  const [feedLogs, setFeedLogs] = useState<DailyFeedLog[]>([
    { date: '2026-09-24', kg: 125, feedType: 'Ração Acabamento 50kg', cost: 3850 },
    { date: '2026-09-23', kg: 120, feedType: 'Ração Acabamento 50kg', cost: 3700 },
  ]);

  const [mortalityLogs, setMortalityLogs] = useState<DailyMortalityLog[]>([
    { date: '2026-09-24', count: 2, cause: 'Stress térmico' },
    { date: '2026-09-22', count: 3, cause: 'Desconhecida' },
  ]);

  const [vaccineLogs, setVaccineLogs] = useState<VaccineLog[]>([
    { date: '2026-08-20', name: 'Gumboro Intervet', dose: '1 gota ocular', cost: 1200, vet: 'Dr. Nhantumbo' },
    { date: '2026-08-28', name: 'Newcastle LaSota', dose: 'Água de bebida', cost: 850, vet: 'Dr. Nhantumbo' },
  ]);

  // Modals
  const [isNewFlockOpen, setIsNewFlockOpen] = useState(false);

  // New Flock Form
  const [flockCode, setFlockCode] = useState('');
  const [species, setSpecies] = useState<'BROILER' | 'LAYER'>('BROILER');
  const [breed, setBreed] = useState('');
  const [initialQty, setInitialQty] = useState('');
  const [costBird, setCostBird] = useState('55');
  const [flockStartDate, setFlockStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Daily forms
  const [eggQty, setEggQty] = useState('');
  const [eggBroken, setEggBroken] = useState('0');
  const [feedKg, setFeedKg] = useState('');
  const [feedType, setFeedType] = useState('Ração Crescimento');
  const [feedCost, setFeedCost] = useState('');
  const [mortalityQty, setMortalityQty] = useState('');
  const [mortalityCause, setMortalityCause] = useState('Stress térmico');
  const [vacName, setVacName] = useState('');
  const [vacDose, setVacDose] = useState('');
  const [vacCost, setVacCost] = useState('');
  const [vacVet, setVacVet] = useState('');

  const selectedFlock = flocks.find((f) => f.id === selectedFlockId) || flocks[0];

  const handleCreateFlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flockCode || !initialQty) return;
    const qty = parseInt(initialQty) || 100;
    const newF: PoultryFlockItem = {
      id: `FL-${Date.now().toString(36).toUpperCase()}`,
      flockCode,
      species,
      breed: breed || (species === 'BROILER' ? 'Cobb 500' : 'Lohmann Brown'),
      initialQuantity: qty,
      currentQuantity: qty,
      mortalityCount: 0,
      mortalityRate: 0.0,
      ageWeeks: 1,
      feedConsumedKg: 0,
      fcr: species === 'BROILER' ? 1.6 : 2.0,
      costPerBird: parseFloat(costBird) || 55,
      startDate: flockStartDate,
      status: 'ACTIVE',
    };
    setFlocks([newF, ...flocks]);
    setSelectedFlockId(newF.id);
    setIsNewFlockOpen(false);
    setFlockCode('');
    setInitialQty('');
  };

  const handleAddEgg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eggQty) return;
    const q = parseInt(eggQty);
    const b = parseInt(eggBroken) || 0;
    setEggLogs([{ date: new Date().toISOString().split('T')[0], quantity: q, broken: b }, ...eggLogs]);
    setEggQty('');
    setEggBroken('0');
  };

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedKg || !feedCost) return;
    setFeedLogs([
      {
        date: new Date().toISOString().split('T')[0],
        kg: parseFloat(feedKg),
        feedType,
        cost: parseFloat(feedCost),
      },
      ...feedLogs,
    ]);
    setFeedKg('');
    setFeedCost('');
  };

  const handleAddMortality = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mortalityQty) return;
    const count = parseInt(mortalityQty);
    setMortalityLogs([
      {
        date: new Date().toISOString().split('T')[0],
        count,
        cause: mortalityCause,
      },
      ...mortalityLogs,
    ]);
    // update flock live count
    if (selectedFlock) {
      setFlocks(
        flocks.map((f) => {
          if (f.id === selectedFlock.id) {
            const newMort = f.mortalityCount + count;
            const newLive = Math.max(0, f.initialQuantity - newMort);
            const rate = roundToTwo((newMort / f.initialQuantity) * 100);
            return {
              ...f,
              mortalityCount: newMort,
              currentQuantity: newLive,
              mortalityRate: rate,
            };
          }
          return f;
        })
      );
    }
    setMortalityQty('');
  };

  const handleAddVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacName || !vacCost) return;
    setVaccineLogs([
      {
        date: new Date().toISOString().split('T')[0],
        name: vacName,
        dose: vacDose,
        cost: parseFloat(vacCost),
        vet: vacVet,
      },
      ...vaccineLogs,
    ]);
    setVacName('');
    setVacDose('');
    setVacCost('');
    setVacVet('');
  };

  const roundToTwo = (num: number) => Math.round(num * 100) / 100;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Egg className="w-7 h-7 text-amber-600" />
            Avicultura & Produção Agropecuária
          </h1>
          <p className="text-sm text-neutral-500">
            Controlo de lotes de frangos de corte e poedeiras: ração, ovos, mortalidade, conversão alimentar (FCR) e custo por ave.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsNewFlockOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
          >
            <Plus size={15} />
            Novo Lote de Aves
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6">
        <button
          onClick={() => setActiveTab('flocks')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'flocks'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Lotes Activos ({flocks.length})
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'daily'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Registo Diário: {selectedFlock?.flockCode}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'analytics'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Análise de Custos & Abate
        </button>
      </div>

      {/* TAB 1: LOTES ACTIVOS */}
      {activeTab === 'flocks' && (
        <div className="space-y-6">
          {/* Mortality Alert Banner if any flock > 5% */}
          {flocks.some((f) => f.mortalityRate > 5) && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-800 dark:text-red-300">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <div>
                <span className="font-bold text-sm">Alerta de Mortalidade Elevada (&gt;5%): </span>
                <span className="text-xs">
                  Existem lotes com taxa de mortalidade anormal. Verifique as condições sanitárias e ventilação do aviário.
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flocks.map((f) => (
              <Card
                key={f.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-neutral-200 dark:border-neutral-800"
                onClick={() => {
                  setSelectedFlockId(f.id);
                  setActiveTab('daily');
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <CardTitle className="text-lg font-bold">{f.flockCode}</CardTitle>
                    <span className="text-xs text-neutral-500">{f.breed}</span>
                  </div>
                  <Badge variant={f.species === 'BROILER' ? 'warning' : 'info'}>
                    {f.species === 'BROILER' ? '🐔 Frango de Corte' : '🥚 Poedeiras'}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Aves Vivas:</span>
                      <span className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                        {f.currentQuantity} <span className="text-xs text-neutral-400">/ {f.initialQuantity}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Idade Atual:</span>
                      <span className="font-bold text-base text-neutral-900 dark:text-neutral-100">{f.ageWeeks} Semanas</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Taxa de Mortalidade:</span>
                      <span className={`font-bold ${f.mortalityRate > 5 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {f.mortalityRate}% ({f.mortalityCount} aves)
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Conversão Alimentar (FCR):</span>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">{f.fcr}</span>
                    </div>
                  </div>

                  {f.species === 'LAYER' && f.eggsToday && (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded flex justify-between items-center text-xs">
                      <span className="font-semibold text-amber-800 dark:text-amber-400">Postura de Ovos Hoje:</span>
                      <span className="font-bold text-amber-900 dark:text-amber-300">
                        {f.eggsToday} Ovos ({Math.round((f.eggsToday / f.currentQuantity) * 100)}% de postura)
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                    <span className="text-xs text-neutral-500">
                      Custo Unitário: <strong className="text-neutral-900 dark:text-neutral-100">{formatMZN(f.costPerBird)} /ave</strong>
                    </span>
                    <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                      Abrir Registo <ArrowRight size={13} />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REGISTO DIÁRIO */}
      {activeTab === 'daily' && selectedFlock && (
        <div className="space-y-6">
          {/* Header KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Aves Vivas</span>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{selectedFlock.currentQuantity}</div>
                <span className="text-xs text-neutral-400">De {selectedFlock.initialQuantity} iniciais</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Mortalidade Acumulada</span>
                <div className={`text-2xl font-bold ${selectedFlock.mortalityRate > 5 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {selectedFlock.mortalityRate}%
                </div>
                <span className="text-xs text-neutral-400">{selectedFlock.mortalityCount} aves perdidas</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">FCR (Conversão)</span>
                <div className="text-2xl font-bold text-blue-600">{selectedFlock.fcr}</div>
                <span className="text-xs text-neutral-400">Kg ração / kg peso</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Custo Unitário Atual</span>
                <div className="text-2xl font-bold text-amber-600">{formatMZN(selectedFlock.costPerBird)}</div>
                <span className="text-xs text-neutral-400">Ração + vacinas + pinto</span>
              </CardContent>
            </Card>
          </div>

          {/* Form Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ovos (se LAYER) ou Ração */}
            {selectedFlock.species === 'LAYER' && (
              <Card>
                <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Egg className="w-4 h-4 text-amber-600" />
                    🥚 Registo de Postura de Ovos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <form onSubmit={handleAddEgg} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Ovos Colhidos</label>
                        <Input
                          type="number"
                          value={eggQty}
                          onChange={(e) => setEggQty(e.target.value)}
                          placeholder="Ex: 450"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Ovos Rachados</label>
                        <Input
                          type="number"
                          value={eggBroken}
                          onChange={(e) => setEggBroken(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <Button type="submit" size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                      Registar Postura de Ovos
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Consumo de Ração */}
            <Card>
              <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Wheat className="w-4 h-4 text-emerald-600" />
                  🌾 Consumo de Ração Diária
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleAddFeed} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Kg Consumidos</label>
                      <Input
                        type="number"
                        step="1"
                        value={feedKg}
                        onChange={(e) => setFeedKg(e.target.value)}
                        placeholder="Ex: 125"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Custo Total (MZN)</label>
                      <Input
                        type="number"
                        step="10"
                        value={feedCost}
                        onChange={(e) => setFeedCost(e.target.value)}
                        placeholder="Ex: 3850"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Registar Consumo de Ração
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Mortalidade */}
            <Card>
              <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  💀 Registo de Mortalidade
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleAddMortality} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Aves Mortas</label>
                      <Input
                        type="number"
                        value={mortalityQty}
                        onChange={(e) => setMortalityQty(e.target.value)}
                        placeholder="Ex: 2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Causa Provável</label>
                      <Input
                        value={mortalityCause}
                        onChange={(e) => setMortalityCause(e.target.value)}
                        placeholder="Ex: Asfixia / Calor"
                      />
                    </div>
                  </div>
                  <Button type="submit" size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Registar Mortalidade
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Vacina e Sanidade */}
            <Card>
              <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-purple-600" />
                  💉 Vacinação e Sanidade
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleAddVaccine} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Nome Vacina/Medicamento</label>
                      <Input
                        value={vacName}
                        onChange={(e) => setVacName(e.target.value)}
                        placeholder="Ex: Newcastle LaSota"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Custo (MZN)</label>
                      <Input
                        type="number"
                        value={vacCost}
                        onChange={(e) => setVacCost(e.target.value)}
                        placeholder="Ex: 850"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Registar Tratamento
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: ANÁLISE DE CUSTOS & ABATE */}
      {activeTab === 'analytics' && selectedFlock && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demonstrativo de Custos e Projeção de Abate ({selectedFlock.flockCode})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span className="text-xs text-neutral-500 block">Custo Total Acumulado</span>
                  <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {formatMZN(selectedFlock.costPerBird * selectedFlock.currentQuantity)}
                  </span>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span className="text-xs text-neutral-500 block">Custo Médio por Ave Viva</span>
                  <span className="text-2xl font-bold text-amber-600">
                    {formatMZN(selectedFlock.costPerBird)}
                  </span>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold block">
                    Receita Prevista (Venda a 220 MZN/ave)
                  </span>
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {formatMZN(selectedFlock.currentQuantity * 220)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: NOVO LOTE */}
      {isNewFlockOpen && (
        <Modal
          isOpen={isNewFlockOpen}
          onClose={() => setIsNewFlockOpen(false)}
          title="Registar Novo Lote de Aves"
        >
          <form onSubmit={handleCreateFlock} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Código / Identificação do Lote</label>
              <Input
                value={flockCode}
                onChange={(e) => setFlockCode(e.target.value)}
                placeholder="Ex: LOTE-2026/BR-02"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Produção</label>
              <select
                className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
                value={species}
                onChange={(e) => setSpecies(e.target.value as 'BROILER' | 'LAYER')}
              >
                <option value="BROILER">🐔 Frango de Corte (Broiler)</option>
                <option value="LAYER">🥚 Galinha Poedeira (Ovos)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade Inicial de Pintos</label>
                <Input
                  type="number"
                  value={initialQty}
                  onChange={(e) => setInitialQty(e.target.value)}
                  placeholder="1000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Custo do Pinto (MZN)</label>
                <Input
                  type="number"
                  step="0.5"
                  value={costBird}
                  onChange={(e) => setCostBird(e.target.value)}
                  placeholder="55"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data de Entrada no Pavilhão</label>
              <Input
                type="date"
                value={flockStartDate}
                onChange={(e) => setFlockStartDate(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewFlockOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Criar Lote
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
