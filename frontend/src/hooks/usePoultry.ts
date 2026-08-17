import { useCallback, useEffect } from "react";
import { usePoultryStore } from "@/store/poultry.store";
import { poultryService } from "@/services/poultry";
import {
  FarmCreateInput,
  FlockCreateInput,
  EggProductionInput,
  FeedConsumptionInput,
  HealthRecordInput,
  MortalityRecordInput,
} from "@/types/poultry";

export function usePoultry() {
  const store = usePoultryStore();

  const fetchFarms = useCallback(
    async (companyId = 1) => {
      store.setIsLoading(true);
      try {
        const farms = await poultryService.getFarms(companyId);
        store.setFarms(farms);
        if (farms.length > 0 && !store.selectedFarmId) {
          store.setSelectedFarmId(farms[0].id);
        }
      } catch (err) {
        console.error("Erro ao buscar quintas avícolas:", err);
      } finally {
        store.setIsLoading(false);
      }
    },
    [store]
  );

  const fetchFlocks = useCallback(
    async (farmId?: number, species?: string, statusFilter?: string, companyId = 1) => {
      store.setIsLoading(true);
      try {
        const flocks = await poultryService.getFlocks(
          farmId,
          species === "all" ? undefined : species,
          statusFilter === "all" ? undefined : statusFilter,
          companyId
        );
        store.setFlocks(flocks);
        if (flocks.length > 0 && !store.selectedFlock) {
          store.setSelectedFlock(flocks[0]);
        }
      } catch (err) {
        console.error("Erro ao buscar lotes de aves:", err);
      } finally {
        store.setIsLoading(false);
      }
    },
    [store]
  );

  const fetchFlockPerformance = useCallback(
    async (flockId: number) => {
      try {
        const perf = await poultryService.getFlockPerformance(flockId);
        store.setPerformance(perf);
        return perf;
      } catch (err) {
        console.error("Erro ao buscar desempenho do lote:", err);
      }
    },
    [store]
  );

  const fetchForecast = useCallback(
    async (flockId: number) => {
      try {
        const forecast = await poultryService.getFlockForecast(flockId);
        store.setForecast(forecast);
        return forecast;
      } catch (err) {
        console.error("Erro ao buscar previsão de produção:", err);
      }
    },
    [store]
  );

  const fetchProductionReport = useCallback(
    async (farmId: number, startDate?: string, endDate?: string, companyId = 1) => {
      try {
        const report = await poultryService.getProductionReport(
          farmId,
          startDate,
          endDate,
          companyId
        );
        store.setReport(report);
        return report;
      } catch (err) {
        console.error("Erro ao gerar relatório avícola:", err);
      }
    },
    [store]
  );

  const createFarm = useCallback(
    async (data: FarmCreateInput, companyId = 1) => {
      store.setIsLoading(true);
      try {
        const farm = await poultryService.createFarm(data, companyId);
        store.setFarms([...store.farms, farm]);
        store.setSelectedFarmId(farm.id);
        store.setIsNewFarmOpen(false);
        return farm;
      } catch (err) {
        console.error("Erro ao criar quinta:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [store]
  );

  const createFlock = useCallback(
    async (data: FlockCreateInput, companyId = 1) => {
      store.setIsLoading(true);
      try {
        const flock = await poultryService.createFlock(data, companyId);
        store.addFlockToState(flock);
        store.setSelectedFlock(flock);
        store.setIsNewFlockOpen(false);
        fetchFlockPerformance(flock.id);
        fetchForecast(flock.id);
        return flock;
      } catch (err) {
        console.error("Erro ao criar lote de aves:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [fetchFlockPerformance, fetchForecast, store]
  );

  const recordEggProduction = useCallback(
    async (flockId: number, data: EggProductionInput) => {
      store.setIsLoading(true);
      try {
        const record = await poultryService.recordEggProduction(flockId, data);
        store.setIsDailyEggOpen(false);
        fetchFlockPerformance(flockId);
        return record;
      } catch (err) {
        console.error("Erro ao registar postura de ovos:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [fetchFlockPerformance, store]
  );

  const recordFeedConsumption = useCallback(
    async (flockId: number, data: FeedConsumptionInput) => {
      store.setIsLoading(true);
      try {
        const record = await poultryService.recordFeedConsumption(flockId, data);
        store.setIsFeedLogOpen(false);
        fetchFlockPerformance(flockId);
        return record;
      } catch (err) {
        console.error("Erro ao registar consumo de ração:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [fetchFlockPerformance, store]
  );

  const recordMortality = useCallback(
    async (flockId: number, data: MortalityRecordInput) => {
      store.setIsLoading(true);
      try {
        const record = await poultryService.recordMortality(flockId, data);
        store.setIsMortalityOpen(false);
        // Update local flock current quantity
        if (store.selectedFlock && store.selectedFlock.id === flockId) {
          store.setSelectedFlock({
            ...store.selectedFlock,
            quantity_current: Math.max(0, store.selectedFlock.quantity_current - data.quantity),
          });
        }
        fetchFlockPerformance(flockId);
        return record;
      } catch (err) {
        console.error("Erro ao registar mortes:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [fetchFlockPerformance, store]
  );

  const recordHealthIssue = useCallback(
    async (flockId: number, data: HealthRecordInput) => {
      store.setIsLoading(true);
      try {
        const record = await poultryService.recordHealthIssue(flockId, data);
        store.setIsHealthLogOpen(false);
        fetchFlockPerformance(flockId);
        return record;
      } catch (err) {
        console.error("Erro ao registar ocorrência sanitária:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [fetchFlockPerformance, store]
  );

  // Initial load
  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  useEffect(() => {
    if (store.selectedFarmId) {
      fetchFlocks(store.selectedFarmId, store.speciesFilter, store.statusFilter);
      fetchProductionReport(store.selectedFarmId);
    }
  }, [fetchFlocks, fetchProductionReport, store.selectedFarmId, store.speciesFilter, store.statusFilter]);

  useEffect(() => {
    if (store.selectedFlock) {
      fetchFlockPerformance(store.selectedFlock.id);
      fetchForecast(store.selectedFlock.id);
    }
  }, [fetchFlockPerformance, fetchForecast, store.selectedFlock]);

  return {
    ...store,
    fetchFarms,
    fetchFlocks,
    fetchFlockPerformance,
    fetchForecast,
    fetchProductionReport,
    createFarm,
    createFlock,
    recordEggProduction,
    recordFeedConsumption,
    recordMortality,
    recordHealthIssue,
  };
}
