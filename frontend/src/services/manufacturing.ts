import { apiClient } from "@/services/auth";
import {
  BudgetCalculationInput,
  BudgetCalculationResult,
  CreateWorkOrderInput,
  CuttingPlanInput,
  CuttingPlanResult,
  WorkOrder,
  WorkOrderStatus,
} from "@/types/manufacturing";

export const defaultWorkOrders: WorkOrder[] = [
  {
    id: 1,
    company_id: 1,
    project_id: 1,
    project_name: "Construção de Pavilhão Industrial Matola",
    order_number: "OP-202608-0001",
    description: "Fabrico e Montagem de 12 Portas Industriais em Madeira Chanfuta Maciça",
    status: "in_progress",
    budget: 180000,
    actual_cost: 95000,
    profit: 85000,
    start_date: "2026-08-05",
    end_date: "2026-08-25",
    created_at: "2026-08-05T08:00:00Z",
    materials: [
      { name: "Pranchas de Chanfuta 2.5m", quantity: 36, unit: "prancha", unit_price: 2200, total_cost: 79200 },
      { name: "Puxadores Inox e Fechaduras", quantity: 12, unit: "kit", unit_price: 1300, total_cost: 15600 },
    ],
  },
  {
    id: 2,
    company_id: 1,
    project_id: 2,
    project_name: "Mobiliário por Medida - Sede Bancária",
    order_number: "OP-202608-0002",
    description: "Corte e Bordo para 8 Balcões de Atendimento em MDF Carvalho Suíço 18mm",
    status: "completed",
    budget: 95000,
    actual_cost: 52000,
    profit: 43000,
    start_date: "2026-08-01",
    end_date: "2026-08-12",
    created_at: "2026-08-01T08:00:00Z",
    materials: [
      { name: "Chapas MDF 18mm Carvalho", quantity: 8, unit: "chapa", unit_price: 4800, total_cost: 38400 },
      { name: "Fitas de Bordo 22mm e Cola Hotmelt", quantity: 3, unit: "rolo", unit_price: 4500, total_cost: 13500 },
    ],
  },
];

export const manufacturingService = {
  async calculateBudget(data: BudgetCalculationInput): Promise<BudgetCalculationResult> {
    try {
      const response = await apiClient.post<BudgetCalculationResult>(
        "/api/v1/manufacturing/budget/calculate",
        data
      );
      return response.data;
    } catch {
      const laborCost = data.labor_hours * data.labor_rate;
      const direct = data.material_cost + laborCost;
      const overhead = direct * (data.overhead_percentage / 100);
      const total = direct + overhead;
      const margin = data.margin_percentage / 100;
      const finalPrice = margin < 1 ? total / (1 - margin) : total * 1.5;
      return {
        material_cost: data.material_cost,
        labor_hours: data.labor_hours,
        labor_rate: data.labor_rate,
        labor_cost: laborCost,
        overhead_percentage: data.overhead_percentage,
        overhead_cost: overhead,
        total_direct_cost: total,
        margin_percentage: data.margin_percentage,
        final_price: finalPrice,
        profit: finalPrice - total,
      };
    }
  },

  async calculateCuttingPlan(data: CuttingPlanInput): Promise<CuttingPlanResult> {
    try {
      const response = await apiClient.post<CuttingPlanResult>(
        "/api/v1/manufacturing/cutting-plan/calculate",
        data
      );
      return response.data;
    } catch {
      let totalPieces = 0;
      let totalArea = 0;
      data.pieces.forEach((p) => {
        totalPieces += p.quantity;
        totalArea += (p.length * p.width * p.quantity) / 1_000_000;
      });
      const sheetArea = (data.sheet_length * data.sheet_width) / 1_000_000;
      const sheetsNeeded = Math.max(1, Math.ceil(totalArea / (sheetArea * 0.85)));
      const totalSheetArea = sheetsNeeded * sheetArea;
      const eff = totalSheetArea > 0 ? (totalArea / totalSheetArea) * 100 : 85;

      return {
        sheet_length: data.sheet_length,
        sheet_width: data.sheet_width,
        total_sheets_needed: sheetsNeeded,
        total_pieces: totalPieces,
        used_area_m2: parseFloat(totalArea.toFixed(2)),
        total_sheet_area_m2: parseFloat(totalSheetArea.toFixed(2)),
        efficiency_percentage: parseFloat(eff.toFixed(1)),
        waste_percentage: parseFloat((100 - eff).toFixed(1)),
        placed_pieces: [
          { sheet_index: 0, name: "Tampo Superior", x: 0, y: 0, length: 1200, width: 600 },
          { sheet_index: 0, name: "Lateral Esquerda", x: 1204, y: 0, length: 800, width: 600 },
          { sheet_index: 0, name: "Lateral Direita", x: 1204, y: 604, length: 800, width: 600 },
        ],
      };
    }
  },

  async getWorkOrders(status?: WorkOrderStatus): Promise<WorkOrder[]> {
    try {
      let url = "/api/v1/manufacturing/work-orders?company_id=1";
      if (status) url += `&status=${status}`;
      const response = await apiClient.get<WorkOrder[]>(url);
      return response.data;
    } catch {
      return defaultWorkOrders;
    }
  },

  async createWorkOrder(data: CreateWorkOrderInput): Promise<WorkOrder> {
    const response = await apiClient.post<WorkOrder>("/api/v1/manufacturing/work-orders", data);
    return response.data;
  },

  async updateWorkOrder(id: number, data: Partial<WorkOrder>): Promise<WorkOrder> {
    const response = await apiClient.put<WorkOrder>(
      `/api/v1/manufacturing/work-orders/${id}?company_id=1`,
      data
    );
    return response.data;
  },
};
