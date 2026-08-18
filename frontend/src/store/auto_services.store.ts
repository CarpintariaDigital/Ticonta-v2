import { create } from "zustand";
import {
  Vehicle,
  ServiceOrder,
  ServiceOrderStatus,
  AutoServiceType,
  WorkshopStats,
} from "@/types/auto_services";
import { autoService } from "@/services/auto_services";

interface AutoServicesState {
  vehicles: Vehicle[];
  serviceOrders: ServiceOrder[];
  selectedOrder: ServiceOrder | null;
  selectedVehicle: Vehicle | null;
  stats: WorkshopStats | null;

  isLoading: boolean;
  error: string | null;

  // Filters
  filterStatus: string | "all";
  filterServiceType: string | "all";
  searchQuery: string;

  // Actions
  fetchVehicles: (search?: string, companyId?: number) => Promise<void>;
  fetchServiceOrders: (companyId?: number) => Promise<void>;
  fetchStats: (companyId?: number) => Promise<void>;
  setSelectedOrder: (order: ServiceOrder | null) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setFilterStatus: (status: string) => void;
  setFilterServiceType: (serviceType: string) => void;
  setSearchQuery: (query: string) => void;
  
  createVehicle: (data: Partial<Vehicle>, companyId?: number) => Promise<Vehicle>;
  createServiceOrder: (data: any, companyId?: number) => Promise<ServiceOrder>;
  updateOrderStatus: (orderId: number, status: ServiceOrderStatus, notes?: string, companyId?: number) => Promise<void>;
  convertOrderToSale: (orderId: number, paymentMethod?: string, companyId?: number) => Promise<any>;
}

export const useAutoServicesStore = create<AutoServicesState>((set, get) => ({
  vehicles: [],
  serviceOrders: [],
  selectedOrder: null,
  selectedVehicle: null,
  stats: null,
  isLoading: false,
  error: null,

  filterStatus: "all",
  filterServiceType: "all",
  searchQuery: "",

  fetchVehicles: async (search?: string, companyId = 1) => {
    set({ isLoading: true, error: null });
    try {
      const vehicles = await autoService.listVehicles(search, companyId);
      set({ vehicles, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Erro ao carregar viaturas" });
    }
  },

  fetchServiceOrders: async (companyId = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filterStatus, filterServiceType, searchQuery } = get();
      const orders = await autoService.listServiceOrders(
        {
          status: filterStatus === "all" ? undefined : filterStatus,
          service_type: filterServiceType === "all" ? undefined : filterServiceType,
          search: searchQuery.trim() ? searchQuery.trim() : undefined,
        },
        companyId
      );
      set({ serviceOrders: orders, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Erro ao carregar ordens de serviço" });
    }
  },

  fetchStats: async (companyId = 1) => {
    try {
      const stats = await autoService.getWorkshopStats(companyId);
      set({ stats });
    } catch (err: any) {
      console.error("Erro ao obter estatísticas da oficina:", err);
    }
  },

  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  
  setFilterStatus: (status) => {
    set({ filterStatus: status });
    get().fetchServiceOrders();
  },
  
  setFilterServiceType: (serviceType) => {
    set({ filterServiceType: serviceType });
    get().fetchServiceOrders();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchServiceOrders();
  },

  createVehicle: async (data, companyId = 1) => {
    set({ isLoading: true, error: null });
    try {
      const vehicle = await autoService.createVehicle(data, companyId);
      await get().fetchVehicles(undefined, companyId);
      set({ isLoading: false });
      return vehicle;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Erro ao registar veículo" });
      throw err;
    }
  },

  createServiceOrder: async (data, companyId = 1) => {
    set({ isLoading: true, error: null });
    try {
      const order = await autoService.createServiceOrder(data, companyId);
      await Promise.all([get().fetchServiceOrders(companyId), get().fetchStats(companyId)]);
      set({ isLoading: false });
      return order;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Erro ao abrir Ordem de Serviço" });
      throw err;
    }
  },

  updateOrderStatus: async (orderId, status, notes, companyId = 1) => {
    try {
      await autoService.updateOrderStatus(orderId, status, notes, companyId);
      await Promise.all([get().fetchServiceOrders(companyId), get().fetchStats(companyId)]);
    } catch (err: any) {
      console.error("Erro ao atualizar estado da OS:", err);
      throw err;
    }
  },

  convertOrderToSale: async (orderId, paymentMethod = "cash", companyId = 1) => {
    try {
      const res = await autoService.convertOrderToSale(orderId, paymentMethod, companyId);
      await Promise.all([get().fetchServiceOrders(companyId), get().fetchStats(companyId)]);
      return res;
    } catch (err: any) {
      console.error("Erro ao faturar OS:", err);
      throw err;
    }
  },
}));
