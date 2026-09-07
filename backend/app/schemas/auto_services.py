from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ==========================================
# Vehicle Schemas
# ==========================================
class VehicleBase(BaseModel):
    license_plate: str = Field(..., description="Matrícula do veículo (ex: ABC-123-MC)")
    make: str = Field(..., description="Marca (ex: Toyota, Isuzu, Ford)")
    model: str = Field(..., description="Modelo (ex: Hilux GD6, Ranger, D-Max)")
    year: Optional[int] = Field(None, description="Ano de fabrico")
    vin: Optional[str] = Field(None, description="Número de Chassi / VIN")
    color: Optional[str] = Field(None, description="Cor")
    fuel_type: Optional[str] = Field("diesel", description="diesel, petrol, electric, hybrid")
    mileage_km: Optional[int] = Field(0, description="Quilometragem atual")
    engine_size: Optional[str] = Field(None, description="Cilindrada / Motor (ex: 2.8L)")
    notes: Optional[str] = None
    customer_id: Optional[int] = None


class VehicleCreate(VehicleBase):
    company_id: Optional[int] = 1


class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    fuel_type: Optional[str] = None
    mileage_km: Optional[int] = None
    engine_size: Optional[str] = None
    notes: Optional[str] = None
    customer_id: Optional[int] = None


class VehicleResponse(VehicleBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# Technician Schemas
# ==========================================
class TechnicianBase(BaseModel):
    name: str
    specialty: str = Field(..., description="mechanics, bodywork, electronics_obd, painting, tuning")
    phone: Optional[str] = None
    is_active: bool = True


class TechnicianCreate(TechnicianBase):
    company_id: Optional[int] = 1


class TechnicianResponse(TechnicianBase):
    id: int
    company_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# Service Order Item Schemas
# ==========================================
class ServiceOrderItemCreate(BaseModel):
    item_type: str = Field("labor", description="part, labor, consumable, paint_material, tuning_kit")
    description: str
    quantity: Decimal = Field(default=Decimal("1.00"), ge=Decimal("0.01"))
    unit_cost: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"))
    unit_price: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"))
    product_id: Optional[int] = None


class ServiceOrderItemResponse(ServiceOrderItemCreate):
    id: int
    service_order_id: int
    total_price: Decimal
    is_completed: bool

    class Config:
        from_attributes = True


# ==========================================
# Diagnostic Report Schemas
# ==========================================
class DiagnosticReportCreate(BaseModel):
    scanner_tool: Optional[str] = "OBD-II Pro Scanner"
    dtc_codes: List[Dict[str, Any]] = Field(default_factory=list, description="Lista de códigos de falha DTC")
    battery_voltage: Optional[Decimal] = Decimal("12.60")
    alternator_charging_voltage: Optional[Decimal] = Decimal("14.20")
    engine_compression: Optional[str] = None
    brake_pad_wear_pct: Optional[int] = 20
    road_test_notes: Optional[str] = None
    technician_recommendations: Optional[str] = None


class DiagnosticReportResponse(DiagnosticReportCreate):
    id: int
    service_order_id: int
    vehicle_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# Paint & Tuning Spec Schemas
# ==========================================
class PaintTuningSpecCreate(BaseModel):
    # Pintura & Bate-chapa
    paint_code: Optional[str] = None
    paint_finish: Optional[str] = "metallic"
    booth_temp_c: Optional[int] = 60
    coats_applied: Optional[int] = 2
    parts_to_paint: List[str] = Field(default_factory=list)
    bodywork_straightening_required: bool = False

    # Tuning & Performance
    tuning_stage: Optional[str] = None
    ecu_remap_profile: Optional[str] = None
    dyno_hp_before: Optional[int] = None
    dyno_hp_after: Optional[int] = None
    exhaust_modification: Optional[str] = None
    suspension_upgrade: Optional[str] = None
    sound_multimedia: Optional[str] = None
    lighting_upgrade: Optional[str] = None


class PaintTuningSpecResponse(PaintTuningSpecCreate):
    id: int
    service_order_id: int

    class Config:
        from_attributes = True


# ==========================================
# Service Order (OS) Schemas
# ==========================================
class ServiceOrderCreate(BaseModel):
    company_id: Optional[int] = 1
    vehicle_id: Optional[int] = None
    # Se veículo novo for criado na mesma requisição:
    vehicle_data: Optional[VehicleBase] = None
    
    customer_id: Optional[int] = None
    technician_id: Optional[int] = None
    service_type: str = Field(default="maintenance", description="maintenance, bodywork_chapa, diagnosis, painting, tuning, full_service")
    
    entry_mileage: Optional[int] = None
    fuel_level: Optional[str] = "1/2"
    visible_damages: List[Dict[str, Any]] = Field(default_factory=list)
    belongings_left: Optional[str] = None
    customer_complaint: Optional[str] = None
    diagnostic_summary: Optional[str] = None
    estimated_delivery: Optional[datetime] = None

    items: List[ServiceOrderItemCreate] = Field(default_factory=list)
    discount: Optional[Decimal] = Decimal("0.00")
    iva_rate: Optional[Decimal] = Decimal("16.00")

    diagnostic_data: Optional[DiagnosticReportCreate] = None
    paint_tuning_data: Optional[PaintTuningSpecCreate] = None


class ServiceOrderStatusUpdate(BaseModel):
    status: str = Field(..., description="quote, approved, in_progress, paint_booth, quality_test, ready, invoiced, cancelled")
    notes: Optional[str] = None


class ServiceOrderResponse(BaseModel):
    id: int
    company_id: int
    order_number: str
    vehicle_id: int
    customer_id: Optional[int]
    technician_id: Optional[int]
    service_type: str
    status: str
    
    entry_date: datetime
    estimated_delivery: Optional[datetime]
    completed_at: Optional[datetime]
    entry_mileage: Optional[int]
    fuel_level: Optional[str]
    visible_damages: List[Any]
    belongings_left: Optional[str]
    customer_complaint: Optional[str]
    diagnostic_summary: Optional[str]

    total_parts: Decimal
    total_labor: Decimal
    discount: Decimal
    iva_rate: Decimal
    iva_amount: Decimal
    total_final: Decimal
    sale_id: Optional[int]

    created_at: datetime
    updated_at: datetime

    vehicle: Optional[VehicleResponse] = None
    technician: Optional[TechnicianResponse] = None
    items: List[ServiceOrderItemResponse] = Field(default_factory=list)
    diagnostic_reports: List[DiagnosticReportResponse] = Field(default_factory=list)
    paint_tuning_specs: List[PaintTuningSpecResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


# ==========================================
# Dashboard & KPI Statistics
# ==========================================
class WorkshopStatsResponse(BaseModel):
    company_id: int
    total_active_orders: int
    in_boxes_count: int
    in_paint_booth_count: int
    in_diagnosis_count: int
    in_tuning_count: int
    completed_today: int
    estimated_revenue_mzn: Decimal
    total_vehicles_registered: int
