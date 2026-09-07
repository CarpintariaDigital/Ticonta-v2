import { useCallback, useEffect, useRef } from "react";
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
  const farms = usePoultryStore((s) => s.farms);
  const selectedFarmId = usePoultryStore((s) => s.selectedFarmId);
  const flocks = usePoultryStore((s) => s.flocks);
  const selectedFlock = usePoultryStore((s) => s.selectedFlock);
  const performance = usePoultryStore((s) => s.performance);
  const forecast = usePoultryStore((s) => s.forecast);
  const report = usePoultryStore((s) => s.report);
  const speciesFilter = usePoultryStore((s) => s.speciesFilter);
  const statusFilter = usePoultryStore((s) => s.statusFilter);

  const isNewFarmOpen = usePoultryStore((s) => s.isNewFarmOpen);
  const isNewFlockOpen = usePoultryStore((s) => s.isNewFlockOpen);
  const isDailyEggOpen = usePoultryStore((s) => s.isDailyEggOpen);
  const isFeedLogOpen = usePoultryStore((s) => s.isFeedLogOpen);
  const isMortalityOpen = usePoultryStore((s) => s.isMortalityOpen);
  const isHealthLogOpen = usePoultryStore((s) => s.isHealthLogOpen);
  const isLoading = usePoultryStore((s) => s.isLoading);

  const setFarms = usePoultryStore((s) => s.setFarms);
  const setSelectedFarmId = usePoultryStore((s) => s.setSelectedFarmId);
  const setFlocks = usePoultryStore((s) => s.setFlocks);
  const addFlockToState = usePoultryStore((s) => s.addFlockToState);
  const setSelectedFlock = usePoultryStore((s) => s.setSelectedFlock);
  const setPerformance = usePoultryStore((s) => s.setPerformance);
  const setForecast = usePoultryStore((s) => s.setForecast);
  const setReport = usePoultryStore((s) => s.setReport);
  const setSpeciesFilter = usePoultryStore((s) => s.setSpeciesFilter);
  const setStatusFilter = usePoultryStore((s) => s.setStatusFilter);
  const setIsNewFarmOpen = usePoultryStore((s) => s.setIsNewFarmOpen);
  const setIsNewFlockOpen = usePoultryStore((s) => s.setIsNewFlockOpen);
  const setIsDailyEggOpen = usePoultryStore((s) => s.setIsDailyEggOpen);
  const setIsFeedLogOpen = usePoultryStore((s) => s.setIsFeedLogOpen);
  const setIsMortalityOpen = usePoultryStore((s) => s.setIsMortalityOpen);
  const setIsHealthLogOpen = usePoultryStore((s) => s.setIsHealthLogOpen);
  const setIsLoading = usePoultryStore((s) => s.setIsLoading);

  const isInitialLoadedRef = useRef(false);

  const fetchFarms = useCallback(async (companyId = 1) => {
    setIsLoading(true);
    try {
      const data = await poultryService.getFarms(companyId);
      setFarms(data);
      if (data.length > 0) {
        const currentSelected = usePoultryStore.getState().selectedFarmId;
        if (!currentSelected) {
          setSelectedFarmId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar quintas avícolas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [setFarms, setIsLoading, setSelectedFarmId]);

  const fetchFlocks = useCallback(
    async (farmId?: number, species?: string, status?: string, companyId = 1) => {
      setIsLoading(true);
      try {
        const data = await poultryService.getFlocks(
          farmId,
          species === "all" ? undefined : species,
          status === "all" ? undefined : status,
          companyId
        );
        setFlocks(data);
        if (data.length > 0) {
          const currentFlock = usePoultryStore.getState().selectedFlock;
          if (!currentFlock || !data.some((f) => f.id === currentFlock.id)) {
            setSelectedFlock(data[0]);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar lotes de aves:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [setFlocks, setIsLoading, setSelectedFlock]
  );

  const fetchFlockPerformance = useCallback(
    async (flockId: number) => {
      try {
        const perf = await poultryService.getFlockPerformance(flockId);
        setPerformance(perf);
        return perf;
      } catch (err) {
        console.error("Erro ao buscar desempenho do lote:", err);
      }
    },
    [setPerformance]
  );

  const fetchForecast = useCallback(
    async (flockId: number) => {
      try {
        const fc = await poultryService.getFlockForecast(flockId);
        setForecast(fc);
        return fc;
      } catch (err) {
        console.error("Erro ao buscar previsão de produção:", err);
      }
    },
    [setForecast]
  );

  const fetchProductionReport = useCallback(
    async (farmId: number, startDate?: string, endDate?: string, companyId = 1) => {
      try {
        const rep = await poultryService.getProductionReport(farmId, startDate, endDate, companyId);
        setReport(rep);
        return rep;
      } catch (err) {
        console.error("Erro ao gerar relatório avícola:", err);
      }
    },
    [setReport]
  );

  const createFarm = useCallback(
    async (data: FarmCreateInput, companyId = 1) => {
      setIsLoading(true);
      try {
        const farm = await poultryService.createFarm(data, companyId);
        setFarms([...usePoultryStore.getState().farms, farm]);
        setSelectedFarmId(farm.id);
        setIsNewFarmOpen(false);
        return farm;
      } catch (err) {
        console.error("Erro ao criar quinta:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setFarms, setIsNewFarmOpen, setIsLoading, setSelectedFarmId]
  );

  const createFlock = useCallback(
    async (data: FlockCreateInput, companyId = 1) => {
      setIsLoading(true);
      try {
        const flock = await poultryService.createFlock(data, companyId);
        addFlockToState(flock);
        setSelectedFlock(flock);
        setIsNewFlockOpen(false);
        fetchFlockPerformance(flock.id);
        fetchForecast(flock.id);
        return flock;
      } catch (err) {
        console.error("Erro ao criar lote de aves:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addFlockToState, fetchFlockPerformance, fetchForecast, setIsNewFlockOpen, setIsLoading, setSelectedFlock]
  );

  const recordEggProduction = useCallback(
    async (flockId: number, data: EggProductionInput) => {
      setIsLoading(true);
      try {
        const record = await poultryService.recordEggProduction(flockId, data);
        setIsDailyEggOpen(false);
        fetchFlockPerformance(flockId);
        return record;
      } catch (err) {
        console.error("Erro ao registar postura de ovos:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFlockPerformance, setIsDailyEggOpen, setIsLoading]
  );

  const recordFeedConsumption = useCallback(
    async (flockId: number, data: FeedConsumptionInput) => {
      setIsLoading(true);
      try {
        const record = await poultryService.recordFeedConsumption(flockId, data);
        setIsFeedLogOpen(false);
        fetchFlockPerformance(flockId);
        return record;
      } catch (err) {
        console.error("Erro ao registar consumo de ração:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFlockPerformance, setIsFeedLogOpen, setIsLoading]
  );

  const recordMortality = useCallback(
    async (flockId: number, data: MortalityRecordInput) => {
      setIsLoading(true);
      try {
        const record = await poultryService.recordMortality(flockId, data);
        setIsMortalityOpen(false);
        const current = usePoultryStore.getState().selectedFlock;
        if (current && current.id === flockId) {
          setSelectedFlock({
            ...current,
            quantity_current: Math.max(0, current.quantity_current - data.quantity),
          });
        }
        fetchFlockPerformance(flockId);
        return record;
      } catch (err) {
        console.error("Erro ao registar mortes:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFlockPerformance, setIsMortalityOpen, setIsLoading, setSelectedFlock]
  );

  const recordHealthIssue = useCallback(
    async (flockId: number, data: HealthRecordInput) => {
      setIsLoading(true);
      try {
        const record = await poultryService.recordHealthIssue(flockId, data);
        setIsHealthLogOpen(false);
        fetchFlockPerformance(flockId);
        return record;
      } catch (err) {
        console.error("Erro ao registar ocorrência sanitária:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFlockPerformance, setIsHealthLogOpen, setIsLoading]
  );

  // Initial farm load (only once)
  useEffect(() => {
    if (!isInitialLoadedRef.current) {
      isInitialLoadedRef.current = true;
      fetchFarms();
    }
  }, [fetchFarms]);

  // Load flocks when selectedFarmId or filters change
  useEffect(() => {
    if (selectedFarmId) {
      fetchFlocks(selectedFarmId, speciesFilter, statusFilter);
      fetchProductionReport(selectedFarmId);
    }
  }, [fetchFlocks, fetchProductionReport, selectedFarmId, speciesFilter, statusFilter]);

  // Load performance & forecast when selectedFlock changes
  useEffect(() => {
    if (selectedFlock?.id) {
      fetchFlockPerformance(selectedFlock.id);
      fetchForecast(selectedFlock.id);
    }
  }, [fetchFlockPerformance, fetchForecast, selectedFlock?.id]);

  return {
    farms,
    selectedFarmId,
    flocks,
    selectedFlock,
    performance,
    forecast,
    report,
    speciesFilter,
    statusFilter,
    isNewFarmOpen,
    isNewFlockOpen,
    isDailyEggOpen,
    isFeedLogOpen,
    isMortalityOpen,
    isHealthLogOpen,
    isLoading,
    setFarms,
    setSelectedFarmId,
    setFlocks,
    addFlockToState,
    setSelectedFlock,
    setPerformance,
    setForecast,
    setReport,
    setSpeciesFilter,
    setStatusFilter,
    setIsNewFarmOpen,
    setIsNewFlockOpen,
    setIsDailyEggOpen,
    setIsFeedLogOpen,
    setIsMortalityOpen,
    setIsHealthLogOpen,
    setIsLoading,
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
