export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface WorkOrderMaterial {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_cost: number;
}

export interface WorkOrder {
  id: number;
  company_id: number;
  project_id?: number | null;
  project_name?: string | null;
  order_number: string;
  description: string;
  status: WorkOrderStatus;
  budget: number;
  actual_cost: number;
  profit: number;
  start_date: string;
  end_date?: string | null;
  created_at?: string;
  materials?: WorkOrderMaterial[];
}

export interface CuttingPiece {
  width: number;
  height: number;
  quantity: number;
  label?: string;
}

export interface CuttingLayoutPiece {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  sheet_index: number;
}

export interface CuttingPlanResult {
  total_sheets_needed: number;
  total_pieces: number;
  used_area_m2: number;
  total_sheet_area_m2: number;
  efficiency_percentage: number;
  waste_percentage: number;
  sheet_dimensions: { width: number; height: number };
  layouts: CuttingLayoutPiece[];
}

export interface BudgetCalculationResult {
  material_cost: number;
  labor_cost: number;
  overhead_cost: number;
  total_cost: number;
  profit_margin: number;
  final_price: number;
}
