import { create } from "zustand";
import {
  BudgetCalculationResult,
  CuttingPlanResult,
  WorkOrder,
  WorkOrderStatus,
} from "@/types/manufacturing";

interface ManufacturingState {
  workOrders: WorkOrder[];
  selectedWorkOrder: WorkOrder | null;
  statusFilter: WorkOrderStatus | "all";
  budgetResult: BudgetCalculationResult | null;
  cuttingPlanResult: CuttingPlanResult | null;
  isLoading: boolean;

  setWorkOrders: (workOrders: WorkOrder[]) => void;
  selectWorkOrder: (selectedWorkOrder: WorkOrder | null) => void;
  setStatusFilter: (statusFilter: WorkOrderStatus | "all") => void;
  setBudgetResult: (budgetResult: BudgetCalculationResult | null) => void;
  setCuttingPlanResult: (cuttingPlanResult: CuttingPlanResult | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  addWorkOrderToState: (wo: WorkOrder) => void;
  updateWorkOrderInState: (wo: WorkOrder) => void;
}

export const useManufacturingStore = create<ManufacturingState>((set) => ({
  workOrders: [],
  selectedWorkOrder: null,
  statusFilter: "all",
  budgetResult: null,
  cuttingPlanResult: null,
  isLoading: false,

  setWorkOrders: (workOrders) => set({ workOrders }),
  selectWorkOrder: (selectedWorkOrder) => set({ selectedWorkOrder }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setBudgetResult: (budgetResult) => set({ budgetResult }),
  setCuttingPlanResult: (cuttingPlanResult) => set({ cuttingPlanResult }),
  setIsLoading: (isLoading) => set({ isLoading }),
  addWorkOrderToState: (wo) =>
    set((state) => ({ workOrders: [wo, ...state.workOrders] })),
  updateWorkOrderInState: (wo) =>
    set((state) => ({
      workOrders: state.workOrders.map((w) => (w.id === wo.id ? wo : w)),
      selectedWorkOrder: state.selectedWorkOrder?.id === wo.id ? wo : state.selectedWorkOrder,
    })),
}));
