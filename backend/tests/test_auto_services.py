import pytest
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.entities import Company, Customer
from app.models.auto_services import Vehicle, MechanicTechnician, ServiceOrder
from app.services.auto_services import AutoServiceService
from app.schemas.auto_services import (
    VehicleCreate,
    ServiceOrderCreate,
    ServiceOrderItemCreate,
    ServiceOrderStatusUpdate,
    DiagnosticReportCreate,
    PaintTuningSpecCreate,
)


@pytest.fixture
def auto_service():
    return AutoServiceService()


@pytest.fixture
def test_setup(db_session: Session):
    # Empresa e Cliente base
    company = db_session.query(Company).filter(Company.id == 1).first()
    if not company:
        company = Company(id=1, name="Auto Garagem TiConta Lda", nuit="400999888", currency="MZN")
        db_session.add(company)
        db_session.commit()

    customer = db_session.query(Customer).filter(Customer.id == 1).first()
    if not customer:
        customer = Customer(id=1, company_id=1, name="Carlos Machava", email="carlos@gmail.com", phone="+258841234567")
        db_session.add(customer)
        db_session.commit()

    technician = db_session.query(MechanicTechnician).filter(MechanicTechnician.id == 1).first()
    if not technician:
        technician = MechanicTechnician(
            id=1,
            company_id=1,
            name="Mestre João Mecânico",
            specialty="mechanics",
            phone="+258829988776",
        )
        db_session.add(technician)
        db_session.commit()

    return {"company": company, "customer": customer, "technician": technician}


def test_create_and_query_vehicle(db_session: Session, auto_service: AutoServiceService, test_setup):
    v_in = VehicleCreate(
        company_id=1,
        customer_id=1,
        license_plate="ABC-999-MC",
        make="Toyota",
        model="Hilux 2.8 GD-6",
        year=2023,
        color="Branco Pérola",
        mileage_km=45000,
    )
    vehicle = auto_service.get_or_create_vehicle(db_session, v_in)

    assert vehicle.id is not None
    assert vehicle.license_plate == "ABC-999-MC"
    assert vehicle.make == "Toyota"
    assert vehicle.mileage_km == 45000

    # Pesquisa de veículos
    listed = auto_service.list_vehicles(db_session, company_id=1, search="Hilux")
    assert len(listed) >= 1
    assert listed[0].license_plate == "ABC-999-MC"


def test_create_service_order_maintenance_with_iva(db_session: Session, auto_service: AutoServiceService, test_setup):
    # 1. Criar Veículo
    v_in = VehicleCreate(company_id=1, customer_id=1, license_plate="MM-44-55", make="Ford", model="Ranger 3.2", year=2021)
    veh = auto_service.get_or_create_vehicle(db_session, v_in)

    # 2. Criar OS de Manutenção Periódica
    order_in = ServiceOrderCreate(
        company_id=1,
        vehicle_id=veh.id,
        customer_id=1,
        technician_id=1,
        service_type="maintenance",
        entry_mileage=60000,
        fuel_level="3/4",
        customer_complaint="Revisão dos 60.000 KM e ruído nos travões dianteiros",
        items=[
            ServiceOrderItemCreate(item_type="part", description="Óleo Sintético 5W30 (8L)", quantity=Decimal("1.00"), unit_price=Decimal("4500.00")),
            ServiceOrderItemCreate(item_type="part", description="Filtro de Óleo & Combustível", quantity=Decimal("1.00"), unit_price=Decimal("1500.00")),
            ServiceOrderItemCreate(item_type="part", description="Pastilhas de Travão Dianteiras", quantity=Decimal("1.00"), unit_price=Decimal("3000.00")),
            ServiceOrderItemCreate(item_type="labor", description="Mão-de-Obra Revisão & Troca de Travões", quantity=Decimal("2.50"), unit_price=Decimal("1200.00")),
        ],
        discount=Decimal("0.00"),
        iva_rate=Decimal("16.00"),
    )

    order = auto_service.create_service_order(db_session, order_in)

    assert order.order_number.startswith("OS-")
    assert order.total_parts == Decimal("9000.00")   # 4500 + 1500 + 3000
    assert order.total_labor == Decimal("3000.00")   # 2.5 * 1200
    subtotal = Decimal("12000.00")
    expected_iva = Decimal("1920.00")                # 16% de 12.000
    expected_total = Decimal("13920.00")

    assert order.iva_amount == expected_iva
    assert order.total_final == expected_total
    assert order.status == "quote"


