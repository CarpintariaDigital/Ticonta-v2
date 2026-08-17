import math
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import structlog

from app.audit.service import log_audit
from app.models.manufacturing import (
    BudgetCalculation,
    CuttingPlan,
    WorkOrder,
    WorkOrderMaterial,
    WorkOrderStatus,
)
from app.schemas.manufacturing import (
    BudgetCalculationInput,
    BudgetCalculationResult,
    CuttingPlanInput,
    CuttingPlanResult,
    PlacedPiece,
    WorkOrderCreate,
    WorkOrderUpdate,
)

logger = structlog.get_logger()


class ManufacturingService:
    def __init__(self, db: Session):
        self.db = db

    # --- ORÇAMENTAÇÃO INTELIGENTE (MARKUP POR DENTRO & ENCARGOS) ---
    def calculate_budget(self, data: BudgetCalculationInput) -> BudgetCalculationResult:
        """
        Calcula o orçamento de carpintaria/fabrico com base na fórmula de precisão:
        1. Custo Direto = Matéria-prima + (Horas × Taxa Mão de Obra)
        2. Encargos Gerais (Overhead) = % sobre Custo Direto
        3. Custo Total = Custo Direto + Encargos Gerais
        4. Preço Final (Markup por dentro) = Custo Total / (1 - Margem%)
        5. Lucro Bruto = Preço Final - Custo Total
        """
        labor_cost = data.labor_hours * data.labor_rate
        direct_cost = data.material_cost + labor_cost

        overhead_rate = data.overhead_percentage / Decimal("100.00")
        overhead_cost = direct_cost * overhead_rate

        total_cost = direct_cost + overhead_cost

        margin_rate = data.margin_percentage / Decimal("100.00")
        if margin_rate >= Decimal("1.00"):
            margin_rate = Decimal("0.90")

        final_price = total_cost / (Decimal("1.00") - margin_rate)
        profit = final_price - total_cost

        return BudgetCalculationResult(
            material_cost=data.material_cost,
            labor_hours=data.labor_hours,
            labor_rate=data.labor_rate,
            labor_cost=round(labor_cost, 2),
            overhead_percentage=data.overhead_percentage,
            overhead_cost=round(overhead_cost, 2),
            total_direct_cost=round(total_cost, 2),
            margin_percentage=data.margin_percentage,
            final_price=round(final_price, 2),
            profit=round(profit, 2),
        )

    # --- PLANO E OTIMIZAÇÃO DE CORTE 2D (GUILHOTINA / BIN PACKING) ---
    def calculate_cutting_plan(self, data: CuttingPlanInput) -> CuttingPlanResult:
        """
        Algoritmo 2D Guillotine Strip-Packing para chapas de MDF, contraplacado e madeira maciça.
        Garante aproveitamento máximo e visualização das posições das peças na chapa.
        """
        sheet_l = data.sheet_length
        sheet_w = data.sheet_width
        blade = data.blade_thickness

        # Expandir lista de peças conforme quantidade
        all_pieces = []
        total_piece_area = 0.0
        for p in data.pieces:
            for i in range(p.quantity):
                all_pieces.append({
                    "name": p.name,
                    "length": p.length,
                    "width": p.width,
                    "area": (p.length * p.width) / 1_000_000.0,
                })
                total_piece_area += (p.length * p.width) / 1_000_000.0

        # Ordenar peças por área decrescente (Best-Fit Decreasing)
        all_pieces.sort(key=lambda x: x["length"] * x["width"], reverse=True)

        placed_pieces: List[PlacedPiece] = []
        sheets = [{"used_w": 0.0, "used_l": 0.0, "shelves": []}]

        for p in all_pieces:
            placed = False
            p_len = p["length"]
            p_wid = p["width"]

            # Tentar encaixar nas chapas existentes
            for sheet_idx, sheet in enumerate(sheets):
                for shelf in sheet["shelves"]:
                    if (
                        shelf["current_x"] + p_len + blade <= sheet_l
                        and p_wid <= shelf["height"]
                    ):
                        placed_pieces.append(
                            PlacedPiece(
                                sheet_index=sheet_idx,
                                name=p["name"],
                                x=shelf["current_x"],
                                y=shelf["y"],
                                length=p_len,
                                width=p_wid,
                            )
                        )
                        shelf["current_x"] += p_len + blade
                        placed = True
                        break

                if placed:
                    break

                # Tentar criar nova prateleira na chapa
                shelf_y = sum(s["height"] + blade for s in sheet["shelves"])
                if shelf_y + p_wid <= sheet_w and p_len <= sheet_l:
                    sheet["shelves"].append({
                        "y": shelf_y,
                        "height": p_wid,
                        "current_x": p_len + blade,
                    })
                    placed_pieces.append(
                        PlacedPiece(
                            sheet_index=sheet_idx,
                            name=p["name"],
                            x=0.0,
                            y=shelf_y,
                            length=p_len,
                            width=p_wid,
                        )
                    )
                    placed = True
                    break

            # Se não coube em nenhuma chapa, abrir nova chapa
            if not placed:
                new_sheet_idx = len(sheets)
                new_sheet = {
                    "shelves": [{
                        "y": 0.0,
                        "height": p_wid,
                        "current_x": p_len + blade,
                    }]
                }
                sheets.append(new_sheet)
                placed_pieces.append(
                    PlacedPiece(
                        sheet_index=new_sheet_idx,
                        name=p["name"],
                        x=0.0,
                        y=0.0,
                        length=p_len,
                        width=p_wid,
                    )
                )

        total_sheets = len(sheets)
        total_sheet_area = total_sheets * ((sheet_l * sheet_w) / 1_000_000.0)
        efficiency = (total_piece_area / total_sheet_area * 100.0) if total_sheet_area > 0 else 0.0
        waste = 100.0 - efficiency

        return CuttingPlanResult(
            sheet_length=sheet_l,
            sheet_width=sheet_w,
            total_sheets_needed=total_sheets,
            total_pieces=len(all_pieces),
            used_area_m2=round(total_piece_area, 4),
            total_sheet_area_m2=round(total_sheet_area, 4),
            efficiency_percentage=round(efficiency, 1),
            waste_percentage=round(waste, 1),
            placed_pieces=placed_pieces,
        )

    # --- ORDENS DE PRODUÇÃO / FABRICO (WORK ORDERS) ---
    def create_work_order(self, data: WorkOrderCreate, user_id: int) -> WorkOrder:
        order_num = f"OP-{datetime.now().strftime('%Y%m')}-{self.db.query(WorkOrder).count() + 1:04d}"

        wo = WorkOrder(
            company_id=data.company_id,
            project_id=data.project_id,
            order_number=order_num,
            description=data.description,
            budget=data.budget,
            actual_cost=Decimal("0.00"),
            start_date=data.start_date or date.today(),
            end_date=data.end_date,
            status=WorkOrderStatus.PENDING,
        )
        self.db.add(wo)
        self.db.flush()

        # Materiais vinculados à OP
        for mat in data.materials:
            m_total = mat.quantity * mat.unit_price
            m_obj = WorkOrderMaterial(
                work_order_id=wo.id,
                name=mat.name,
                quantity=mat.quantity,
                unit=mat.unit,
                unit_price=mat.unit_price,
                total_cost=m_total,
            )
            self.db.add(m_obj)

        log_audit(
            db=self.db,
            company_id=data.company_id,
            action="CREATE_WORK_ORDER",
            entity="WorkOrder",
            entity_id=wo.id,
            user_id=user_id,
            new_value={"order_number": order_num, "description": wo.description},
        )

        self.db.commit()
        self.db.refresh(wo)
        logger.info("work_order_created", work_order_id=wo.id, order_number=order_num)
        return wo

    def get_work_orders(
        self, company_id: int = 1, status: Optional[WorkOrderStatus] = None
    ) -> List[WorkOrder]:
        query = self.db.query(WorkOrder).filter(WorkOrder.company_id == company_id)
        if status:
            query = query.filter(WorkOrder.status == status)
        return query.order_by(WorkOrder.created_at.desc()).all()

    def get_work_order_by_id(self, work_order_id: int, company_id: int = 1) -> WorkOrder:
        wo = (
            self.db.query(WorkOrder)
            .filter(WorkOrder.id == work_order_id, WorkOrder.company_id == company_id)
            .first()
        )
        if not wo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ordem de Produção ID {work_order_id} não encontrada.",
            )
        return wo

    def update_work_order(
        self, work_order_id: int, data: WorkOrderUpdate, user_id: int, company_id: int = 1
    ) -> WorkOrder:
        wo = self.get_work_order_by_id(work_order_id, company_id)

        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(wo, key, val)

        self.db.commit()
        self.db.refresh(wo)
        return wo
