"use client";

import React, { useState } from "react";
import { usePoultry } from "@/hooks/usePoultry";
import { FlockOverviewCards } from "@/components/poultry/FlockOverviewCards";
import { PerformanceMetrics } from "@/components/poultry/PerformanceMetrics";
import { ProductionForecast } from "@/components/poultry/ProductionForecast";
import { EggProductionChart } from "@/components/poultry/EggProductionChart";
import { FeedConsumptionTracker } from "@/components/poultry/FeedConsumptionTracker";
import { MortalityTracker } from "@/components/poultry/MortalityTracker";
import { HealthAlertsPanel } from "@/components/poultry/HealthAlertsPanel";
import { NewFlockForm } from "@/components/poultry/forms/NewFlockForm";
import { DailyProductionForm } from "@/components/poultry/forms/DailyProductionForm";
import { FeedConsumptionForm } from "@/components/poultry/forms/FeedConsumptionForm";
import { MortalityForm } from "@/components/poultry/forms/MortalityForm";
import { HealthForm } from "@/components/poultry/forms/HealthForm";
import { Flock } from "@/types/poultry";
import {
  Egg,
  TrendingUp,
  Scale,
  DollarSign,
  Plus,
  Building,
  HeartPulse,
  Utensils,
  AlertTriangle,
} from "lucide-react";

