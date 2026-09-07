from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.auto_services import (
    Vehicle,
    MechanicTechnician,
    ServiceOrder,
    ServiceOrderItem,
    DiagnosticReport,
    PaintTuningSpec,
)
from app.models.sale import Sale, SaleItem
from app.models.entities import Product
from app.schemas.auto_services import (
    VehicleCreate,
    VehicleUpdate,
    ServiceOrderCreate,
    ServiceOrderStatusUpdate,
    ServiceOrderItemCreate,
    DiagnosticReportCreate,
    PaintTuningSpecCreate,
    WorkshopStatsResponse,
)


class AutoServiceService:
    """
    Serviço central de gestão de Oficinas Mecânicas e Centros Automóveis TiConta.
    Cobre: Manutenção, Bate-chapa, Diagnóstico OBD-II, Estufa de Pintura e Tuning.
    """

    # ==========================================
    # 1. GESTÃO DE VEÍCULOS
    # ==========================================
    def get_or_create_vehicle(self, db: Session, vehicle_in: VehicleCreate) -> Vehicle:
        clean_plate = vehicle_in.license_plate.strip().upper()
        vehicle = (
            db.query(Vehicle)
            .filter(
                Vehicle.company_id == (vehicle_in.company_id or 1),
                Vehicle.license_plate == clean_plate,
            )
            .first()
        )
        if not vehicle:
            vehicle = Vehicle(
                company_id=vehicle_in.company_id or 1,
                customer_id=vehicle_in.customer_id,
                license_plate=clean_plate,
                make=vehicle_in.make.strip(),
                model=vehicle_in.model.strip(),
                year=vehicle_in.year,
                vin=vehicle_in.vin.strip().upper() if vehicle_in.vin else None,
                color=vehicle_in.color,
                fuel_type=vehicle_in.fuel_type or "diesel",
                mileage_km=vehicle_in.mileage_km or 0,
                engine_size=vehicle_in.engine_size,
                notes=vehicle_in.notes,
            )
            db.add(vehicle)
            db.commit()
            db.refresh(vehicle)
        else:
            # Atualizar quilometragem se fornecida superior
            if vehicle_in.mileage_km and vehicle_in.mileage_km > (vehicle.mileage_km or 0):
                vehicle.mileage_km = vehicle_in.mileage_km
                db.commit()
                db.refresh(vehicle)
        return vehicle

    def list_vehicles(
        self, db: Session, company_id: int = 1, search: Optional[str] = None
    ) -> List[Vehicle]:
        query = db.query(Vehicle).filter(Vehicle.company_id == company_id)
        if search:
            s = f"%{search.strip()}%"
            query = query.filter(
                (Vehicle.license_plate.ilike(s))
                | (Vehicle.make.ilike(s))
                | (Vehicle.model.ilike(s))
                | (Vehicle.vin.ilike(s))
            )
        return query.order_by(Vehicle.updated_at.desc()).all()

    def get_vehicle_history(self, db: Session, vehicle_id: int, company_id: int = 1) -> Dict[str, Any]:
        vehicle = (
            db.query(Vehicle)
            .filter(Vehicle.id == vehicle_id, Vehicle.company_id == company_id)
            .first()
        )
        if not vehicle:
            raise ValueError("Veículo não encontrado.")

        orders = (
            db.query(ServiceOrder)
            .filter(ServiceOrder.vehicle_id == vehicle_id)
            .order_by(ServiceOrder.entry_date.desc())
            .all()
        )
        diagnostics = (
            db.query(DiagnosticReport)
            .filter(DiagnosticReport.vehicle_id == vehicle_id)
            .order_by(DiagnosticReport.created_at.desc())
            .all()
        )

        return {
            "vehicle": vehicle,
            "total_services": len(orders),
            "service_orders": orders,
            "diagnostic_reports": diagnostics,
        }

    # ==========================================
    # 2. GESTÃO DE ORDENS DE SERVIÇO (OS)
    # ==========================================
    def generate_order_number(self, db: Session, company_id: int = 1) -> str:
        year = datetime.now().year
        count = (
            db.query(func.count(ServiceOrder.id))
            .filter(
                ServiceOrder.company_id == company_id,
                func.extract("year", ServiceOrder.created_at) == year,
            )
            .scalar()
            or 0
        )
        return f"OS-{year}/{count + 1:04d}"

    def create_service_order(self, db: Session, order_in: ServiceOrderCreate) -> ServiceOrder:
        company_id = order_in.company_id or 1

        # 1. Obter ou criar veículo
        if order_in.vehicle_id:
            vehicle = (
                db.query(Vehicle)
                .filter(Vehicle.id == order_in.vehicle_id, Vehicle.company_id == company_id)
                .first()
            )
            if not vehicle:
                raise ValueError("Veículo especificado não existe.")
        elif order_in.vehicle_data:
            vehicle = self.get_or_create_vehicle(db, order_in.vehicle_data)
        else:
            raise ValueError("É necessário associar um veículo à Ordem de Serviço.")

        order_num = self.generate_order_number(db, company_id)

        # 2. Criar cabeçalho da OS
        order = ServiceOrder(
            company_id=company_id,
            order_number=order_num,
            vehicle_id=vehicle.id,
            customer_id=order_in.customer_id or vehicle.customer_id,
            technician_id=order_in.technician_id,
            service_type=order_in.service_type,
            status="quote",  # inicia sempre como orçamento ou entrada
            entry_mileage=order_in.entry_mileage or vehicle.mileage_km,
            fuel_level=order_in.fuel_level or "1/2",
            visible_damages=order_in.visible_damages or [],
            belongings_left=order_in.belongings_left,
            customer_complaint=order_in.customer_complaint,
            diagnostic_summary=order_in.diagnostic_summary,
            estimated_delivery=order_in.estimated_delivery,
            discount=order_in.discount or Decimal("0.00"),
            iva_rate=order_in.iva_rate or Decimal("16.00"),
        )
        db.add(order)
        db.flush()  # obter ID

        # 3. Adicionar itens de peças e mão de obra
        total_parts = Decimal("0.00")
        total_labor = Decimal("0.00")

        for it in order_in.items:
            qty = it.quantity or Decimal("1.00")
            price = it.unit_price or Decimal("0.00")
            cost = it.unit_cost or Decimal("0.00")
            total_it = (qty * price).quantize(Decimal("0.01"))

            if it.item_type in ("part", "consumable", "paint_material", "tuning_kit"):
                total_parts += total_it
            else:
                total_labor += total_it

            item_rec = ServiceOrderItem(
                service_order_id=order.id,
                item_type=it.item_type,
                description=it.description,
                quantity=qty,
                unit_cost=cost,
                unit_price=price,
                total_price=total_it,
                product_id=it.product_id,
                is_completed=False,
            )
            db.add(item_rec)

        # 4. Cálculo final de impostos (IVA 16% Moçambique)
        subtotal = total_parts + total_labor - (order_in.discount or Decimal("0.00"))
        subtotal = max(Decimal("0.00"), subtotal)
        iva_amount = (subtotal * (order.iva_rate / Decimal("100.00"))).quantize(Decimal("0.01"))
        total_final = (subtotal + iva_amount).quantize(Decimal("0.01"))

        order.total_parts = total_parts
        order.total_labor = total_labor
        order.iva_amount = iva_amount
        order.total_final = total_final

        # 5. Adicionar dados opcionais de Diagnóstico e Pintura/Tuning
        if order_in.diagnostic_data:
            diag = DiagnosticReport(
                service_order_id=order.id,
                vehicle_id=vehicle.id,
                scanner_tool=order_in.diagnostic_data.scanner_tool,
                dtc_codes=order_in.diagnostic_data.dtc_codes or [],
                battery_voltage=order_in.diagnostic_data.battery_voltage or Decimal("12.60"),
                alternator_charging_voltage=order_in.diagnostic_data.alternator_charging_voltage or Decimal("14.20"),
                engine_compression=order_in.diagnostic_data.engine_compression,
                brake_pad_wear_pct=order_in.diagnostic_data.brake_pad_wear_pct or 20,
                road_test_notes=order_in.diagnostic_data.road_test_notes,
                technician_recommendations=order_in.diagnostic_data.technician_recommendations,
            )
            db.add(diag)

        if order_in.paint_tuning_data:
            pt = PaintTuningSpec(
                service_order_id=order.id,
                paint_code=order_in.paint_tuning_data.paint_code,
                paint_finish=order_in.paint_tuning_data.paint_finish or "metallic",
                booth_temp_c=order_in.paint_tuning_data.booth_temp_c or 60,
                coats_applied=order_in.paint_tuning_data.coats_applied or 2,
                parts_to_paint=order_in.paint_tuning_data.parts_to_paint or [],
                bodywork_straightening_required=order_in.paint_tuning_data.bodywork_straightening_required,
                tuning_stage=order_in.paint_tuning_data.tuning_stage,
                ecu_remap_profile=order_in.paint_tuning_data.ecu_remap_profile,
                dyno_hp_before=order_in.paint_tuning_data.dyno_hp_before,
                dyno_hp_after=order_in.paint_tuning_data.dyno_hp_after,
                exhaust_modification=order_in.paint_tuning_data.exhaust_modification,
                suspension_upgrade=order_in.paint_tuning_data.suspension_upgrade,
                sound_multimedia=order_in.paint_tuning_data.sound_multimedia,
                lighting_upgrade=order_in.paint_tuning_data.lighting_upgrade,
            )
            db.add(pt)

        db.commit()
        db.refresh(order)
        return order

    def update_order_status(
        self, db: Session, order_id: int, status_in: ServiceOrderStatusUpdate, company_id: int = 1
    ) -> ServiceOrder:
        order = (
            db.query(ServiceOrder)
            .filter(ServiceOrder.id == order_id, ServiceOrder.company_id == company_id)
            .first()
        )
        if not order:
            raise ValueError("Ordem de Serviço não encontrada.")

        valid_statuses = [
            "quote",
            "approved",
            "in_progress",
            "paint_booth",
            "quality_test",
            "ready",
            "invoiced",
            "cancelled",
        ]
        if status_in.status not in valid_statuses:
            raise ValueError(f"Estado inválido. Estados permitidos: {', '.join(valid_statuses)}")

        order.status = status_in.status
        if status_in.status in ("ready", "invoiced", "completed") and not order.completed_at:
            order.completed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(order)
        return order

    def list_service_orders(
        self,
        db: Session,
        company_id: int = 1,
        status: Optional[str] = None,
        service_type: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[ServiceOrder]:
        query = db.query(ServiceOrder).filter(ServiceOrder.company_id == company_id)
        if status:
            query = query.filter(ServiceOrder.status == status)
        if service_type:
            query = query.filter(ServiceOrder.service_type == service_type)
        if search:
            s = f"%{search.strip()}%"
            query = query.join(Vehicle).filter(
                (ServiceOrder.order_number.ilike(s))
                | (Vehicle.license_plate.ilike(s))
                | (Vehicle.make.ilike(s))
                | (Vehicle.model.ilike(s))
            )
        return query.order_by(ServiceOrder.entry_date.desc()).all()

    def get_service_order(self, db: Session, order_id: int, company_id: int = 1) -> ServiceOrder:
        order = (
            db.query(ServiceOrder)
            .filter(ServiceOrder.id == order_id, ServiceOrder.company_id == company_id)
            .first()
        )
        if not order:
            raise ValueError("Ordem de Serviço não encontrada.")
        return order

    # ==========================================
    # 3. FATURAÇÃO & CONVERSÃO EM VENDA POS
    # ==========================================
    def convert_order_to_sale(
        self, db: Session, order_id: int, payment_method: str = "cash", user_id: int = 1, company_id: int = 1
    ) -> Dict[str, Any]:
        order = self.get_service_order(db, order_id, company_id)
        if order.sale_id:
            return {
                "message": "Ordem de Serviço já faturada anteriormente.",
                "order_id": order.id,
                "sale_id": order.sale_id,
            }

        # Criar Venda Oficial TiConta com IVA
        invoice_num = f"FT {datetime.now().year}/{order.id:05d}"
        net = order.total_parts + order.total_labor - order.discount
        sale = Sale(
            company_id=company_id,
            customer_id=order.customer_id,
            user_id=user_id,
            invoice_number=invoice_num,
            total_amount=order.total_final,
            tax_amount=order.iva_amount,
            discount_amount=order.discount,
            net_amount=net,
            payment_method=payment_method,
            payment_status="completed",
        )
        db.add(sale)
        db.flush()

        order.sale_id = sale.id
        order.status = "invoiced"
        order.completed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(order)

        return {
            "message": "Ordem de Serviço faturada com sucesso em conformidade fiscal!",
            "order_number": order.order_number,
            "invoice_number": sale.invoice_number,
            "total_final": float(order.total_final),
            "sale_id": sale.id,
        }

    # ==========================================
    # 4. KPI & ESTATÍSTICAS DA OFICINA
    # ==========================================
    def get_workshop_stats(self, db: Session, company_id: int = 1) -> WorkshopStatsResponse:
        total_active = (
            db.query(func.count(ServiceOrder.id))
            .filter(
                ServiceOrder.company_id == company_id,
                ServiceOrder.status.notin_(["invoiced", "cancelled"]),
            )
            .scalar()
            or 0
        )

        in_boxes = (
            db.query(func.count(ServiceOrder.id))
            .filter(
                ServiceOrder.company_id == company_id,
                ServiceOrder.status == "in_progress",
            )
            .scalar()
            or 0
        )

        in_paint = (
            db.query(func.count(ServiceOrder.id))
            .filter(
                ServiceOrder.company_id == company_id,
                ServiceOrder.status == "paint_booth",
            )
            .scalar()
            or 0
        )

        in_diag = (
            db.query(func.count(ServiceOrder.id))
            .filter(
                ServiceOrder.company_id == company_id,
                ServiceOrder.service_type == "diagnosis",
                ServiceOrder.status.notin_(["invoiced", "cancelled"]),
            )
            .scalar()
            or 0
        )

        in_tuning = (
            db.query(func.count(ServiceOrder.id))
            .filter(
                ServiceOrder.company_id == company_id,
                ServiceOrder.service_type == "tuning",
                ServiceOrder.status.notin_(["invoiced", "cancelled"]),
            )
            .scalar()
            or 0
        )

        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        completed_today = (
            db.query(func.count(ServiceOrder.id))
            .filter(
                ServiceOrder.company_id == company_id,
                ServiceOrder.completed_at >= today_start,
            )
            .scalar()
            or 0
        )

        revenue = (
            db.query(func.sum(ServiceOrder.total_final))
            .filter(
                ServiceOrder.company_id == company_id,
                ServiceOrder.status.in_(["ready", "invoiced", "quality_test", "in_progress"]),
            )
            .scalar()
            or Decimal("0.00")
        )

        total_vehicles = (
            db.query(func.count(Vehicle.id))
            .filter(Vehicle.company_id == company_id)
            .scalar()
            or 0
        )

        return WorkshopStatsResponse(
            company_id=company_id,
            total_active_orders=total_active,
            in_boxes_count=in_boxes,
            in_paint_booth_count=in_paint,
            in_diagnosis_count=in_diag,
            in_tuning_count=in_tuning,
            completed_today=completed_today,
            estimated_revenue_mzn=revenue,
            total_vehicles_registered=total_vehicles,
        )
