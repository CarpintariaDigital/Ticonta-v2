import logging
from datetime import datetime, date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Dict, Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, and_, or_

from app.models.poultry import (
    Farm,
    Flock,
    EggProduction,
    FeedManagement,
    FeedConsumption,
    HealthRecord,
    MortalityRecord,
    PoultrySpecies,
    FlockStatus,
    EggQuality,
)
from app.compliance.poultry_tracking import PoultryTraceabilityCompliance
from app.schemas.poultry import (
    FarmCreate,
    FarmResponse,
    FlockCreate,
    FlockResponse,
    EggProductionCreate,
    EggProductionResponse,
    FeedConsumptionCreate,
    FeedConsumptionResponse,
    HealthRecordCreate,
    HealthRecordResponse,
    MortalityRecordCreate,
    MortalityRecordResponse,
    FlockPerformanceResponse,
    FlockForecastResponse,
    PoultryProductionReportResponse,
)

logger = logging.getLogger(__name__)


class PoultryService:
    def __init__(self, db: Session):
        self.db = db
        self.compliance = PoultryTraceabilityCompliance(db)

    # =========================================================================
    # Farm Management
    # =========================================================================
    def create_farm(self, data: FarmCreate, company_id: int = 1) -> FarmResponse:
        farm = Farm(
            company_id=company_id,
            name=data.name.strip(),
            location=data.location.strip(),
            total_capacity=data.total_capacity,
            owner_id=data.owner_id,
            active=True
        )
        self.db.add(farm)
        self.db.commit()
        self.db.refresh(farm)
        return FarmResponse.model_validate(farm)

    def list_farms(self, company_id: int = 1) -> List[FarmResponse]:
        farms = self.db.query(Farm).filter(
            Farm.company_id == company_id,
            Farm.active == True
        ).order_by(Farm.name.asc()).all()
        return [FarmResponse.model_validate(f) for f in farms]

    # =========================================================================
    # Flock Management
    # =========================================================================
    def _generate_flock_number(self, farm_id: int) -> str:
        count = self.db.query(Flock).filter(Flock.farm_id == farm_id).count() + 1
        year = date.today().year
        return f"LOTE-{year}-{str(count).padStart(3, '0')}" if hasattr(str(count), 'padStart') else f"LOTE-{year}-{count:03d}"

    def create_flock(self, data: FlockCreate, company_id: int = 1) -> FlockResponse:
        farm = self.db.query(Farm).filter(Farm.id == data.farm_id, Farm.company_id == company_id).first()
        if not farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Quinta com ID {data.farm_id} não encontrada."
            )

        start_d = data.start_date or date.today()
        flock_num = data.flock_number or self._generate_flock_number(farm.id)

        # Calculate default slaughter or laying expectations
        exp_slaughter = data.expected_slaughter_date
        exp_lay = data.expected_first_lay_date
        if not exp_slaughter and data.species == PoultrySpecies.CHICKEN_BROILER.value:
            exp_slaughter = start_d + timedelta(days=38)  # Ciclo padrão de 38 dias
        if not exp_lay and data.species == PoultrySpecies.CHICKEN_LAYER.value:
            exp_lay = start_d + timedelta(days=130)  # Início de postura aos ~18-19 semanas

        flock = Flock(
            farm_id=data.farm_id,
            flock_number=flock_num,
            species=data.species,
            quantity_at_start=data.quantity_at_start,
            quantity_current=data.quantity_at_start,
            cost_per_bird=data.cost_per_bird,
            feed_type=data.feed_type or "Ração Inicial",
            start_date=start_d,
            expected_slaughter_date=exp_slaughter,
            expected_first_lay_date=exp_lay,
            status=FlockStatus.GROWING.value,
            notes=data.notes
        )
        self.db.add(flock)
        self.db.commit()
        self.db.refresh(flock)

        # Audit log
        self.compliance.log_flock_lifecycle_event(
            flock=flock,
            event_type="FLOCK_INITIATED",
            details={
                "quantity_at_start": flock.quantity_at_start,
                "cost_per_bird": float(flock.cost_per_bird),
                "species": flock.species
            }
        )

        return FlockResponse.model_validate(flock)

    def get_flock(self, flock_id: int) -> Flock:
        flock = self.db.query(Flock).options(
            joinedload(Flock.farm),
            joinedload(Flock.egg_productions),
            joinedload(Flock.feed_consumptions),
            joinedload(Flock.health_records),
            joinedload(Flock.mortality_records)
        ).filter(Flock.id == flock_id).first()

        if not flock:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lote {flock_id} não encontrado."
            )
        return flock

    def list_flocks(
        self,
        farm_id: Optional[int] = None,
        species: Optional[str] = None,
        status_filter: Optional[str] = None,
        company_id: int = 1
    ) -> List[FlockResponse]:
        query = self.db.query(Flock).join(Farm).filter(Farm.company_id == company_id)

        if farm_id:
            query = query.filter(Flock.farm_id == farm_id)
        if species:
            query = query.filter(Flock.species == species)
        if status_filter:
            query = query.filter(Flock.status == status_filter)

        flocks = query.order_by(Flock.start_date.desc()).all()
        return [FlockResponse.model_validate(f) for f in flocks]

    # =========================================================================
    # Egg Production Recording
    # =========================================================================
    def record_egg_production(self, flock_id: int, data: EggProductionCreate) -> EggProductionResponse:
        flock = self.get_flock(flock_id)
        prod_date = data.production_date or date.today()

        egg_record = EggProduction(
            flock_id=flock_id,
            production_date=prod_date,
            quantity=data.quantity,
            quality=data.quality,
            broken_quantity=data.broken_quantity,
            notes=data.notes
        )
        self.db.add(egg_record)

        if flock.status == FlockStatus.GROWING.value and data.quantity > 0:
            flock.status = FlockStatus.PRODUCING.value

        self.db.commit()
        self.db.refresh(egg_record)

        return EggProductionResponse.model_validate(egg_record)

    # =========================================================================
    # Feed Consumption Recording
    # =========================================================================
    def record_feed_consumption(self, flock_id: int, data: FeedConsumptionCreate) -> FeedConsumptionResponse:
        flock = self.get_flock(flock_id)
        cons_date = data.consumption_date or date.today()
        
        # Calculate kg (50kg per bag default)
        kg_used = data.kg_used or (data.bags_used * Decimal("50.00"))
        
        # Calculate cost
        cost = data.cost
        if not cost:
            # Fallback to standard feed price 1950 MZN / 50kg bag
            cost = data.bags_used * Decimal("1950.00")

        feed_record = FeedConsumption(
            flock_id=flock_id,
            feed_id=data.feed_id,
            consumption_date=cons_date,
            bags_used=data.bags_used,
            kg_used=kg_used,
            cost=cost,
            notes=data.notes
        )
        self.db.add(feed_record)
        self.db.commit()
        self.db.refresh(feed_record)

        return FeedConsumptionResponse.model_validate(feed_record)

    # =========================================================================
    # Mortality Recording
    # =========================================================================
    def record_mortality(self, flock_id: int, data: MortalityRecordCreate) -> MortalityRecordResponse:
        flock = self.get_flock(flock_id)
        m_date = data.record_date or date.today()

        mortality = MortalityRecord(
            flock_id=flock_id,
            record_date=m_date,
            quantity=data.quantity,
            cause=data.cause,
            notes=data.notes
        )
        self.db.add(mortality)

        # Automatically reduce live birds quantity
        flock.quantity_current = max(0, flock.quantity_current - data.quantity)
        if flock.quantity_current == 0:
            flock.status = FlockStatus.CLOSED.value

        self.db.commit()
        self.db.refresh(mortality)

        # Bio-security compliance evaluation
        cum_deaths = sum((m.quantity for m in flock.mortality_records), 0)
        self.compliance.assess_biosecurity_and_mortality(flock, cumulative_deaths=cum_deaths)

        return MortalityRecordResponse.model_validate(mortality)

    # =========================================================================
    # Health & Veterinary Recording
    # =========================================================================
    def record_health_issue(self, flock_id: int, data: HealthRecordCreate) -> HealthRecordResponse:
        flock = self.get_flock(flock_id)
        h_date = data.record_date or date.today()

        health = HealthRecord(
            flock_id=flock_id,
            record_date=h_date,
            disease=data.disease,
            birds_affected=data.birds_affected,
            treatment=data.treatment,
            cost=data.cost,
            notes=data.notes
        )
        self.db.add(health)
        self.db.commit()
        self.db.refresh(health)

        return HealthRecordResponse.model_validate(health)

    # =========================================================================
    # Performance & KPI Analytics
    # =========================================================================
    def get_flock_performance(self, flock_id: int) -> FlockPerformanceResponse:
        flock = self.get_flock(flock_id)
        today = date.today()
        age_in_days = max(1, (today - flock.start_date).days)

        cumulative_mortality = sum((m.quantity for m in flock.mortality_records), 0)
        start_qty = flock.quantity_at_start
        current_qty = flock.quantity_current
        mortality_rate = (cumulative_mortality / start_qty * 100) if start_qty > 0 else 0.0

        # Feed metrics
        total_feed_kg = float(sum((Decimal(str(fc.kg_used)) for fc in flock.feed_consumptions), Decimal("0.00")))
        total_feed_cost = sum((Decimal(str(fc.cost)) for fc in flock.feed_consumptions), Decimal("0.00"))
        
        # Average feed per bird/day in grams
        bird_days = max(1, current_qty * age_in_days)
        avg_feed_per_bird_day_g = (total_feed_kg * 1000) / bird_days if bird_days > 0 else 0.0

        # Estimated live weight (Broiler standard curve: age_days / 38 * 2.2 kg)
        est_weight_per_bird = min(2.5, max(0.05, (age_in_days / 38.0) * 2.2)) if flock.species == PoultrySpecies.CHICKEN_BROILER.value else 1.8
        total_live_weight_kg = current_qty * est_weight_per_bird
        fcr = (total_feed_kg / total_live_weight_kg) if total_live_weight_kg > 0 else 0.0

        # Egg production
        total_eggs = sum((ep.quantity for ep in flock.egg_productions), 0)
        recent_eggs = flock.egg_productions[0].quantity if flock.egg_productions else 0
        laying_percent = (recent_eggs / current_qty * 100) if (current_qty > 0 and flock.species == PoultrySpecies.CHICKEN_LAYER.value) else 0.0

        # Cost breakdown
        initial_birds_cost = Decimal(str(flock.cost_per_bird)) * Decimal(str(start_qty))
        meds_cost = sum((Decimal(str(hr.cost)) for hr in flock.health_records), Decimal("0.00"))
        total_accumulated_cost = initial_birds_cost + total_feed_cost + meds_cost
        cost_per_bird = (total_accumulated_cost / Decimal(str(current_qty))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) if current_qty > 0 else Decimal("0.00")

        return FlockPerformanceResponse(
            flock_id=flock.id,
            flock_number=flock.flock_number,
            species=flock.species,
            age_in_days=age_in_days,
            quantity_at_start=start_qty,
            quantity_current=current_qty,
            cumulative_mortality=cumulative_mortality,
            mortality_rate_percent=round(mortality_rate, 2),
            total_feed_consumed_kg=round(total_feed_kg, 2),
            feed_conversion_ratio_fcr=round(fcr, 2),
            average_feed_per_bird_per_day_grams=round(avg_feed_per_bird_day_g, 2),
            total_eggs_collected=total_eggs,
            laying_percentage_current=round(laying_percent, 2),
            cost_per_bird_accumulated=cost_per_bird,
            total_accumulated_cost=total_accumulated_cost,
            cost_breakdown={
                "initial_birds": initial_birds_cost,
                "feed": total_feed_cost,
                "health_and_meds": meds_cost,
            }
        )

    # =========================================================================
    # Forecast Production & Expected Profits
    # =========================================================================
    def forecast_production(self, flock_id: int) -> FlockForecastResponse:
        flock = self.get_flock(flock_id)
        perf = self.get_flock_performance(flock_id)
        current_age = perf.age_in_days
        current_birds = perf.quantity_current

        notes: List[str] = []

        if flock.species == PoultrySpecies.CHICKEN_BROILER.value:
            target_age = 38
            days_left = max(0, target_age - current_age)
            ready_date = date.today() + timedelta(days=days_left)
            est_final_weight = 2.2  # kg live weight

            # Projected feed from now to slaughter (approx 120g/day per bird)
            projected_remaining_feed_kg = Decimal(str(days_left * current_birds * 0.13))
            projected_feed_cost = (projected_remaining_feed_kg / Decimal("50.00")) * Decimal("1950.00")
            total_projected_cost = perf.total_accumulated_cost + projected_feed_cost

            # Projected revenue at market price 280 MZN / bird
            market_price_per_bird = Decimal("280.00")
            projected_revenue = Decimal(str(current_birds)) * market_price_per_bird
            projected_profit = projected_revenue - total_projected_cost
            roi = float((projected_profit / total_projected_cost) * 100) if total_projected_cost > 0 else 0.0

            notes.append(f"Lote de frangos de corte com abate estimado aos {target_age} dias ({ready_date.strftime('%d/%m/%Y')}).")
            notes.append(f"Peso médio projetado: {est_final_weight} kg vivo. Preço de venda estimado: {market_price_per_bird} MT/ave.")

            return FlockForecastResponse(
                flock_id=flock.id,
                flock_number=flock.flock_number,
                species=flock.species,
                current_age_days=current_age,
                projected_ready_date=ready_date,
                days_remaining=days_left,
                estimated_final_weight_kg=est_final_weight,
                estimated_total_cost_at_sale=total_projected_cost.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
                projected_revenue_at_sale=projected_revenue.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
                projected_net_profit=projected_profit.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
                projected_roi_percent=round(roi, 2),
                forecast_notes=notes
            )
        else:
            # Layer / Poedeira forecast
            target_lay_age = 130  # ~19 semanas
            days_to_laying = max(0, target_lay_age - current_age)
            lay_start_date = date.today() + timedelta(days=days_to_laying)

            # Daily egg peak (85% lay rate) = current_birds * 0.85
            daily_eggs_at_peak = int(current_birds * 0.85)
            monthly_cartons = (daily_eggs_at_peak * 30) // 30  # caixas de 30 ovos
            monthly_egg_revenue = Decimal(str(monthly_cartons)) * Decimal("280.00")  # 280 MT por dúzia/cartela de 30

            notes.append(f"Galinhas poedeiras com pico de produção previsto para {lay_start_date.strftime('%d/%m/%Y')}.")
            notes.append(f"Produção estimada no pico: ~{daily_eggs_at_peak} ovos/dia ({monthly_cartons} cartelas/mês).")

            return FlockForecastResponse(
                flock_id=flock.id,
                flock_number=flock.flock_number,
                species=flock.species,
                current_age_days=current_age,
                projected_ready_date=lay_start_date,
                days_remaining=days_to_laying,
                estimated_final_weight_kg=1.8,
                estimated_total_cost_at_sale=perf.total_accumulated_cost,
                projected_revenue_at_sale=monthly_egg_revenue,
                projected_net_profit=monthly_egg_revenue - (Decimal(str(current_birds * 30 * 0.12 / 50)) * Decimal("1950.00")),
                projected_roi_percent=45.0,
                forecast_notes=notes
            )

    # =========================================================================
    # Production Report (Fazenda Completa)
    # =========================================================================
    def generate_production_report(
        self,
        farm_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        company_id: int = 1
    ) -> PoultryProductionReportResponse:
        farm = self.db.query(Farm).filter(Farm.id == farm_id, Farm.company_id == company_id).first()
        if not farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Quinta {farm_id} não encontrada."
            )

        flocks_query = self.db.query(Flock).filter(Flock.farm_id == farm_id)
        if start_date:
            flocks_query = flocks_query.filter(Flock.start_date >= start_date)
        if end_date:
            flocks_query = flocks_query.filter(Flock.start_date <= end_date)

        flocks = flocks_query.all()

        total_flocks = len(flocks)
        active_flocks = sum((1 for f in flocks if f.status in [FlockStatus.GROWING.value, FlockStatus.PRODUCING.value]))
        live_birds = sum((f.quantity_current for f in flocks))
        total_birds_started = sum((f.quantity_at_start for f in flocks))

        # Sum mortality
        total_mortality = sum((sum((m.quantity for m in f.mortality_records), 0) for f in flocks))
        overall_mortality_rate = (total_mortality / total_birds_started * 100) if total_birds_started > 0 else 0.0

        # Sum eggs
        total_eggs = sum((sum((ep.quantity for ep in f.egg_productions), 0) for f in flocks))

        # Sum feed
        total_feed_kg = float(sum((sum((Decimal(str(fc.kg_used)) for fc in f.feed_consumptions), Decimal("0.00")) for f in flocks)))
        total_feed_cost = sum((sum((Decimal(str(fc.cost)) for fc in f.feed_consumptions), Decimal("0.00")) for f in flocks), Decimal("0.00"))

        # Sum meds
        total_meds_cost = sum((sum((Decimal(str(hr.cost)) for hr in f.health_records), Decimal("0.00")) for f in flocks), Decimal("0.00"))

        # Sum initial bird purchases
        total_acquisition_cost = sum((Decimal(str(f.cost_per_bird)) * Decimal(str(f.quantity_at_start)) for f in flocks), Decimal("0.00"))

        # Estimated revenue (from eggs harvested: ~280 MT / 30 ovos + sold/live birds ~280 MT)
        egg_revenue = (Decimal(str(total_eggs)) / Decimal("30.00")) * Decimal("280.00")
        sold_birds_count = sum((f.quantity_at_start - f.quantity_current - sum((m.quantity for m in f.mortality_records), 0) for f in flocks if f.status == FlockStatus.SOLD.value))
        bird_revenue = Decimal(str(max(0, sold_birds_count))) * Decimal("280.00")
        total_revenue = egg_revenue + bird_revenue

        total_costs = total_acquisition_cost + total_feed_cost + total_meds_cost
        net_profit = total_revenue - total_costs

        return PoultryProductionReportResponse(
            farm_id=farm.id,
            farm_name=farm.name,
            period_start=start_date,
            period_end=end_date,
            total_flocks=total_flocks,
            active_flocks=active_flocks,
            live_birds_count=live_birds,
            total_mortality_count=total_mortality,
            overall_mortality_rate_percent=round(overall_mortality_rate, 2),
            total_eggs_harvested=total_eggs,
            total_feed_consumed_kg=round(total_feed_kg, 2),
            total_feed_cost=total_feed_cost,
            total_health_meds_cost=total_meds_cost,
            total_bird_acquisition_cost=total_acquisition_cost,
            total_estimated_revenue=total_revenue.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            net_production_profit=net_profit.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            generated_at=datetime.utcnow()
        )
