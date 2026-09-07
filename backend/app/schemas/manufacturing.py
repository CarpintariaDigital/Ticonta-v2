from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.manufacturing import WorkOrderStatus


# Budget Calculation Schemas
class BudgetCalculationInput(BaseModel):
    material_cost: Decimal = Field(..., ge=0, description="Custo total de matéria-prima (MZN)")
    labor_hours: Decimal = Field(..., ge=0, description="Horas estimadas de trabalho de marcenaria/soldadura")
    labor_rate: Decimal = Field(default=Decimal("250.00"), ge=0, description="Valor/hora da mão de obra (MZN)")
    overhead_percentage: Decimal = Field(default=Decimal("15.00"), ge=0, description="Custos indiretos / desgaste máquinas (%)")
    margin_percentage: Decimal = Field(default=Decimal("30.00"), ge=0, description="Margem de lucro desejada (%)")


class BudgetCalculationResult(BaseModel):
    material_cost: Decimal
    labor_hours: Decimal
    labor_rate: Decimal
    labor_cost: Decimal
    overhead_percentage: Decimal
    overhead_cost: Decimal
    total_direct_cost: Decimal
    margin_percentage: Decimal
    final_price: Decimal
    profit: Decimal


# Cutting Plan Schemas
class PieceInput(BaseModel):
    name: str = "Peça"
    length: float = Field(..., gt=0, description="Comprimento em mm")
    width: float = Field(..., gt=0, description="Largura em mm")
    quantity: int = Field(default=1, ge=1)


class CuttingPlanInput(BaseModel):
    sheet_length: float = Field(default=2750.0, gt=0, description="Comprimento padrão da chapa MDF/Madeira (mm)")
    sheet_width: float = Field(default=1830.0, gt=0, description="Largura padrão da chapa MDF/Madeira (mm)")
    blade_thickness: float = Field(default=4.0, ge=0, description="Espessura da serra / corte (mm)")
    pieces: List[PieceInput]


class PlacedPiece(BaseModel):
    sheet_index: int
    name: str
    x: float
    y: float
    width: float
    length: float
    rotated: bool = False


class CuttingPlanResult(BaseModel):
    sheet_length: float
    sheet_width: float
    total_sheets_needed: int
    total_pieces: int
    used_area_m2: float
    total_sheet_area_m2: float
    efficiency_percentage: float
    waste_percentage: float
    placed_pieces: List[PlacedPiece]


# Work Order Schemas
class WorkOrderMaterialCreate(BaseModel):
    name: str
    quantity: Decimal
    unit: str = "un"
    unit_price: Decimal


class WorkOrderCreate(BaseModel):
    company_id: int = Field(default=1)
    project_id: Optional[int] = None
    description: str = Field(..., min_length=2)
    budget: Decimal = Field(default=Decimal("0.00"), ge=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    materials: List[WorkOrderMaterialCreate] = []


class WorkOrderUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[WorkOrderStatus] = None
    budget: Optional[Decimal] = None
    actual_cost: Optional[Decimal] = None
    end_date: Optional[date] = None


class WorkOrderMaterialResponse(BaseModel):
    id: int
    name: str
    quantity: Decimal
    unit: str
    unit_price: Decimal
    total_cost: Decimal

    model_config = ConfigDict(from_attributes=True)


class WorkOrderResponse(BaseModel):
    id: int
    company_id: int
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    order_number: str
    description: str
    status: WorkOrderStatus
    budget: Decimal
    actual_cost: Decimal
    profit: Decimal
    start_date: date
    end_date: Optional[date] = None
    created_at: datetime
    materials: List[WorkOrderMaterialResponse] = []

    model_config = ConfigDict(from_attributes=True)
