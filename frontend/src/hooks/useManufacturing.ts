import { useEffect } from "react";
import { manufacturingService } from "@/services/manufacturing";
import { useManufacturingStore } from "@/store/manufacturing.store";
import {
  BudgetCalculationInput,
  CreateWorkOrderInput,
  CuttingPlanInput,
  WorkOrder,
  WorkOrderStatus,
} from "@/types/manufacturing";

export function useManufacturing() {
  const {
    workOrders,
    selectedWorkOrder,
    statusFilter,
    budgetResult,
    cuttingPlanResult,
    isLoading,
    setWorkOrders,
    selectWorkOrder,
    setStatusFilter,
    setBudgetResult,
    setCuttingPlanResult,
    setIsLoading,
    addWorkOrderToState,
    updateWorkOrderInState,
  } = useManufacturingStore();

  const fetchWorkOrders = async () => {
    setIsLoading(true);
    try {
      const data = await manufacturingService.getWorkOrders(
        statusFilter === "all" ? undefined : statusFilter
      );
      setWorkOrders(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [statusFilter]);

  const calculateBudget = async (input: BudgetCalculationInput) => {
    setIsLoading(true);
    try {
      const res = await manufacturingService.calculateBudget(input);
      setBudgetResult(res);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCuttingPlan = async (input: CuttingPlanInput) => {
    setIsLoading(true);
    try {
      const res = await manufacturingService.calculateCuttingPlan(input);
      setCuttingPlanResult(res);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkOrder = async (input: CreateWorkOrderInput): Promise<WorkOrder> => {
    const res = await manufacturingService.createWorkOrder(input);
    addWorkOrderToState(res);
    return res;
  };

  const updateWorkOrder = async (id: number, data: Partial<WorkOrder>): Promise<WorkOrder> => {
    const res = await manufacturingService.updateWorkOrder(id, data);
    updateWorkOrderInState(res);
    return res;
  };

  return {
    workOrders,
    selectedWorkOrder,
    statusFilter,
    budgetResult,
    cuttingPlanResult,
    isLoading,
    fetchWorkOrders,
    selectWorkOrder,
    setStatusFilter,
    calculateBudget,
    calculateCuttingPlan,
    createWorkOrder,
    updateWorkOrder,
  };
}