def test_bodywork_and_paint_booth_flow(db_session: Session, auto_service: AutoServiceService, test_setup):
    # Veículo com danos de colisão
    v_in = VehicleCreate(company_id=1, customer_id=1, license_plate="BAT-101-MC", make="Isuzu", model="D-Max 3.0", year=2022)
    veh = auto_service.get_or_create_vehicle(db_session, v_in)

    order_in = ServiceOrderCreate(
        company_id=1,
        vehicle_id=veh.id,
        customer_id=1,
        service_type="bodywork_chapa",
        visible_damages=[{"area": "guarda_lamas_esq", "damage": "amassado_profundo"}],
        items=[
            ServiceOrderItemCreate(item_type="labor", description="Desempeno de Guarda-Lamas & Capot", quantity=Decimal("1.00"), unit_price=Decimal("8000.00")),
            ServiceOrderItemCreate(item_type="paint_material", description="Tinta OEM Isuzu 527 Cosmic Black + Verniz HS", quantity=Decimal("1.00"), unit_price=Decimal("4500.00")),
        ],
        paint_tuning_data=PaintTuningSpecCreate(
            paint_code="527 Cosmic Black",
            paint_finish="metallic",
            booth_temp_c=65,
            coats_applied=3,
            parts_to_paint=["guarda_lamas_esq", "parachoques_diant"],
            bodywork_straightening_required=True,
        ),
    )

    order = auto_service.create_service_order(db_session, order_in)
    assert len(order.paint_tuning_specs) == 1
    assert order.paint_tuning_specs[0].paint_code == "527 Cosmic Black"
    assert order.paint_tuning_specs[0].bodywork_straightening_required is True

    # Transição para a Estufa de Pintura
    updated = auto_service.update_order_status(db_session, order.id, ServiceOrderStatusUpdate(status="paint_booth"))
    assert updated.status == "paint_booth"


def test_obd_diagnosis_and_tuning_ecu(db_session: Session, auto_service: AutoServiceService, test_setup):
    v_in = VehicleCreate(company_id=1, customer_id=1, license_plate="TUN-500-MZ", make="Volkswagen", model="Golf 7 GTI", year=2020)
    veh = auto_service.get_or_create_vehicle(db_session, v_in)

    order_in = ServiceOrderCreate(
        company_id=1,
        vehicle_id=veh.id,
        customer_id=1,
        service_type="tuning",
        customer_complaint="Instalação de Reprogramação Stage 2 + Downpipe",
        items=[
            ServiceOrderItemCreate(item_type="tuning_kit", description="Reprogramação ECU TiConta Stage 2 (Pop & Bang)", quantity=Decimal("1.00"), unit_price=Decimal("15000.00")),
            ServiceOrderItemCreate(item_type="part", description="Downpipe Inox 3' 304 com Encaixe Direto", quantity=Decimal("1.00"), unit_price=Decimal("12000.00")),
        ],
        diagnostic_data=DiagnosticReportCreate(
            scanner_tool="VCDS Pro OBD-II",
            dtc_codes=[{"code": "P0420", "description": "Catalyst System Efficiency Below Threshold", "severity": "medium"}],
            battery_voltage=Decimal("12.80"),
            alternator_charging_voltage=Decimal("14.30"),
        ),
        paint_tuning_data=PaintTuningSpecCreate(
            tuning_stage="stage2",
            ecu_remap_profile="GTI 2.0 TSI Stage 2 +280HP",
            dyno_hp_before=230,
            dyno_hp_after=295,
            exhaust_modification="Downpipe Inox 3 polegadas",
        ),
    )

    order = auto_service.create_service_order(db_session, order_in)
    assert len(order.diagnostic_reports) == 1
    assert order.diagnostic_reports[0].dtc_codes[0]["code"] == "P0420"
    assert order.paint_tuning_specs[0].dyno_hp_after == 295

    # Concluir serviço
    auto_service.update_order_status(db_session, order.id, ServiceOrderStatusUpdate(status="ready"))

    # Faturação e Conversão em Venda POS
    sale_res = auto_service.convert_order_to_sale(db_session, order.id, payment_method="mpesa")
    assert sale_res["sale_id"] is not None
    assert sale_res["invoice_number"].startswith("FT ")
    assert order.status == "invoiced"


def test_workshop_statistics(db_session: Session, auto_service: AutoServiceService, test_setup):
    v_in = VehicleCreate(company_id=1, customer_id=1, license_plate="STAT-01-MC", make="Toyota", model="Corolla", year=2021)
    auto_service.get_or_create_vehicle(db_session, v_in)
    stats = auto_service.get_workshop_stats(db_session, company_id=1)
    assert stats.total_vehicles_registered >= 1
    assert stats.estimated_revenue_mzn >= Decimal("0.00")