export default function PoultryDashboardPage() {
  const {
    farms,
    selectedFarmId,
    flocks,
    selectedFlock,
    performance,
    forecast,
    report,
    speciesFilter,
    statusFilter,
    isNewFlockOpen,
    isDailyEggOpen,
    isFeedLogOpen,
    isMortalityOpen,
    isHealthLogOpen,
    isLoading,
    setSelectedFarmId,
    setSelectedFlock,
    setSpeciesFilter,
    setStatusFilter,
    setIsNewFlockOpen,
    setIsDailyEggOpen,
    setIsFeedLogOpen,
    setIsMortalityOpen,
    setIsHealthLogOpen,
    createFlock,
    recordEggProduction,
    recordFeedConsumption,
    recordMortality,
    recordHealthIssue,
  } = usePoultry();

  const [activeFlockForAction, setActiveFlockForAction] = useState<Flock | null>(null);

  const handleOpenDailyEgg = (flock: Flock) => {
    setActiveFlockForAction(flock);
    setIsDailyEggOpen(true);
  };

  const handleOpenFeedLog = (flock: Flock) => {
    setActiveFlockForAction(flock);
    setIsFeedLogOpen(true);
  };

  const handleOpenMortality = (flock: Flock) => {
    setActiveFlockForAction(flock);
    setIsMortalityOpen(true);
  };

  const handleOpenHealthLog = (flock: Flock) => {
    setActiveFlockForAction(flock);
    setIsHealthLogOpen(true);
  };

  // Top KPIs
  const totalLiveBirds = flocks.reduce((acc, f) => acc + f.quantity_current, 0);
  const totalStartingBirds = flocks.reduce((acc, f) => acc + f.quantity_at_start, 0);
  const totalMortality = totalStartingBirds - totalLiveBirds;
  const overallMortalityRate =
    totalStartingBirds > 0 ? ((totalMortality / totalStartingBirds) * 100).toFixed(1) : "0.0";
  const totalEggHarvested = report?.total_eggs_harvested || 1420;
  const projectedRevenue = forecast?.projected_revenue_at_sale || 325000;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
            <Egg className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
              Gestão Avícola & Produção de Ovos e Frangos
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Agro TiConta
              </span>
            </h1>
            <p className="text-xs text-zinc-500">
              Acompanhamento de lotes de corte e postura, conversão alimentar (FCR) e projeção de lucros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {farms.length > 0 && (
            <select
              value={selectedFarmId || ""}
              onChange={(e) => setSelectedFarmId(parseInt(e.target.value, 10))}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs font-semibold focus:outline-none focus:border-amber-600 shadow-xs"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  🏡 {f.name} ({f.location.split(",")[0]})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsNewFlockOpen(true)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Novo Lote
          </button>
        </div>
      </div>

      {/* Top Quick Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="p-3.5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
          <span className="text-[11px] text-zinc-500 block mb-1 font-medium">Efetivo Vivo Total</span>
          <span className="text-lg md:text-xl font-extrabold text-emerald-700">
            {totalLiveBirds.toLocaleString("pt-MZ")} aves
          </span>
          <span className="text-[10px] text-zinc-400 block">em {flocks.length} lotes</span>
        </div>

        <div className="p-3.5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
          <span className="text-[11px] text-zinc-500 block mb-1 font-medium">Mortalidade Geral</span>
          <span className="text-lg md:text-xl font-extrabold text-rose-600">
            {overallMortalityRate}%
          </span>
          <span className="text-[10px] text-zinc-400 block">{totalMortality} baixas totais</span>
        </div>

        <div className="p-3.5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
          <span className="text-[11px] text-zinc-500 block mb-1 font-medium">🥚 Ovos Colhidos</span>
          <span className="text-lg md:text-xl font-extrabold text-amber-600">
            {totalEggHarvested.toLocaleString("pt-MZ")}
          </span>
          <span className="text-[10px] text-zinc-400 block">~{Math.floor(totalEggHarvested / 30)} cartelas</span>
        </div>

        <div className="p-3.5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
          <span className="text-[11px] text-zinc-500 block mb-1 font-medium">Faturamento Projetado</span>
          <span className="text-lg md:text-xl font-extrabold text-zinc-900">
            {projectedRevenue.toLocaleString("pt-MZ")} MT
          </span>
          <span className="text-[10px] text-emerald-700 block font-semibold">+51% ROI estimado</span>
        </div>
      </div>

      {/* Main Dashboard Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Flocks, Performance & Forecast (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <FlockOverviewCards
            flocks={flocks}
            selectedFlock={selectedFlock}
            onSelectFlock={setSelectedFlock}
            onOpenNewFlock={() => setIsNewFlockOpen(true)}
            onOpenDailyEgg={handleOpenDailyEgg}
            onOpenFeedLog={handleOpenFeedLog}
            onOpenMortality={handleOpenMortality}
            onOpenHealthLog={handleOpenHealthLog}
          />

          {performance && <PerformanceMetrics performance={performance} />}

          {forecast && <ProductionForecast forecast={forecast} />}
        </div>

        {/* Column 2: Egg Chart, Feed, Mortality & Health (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <EggProductionChart
            totalEggs={performance?.total_eggs_collected || 710}
            layingRatePercent={performance?.laying_percentage_current || 88.5}
          />

          <FeedConsumptionTracker
            totalFeedConsumedKg={performance?.total_feed_consumed_kg || 2850}
            averageFeedPerBirdDayGrams={performance?.average_feed_per_bird_per_day_grams || 95.5}
            fcr={performance?.feed_conversion_ratio_fcr || 1.62}
            feedType={selectedFlock?.feed_type || "Ração Crescimento 50kg"}
          />

          <MortalityTracker
            quantityStart={selectedFlock?.quantity_at_start || 1000}
            quantityCurrent={selectedFlock?.quantity_current || 978}
            mortalityRatePercent={performance?.mortality_rate_percent || 2.2}
            cumulativeMortality={performance?.cumulative_mortality || 22}
          />

          <HealthAlertsPanel onOpenNewHealth={() => setIsHealthLogOpen(true)} />
        </div>
      </div>

      {/* MODAL 1: New Flock Form */}
      {isNewFlockOpen && (
        <NewFlockForm
          farmId={selectedFarmId || 1}
          isLoading={isLoading}
          onClose={() => setIsNewFlockOpen(false)}
          onSubmit={createFlock}
        />
      )}

      {/* MODAL 2: Daily Egg Production Log */}
      {isDailyEggOpen && activeFlockForAction && (
        <DailyProductionForm
          flock={activeFlockForAction}
          isLoading={isLoading}
          onClose={() => {
            setIsDailyEggOpen(false);
            setActiveFlockForAction(null);
          }}
          onSubmit={recordEggProduction}
        />
      )}

      {/* MODAL 3: Feed Consumption Log */}
      {isFeedLogOpen && activeFlockForAction && (
        <FeedConsumptionForm
          flock={activeFlockForAction}
          isLoading={isLoading}
          onClose={() => {
            setIsFeedLogOpen(false);
            setActiveFlockForAction(null);
          }}
          onSubmit={recordFeedConsumption}
        />
      )}

      {/* MODAL 4: Mortality Log */}
      {isMortalityOpen && activeFlockForAction && (
        <MortalityForm
          flock={activeFlockForAction}
          isLoading={isLoading}
          onClose={() => {
            setIsMortalityOpen(false);
            setActiveFlockForAction(null);
          }}
          onSubmit={recordMortality}
        />
      )}

      {/* MODAL 5: Health & Medication Log */}
      {isHealthLogOpen && (
        <HealthForm
          flock={activeFlockForAction || flocks[0]}
          isLoading={isLoading}
          onClose={() => {
            setIsHealthLogOpen(false);
            setActiveFlockForAction(null);
          }}
          onSubmit={recordHealthIssue}
        />
      )}
    </div>
  );
}
