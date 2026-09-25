from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.pricing import MarketPrice, ProducerPrice, MarketProductType, PriceSource
from app.models.poultry import Flock, FeedConsumption, HealthRecord, EggProduction, PoultrySpecies
from app.schemas.pricing import (
    MarketPriceCreate,
    MarketPriceResponse,
    MarketPriceHistoryResponse,
    MarketPriceHistoryItem,
    ProducerPriceCreate,
    ProducerPriceUpdate,
    ProducerPriceResponse,
    FlockProfitabilityResponse,
    PriceRecommendationResponse,
    MarketComparisonResponse,
    CostBreakdownItem,
)


class PricingService:
    def __init__(self, db: Session):
        self.db = db
        self._ensure_market_prices_seeded()

    def _ensure_market_prices_seeded(self):
        """Seed baseline Mozambique market survey prices if database is empty."""
        count = self.db.query(MarketPrice).count()
        if count == 0:
            today = date.today()
            baseline_data = [
                # Live Chicken (Frango Vivo ~2.2kg)
                (MarketProductType.LIVE_CHICKEN, "Maputo/Matola", Decimal("280.00"), Decimal("260.00"), Decimal("300.00"), today - timedelta(days=7)),
                (MarketProductType.LIVE_CHICKEN, "Maputo/Matola", Decimal("285.00"), Decimal("270.00"), Decimal("310.00"), today),
                # Slaughtered Chicken (Frango Abatido/Congelado kg)
                (MarketProductType.SLAUGHTERED_CHICKEN, "Maputo/Matola", Decimal("220.00"), Decimal("200.00"), Decimal("240.00"), today - timedelta(days=7)),
                (MarketProductType.SLAUGHTERED_CHICKEN, "Maputo/Matola", Decimal("225.00"), Decimal("210.00"), Decimal("245.00"), today),
                # Egg Crate (Cartela 30 ovos)
                (MarketProductType.EGG_CRATE, "Maputo/Matola", Decimal("290.00"), Decimal("270.00"), Decimal("320.00"), today - timedelta(days=7)),
                (MarketProductType.EGG_CRATE, "Maputo/Matola", Decimal("300.00"), Decimal("280.00"), Decimal("330.00"), today),
                # Egg Dozen (Dúzia 12 ovos)
                (MarketProductType.EGG_DOZEN, "Maputo/Matola", Decimal("125.00"), Decimal("115.00"), Decimal("140.00"), today - timedelta(days=7)),
                (MarketProductType.EGG_DOZEN, "Maputo/Matola", Decimal("130.00"), Decimal("120.00"), Decimal("145.00"), today),
                # Quail Egg Tray (Cartela Codorna 24 ovos)
                (MarketProductType.QUAIL_EGG_TRAY, "Maputo/Matola", Decimal("180.00"), Decimal("160.00"), Decimal("200.00"), today),
                # Live Quail
                (MarketProductType.QUAIL_LIVE, "Maputo/Matola", Decimal("120.00"), Decimal("100.00"), Decimal("140.00"), today),
                # Live Duck
                (MarketProductType.DUCK_LIVE, "Maputo/Matola", Decimal("650.00"), Decimal("550.00"), Decimal("750.00"), today),
            ]

            for p_type, region, price, min_p, max_p, p_date in baseline_data:
                entry = MarketPrice(
                    product_type=p_type,
                    region=region,
                    current_price=price,
                    min_price=min_p,
                    max_price=max_p,
                    price_date=p_date,
                    source=PriceSource.MARKET_SURVEY,
                    notes="Levantamento SIMAP / Mercados Zimpeto e Bazuca",
                    created_at=datetime.utcnow(),
                )
                self.db.add(entry)
            self.db.commit()

    def record_market_price(self, data: MarketPriceCreate) -> MarketPriceResponse:
        """Registar nova cotação de mercado observada."""
        price_date = data.price_date or date.today()
        record = MarketPrice(
            product_type=data.product_type,
            region=data.region,
            current_price=data.current_price,
            min_price=data.min_price or data.current_price * Decimal("0.95"),
            max_price=data.max_price or data.current_price * Decimal("1.08"),
            price_date=price_date,
            source=data.source or PriceSource.MARKET_SURVEY,
            notes=data.notes,
            created_at=datetime.utcnow(),
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)

        return self.get_market_price(product_type=data.product_type, region=data.region)

    def get_market_price(self, product_type: str, region: str = "Maputo/Matola") -> MarketPriceResponse:
        """Obter preço de mercado atualizado com apuração de tendência e média histórica."""
        latest = (
            self.db.query(MarketPrice)
            .filter(MarketPrice.product_type == product_type)
            .order_by(desc(MarketPrice.price_date), desc(MarketPrice.id))
            .first()
        )

        if not latest:
            # Create fallback default
            latest = MarketPrice(
                id=1,
                product_type=product_type,
                region=region,
                current_price=Decimal("280.00"),
                min_price=Decimal("260.00"),
                max_price=Decimal("300.00"),
                price_date=date.today(),
                source=PriceSource.MARKET_SURVEY,
                created_at=datetime.utcnow(),
            )

        # Calculate average and trend over last 30 days
        cutoff = date.today() - timedelta(days=30)
        history = (
            self.db.query(MarketPrice)
            .filter(MarketPrice.product_type == product_type, MarketPrice.price_date >= cutoff)
            .order_by(MarketPrice.price_date.asc())
            .all()
        )

        if len(history) > 1:
            avg_price = sum(h.current_price for h in history) / Decimal(len(history))
            oldest_price = history[0].current_price
            diff = latest.current_price - oldest_price
            trend_pct = float((diff / oldest_price) * 100)
            if trend_pct > 1.5:
                trend = "up"
            elif trend_pct < -1.5:
                trend = "down"
            else:
                trend = "stable"
        else:
            avg_price = latest.current_price
            trend_pct = 0.0
            trend = "stable"

        return MarketPriceResponse(
            id=latest.id,
            product_type=latest.product_type.value if hasattr(latest.product_type, "value") else str(latest.product_type),
            region=latest.region,
            current_price=latest.current_price,
            min_price=latest.min_price,
            max_price=latest.max_price,
            price_date=latest.price_date,
            source=latest.source.value if hasattr(latest.source, "value") else str(latest.source),
            trend=trend,
            trend_percentage=round(trend_pct, 2),
            historical_average=round(avg_price, 2),
            notes=latest.notes,
            created_at=latest.created_at,
        )

    def list_all_market_prices(self, region: Optional[str] = None) -> List[MarketPriceResponse]:
        """Listar cotações de mercado para todas as categorias de produtos avícolas."""
        results = []
        for p_type in MarketProductType:
            price_info = self.get_market_price(product_type=p_type.value, region=region or "Maputo/Matola")
            results.append(price_info)
        return results

    def get_market_price_history(
        self, product_type: str, region: str = "Maputo/Matola", days: int = 30
    ) -> MarketPriceHistoryResponse:
        """Obter histórico de preços de mercado ao longo do tempo."""
        cutoff = date.today() - timedelta(days=days)
        records = (
            self.db.query(MarketPrice)
            .filter(MarketPrice.product_type == product_type, MarketPrice.price_date >= cutoff)
            .order_by(MarketPrice.price_date.asc())
            .all()
        )

        history_items: List[MarketPriceHistoryItem] = []
        prices = []

        if not records:
            # Create synthetic fallback curve
            base_p = Decimal("280.00") if "chicken" in product_type else Decimal("300.00")
            for i in range(days, 0, -5):
                d = date.today() - timedelta(days=i)
                p = base_p + Decimal(str((days - i) * 0.5))
                history_items.append(
                    MarketPriceHistoryItem(
                        date=d,
                        price=p,
                        min_price=p - Decimal("10.00"),
                        max_price=p + Decimal("15.00"),
                        source="market_survey",
                    )
                )
                prices.append(p)
        else:
            for r in records:
                history_items.append(
                    MarketPriceHistoryItem(
                        date=r.price_date,
                        price=r.current_price,
                        min_price=r.min_price,
                        max_price=r.max_price,
                        source=r.source.value if hasattr(r.source, "value") else str(r.source),
                    )
                )
                prices.append(r.current_price)

        avg_price = sum(prices) / Decimal(len(prices)) if prices else Decimal("0.00")
        max_p = max(prices) if prices else Decimal("0.00")
        min_p = min(prices) if prices else Decimal("0.00")

        return MarketPriceHistoryResponse(
            product_type=product_type,
            region=region,
            days_span=days,
            average_price=round(avg_price, 2),
            highest_price=round(max_p, 2),
            lowest_price=round(min_p, 2),
            history=history_items,
        )

    def set_producer_price(self, company_id: int, data: ProducerPriceCreate) -> ProducerPriceResponse:
        """Definir ou atualizar tabela de preços praticada pelo produtor."""
        existing = (
            self.db.query(ProducerPrice)
            .filter(
                ProducerPrice.company_id == company_id,
                ProducerPrice.product_type == data.product_type,
            )
            .first()
        )

        if existing:
            existing.unit_price = data.unit_price
            existing.min_order_quantity = data.min_order_quantity
            existing.bulk_discount_percent = data.bulk_discount_percent
            existing.notes = data.notes
            existing.active = True
            existing.last_updated = datetime.utcnow()
            self.db.commit()
            self.db.refresh(existing)
            return ProducerPriceResponse.model_validate(existing)

        new_price = ProducerPrice(
            company_id=company_id,
            product_type=data.product_type,
            unit_price=data.unit_price,
            min_order_quantity=data.min_order_quantity,
            bulk_discount_percent=data.bulk_discount_percent,
            active=True,
            notes=data.notes,
            last_updated=datetime.utcnow(),
            created_at=datetime.utcnow(),
        )
        self.db.add(new_price)
        self.db.commit()
        self.db.refresh(new_price)
        return ProducerPriceResponse.model_validate(new_price)

    def get_producer_prices(self, company_id: int) -> List[ProducerPriceResponse]:
        """Listar tabela de preços atual do produtor."""
        prices = (
            self.db.query(ProducerPrice)
            .filter(ProducerPrice.company_id == company_id, ProducerPrice.active == True)
            .all()
        )
        return [ProducerPriceResponse.model_validate(p) for p in prices]

    def calculate_production_cost(self, flock_id: int) -> Tuple[Decimal, Decimal, List[CostBreakdownItem]]:
        """Calcular custo total de produção, custo por unidade e detalhamento."""
        flock = self.db.query(Flock).filter(Flock.id == flock_id).first()
        if not flock:
            raise ValueError("Lote não encontrado")

        # 1. Custo inicial de aquisição dos pintos
        initial_birds_cost = (flock.cost_per_bird or Decimal("0.00")) * Decimal(flock.quantity_at_start)

        # 2. Custo de ração consumida
        feed_total_cost = (
            self.db.query(func.coalesce(func.sum(FeedConsumption.cost), 0))
            .filter(FeedConsumption.flock_id == flock_id)
            .scalar()
        )
        feed_cost = Decimal(str(feed_total_cost))

        # 3. Custo de sanidade / vacinas
        health_total_cost = (
            self.db.query(func.coalesce(func.sum(HealthRecord.cost), 0))
            .filter(HealthRecord.flock_id == flock_id)
            .scalar()
        )
        health_cost = Decimal(str(health_total_cost))

        # 4. Custos operacionais estimados (camas de casca de arroz, energia, aquecimento ~8% do total)
        direct_costs = initial_birds_cost + feed_cost + health_cost
        overhead_cost = direct_costs * Decimal("0.08")
        total_production_cost = direct_costs + overhead_cost

        # Custo por unidade (por ave viva se corte, ou por ovo/cartela se postura)
        live_count = max(1, flock.quantity_current)
        if flock.species == PoultrySpecies.CHICKEN_LAYER:
            eggs_collected = (
                self.db.query(func.coalesce(func.sum(EggProduction.quantity), 0))
                .filter(EggProduction.flock_id == flock_id)
                .scalar()
            )
            if eggs_collected and eggs_collected > 0:
                cost_per_unit = total_production_cost / Decimal(eggs_collected)
            else:
                cost_per_unit = total_production_cost / Decimal(live_count)
        else:
            cost_per_unit = total_production_cost / Decimal(live_count)

        breakdown = []
        if total_production_cost > 0:
            breakdown = [
                CostBreakdownItem(
                    item="Pintos de 1 Dia",
                    total_cost=round(initial_birds_cost, 2),
                    percentage=round(float((initial_birds_cost / total_production_cost) * 100), 1),
                ),
                CostBreakdownItem(
                    item="Ração & Nutrição",
                    total_cost=round(feed_cost, 2),
                    percentage=round(float((feed_cost / total_production_cost) * 100), 1),
                ),
                CostBreakdownItem(
                    item="Sanidade & Vacinação",
                    total_cost=round(health_cost, 2),
                    percentage=round(float((health_cost / total_production_cost) * 100), 1),
                ),
                CostBreakdownItem(
                    item="Overhead & Energia / Cama",
                    total_cost=round(overhead_cost, 2),
                    percentage=round(float((overhead_cost / total_production_cost) * 100), 1),
                ),
            ]

        return round(total_production_cost, 2), round(cost_per_unit, 2), breakdown

    def get_flock_profitability(
        self, flock_id: int, selling_price: Optional[Decimal] = None
    ) -> FlockProfitabilityResponse:
        """Calcular rentabilidade, ponto de equilíbrio (break-even) e margem de lucro."""
        flock = self.db.query(Flock).filter(Flock.id == flock_id).first()
        if not flock:
            raise ValueError("Lote de aves não encontrado")

        total_cost, cost_per_unit, breakdown = self.calculate_production_cost(flock_id)

        # Mapping species to market product type
        if flock.species == PoultrySpecies.CHICKEN_BROILER:
            prod_type = MarketProductType.LIVE_CHICKEN.value
        elif flock.species == PoultrySpecies.CHICKEN_LAYER:
            prod_type = MarketProductType.EGG_CRATE.value
        elif flock.species == PoultrySpecies.QUAIL:
            prod_type = MarketProductType.QUAIL_LIVE.value
        else:
            prod_type = MarketProductType.DUCK_LIVE.value

        market_info = self.get_market_price(product_type=prod_type)
        suggested_price = selling_price or market_info.current_price

        live_count = max(1, flock.quantity_current)
        if flock.species == PoultrySpecies.CHICKEN_LAYER:
            eggs_collected = (
                self.db.query(func.coalesce(func.sum(EggProduction.quantity), 0))
                .filter(EggProduction.flock_id == flock_id)
                .scalar()
            )
            crates = Decimal(eggs_collected or 0) / Decimal("30.0") if eggs_collected else Decimal(live_count)
            projected_revenue = crates * suggested_price
        else:
            projected_revenue = Decimal(live_count) * suggested_price

        gross_profit = projected_revenue - total_cost
        margin_percent = float((gross_profit / projected_revenue) * 100) if projected_revenue > 0 else 0.0
        break_even = cost_per_unit

        return FlockProfitabilityResponse(
            flock_id=flock.id,
            flock_number=flock.flock_number,
            species=flock.species.value if hasattr(flock.species, "value") else str(flock.species),
            quantity_current=flock.quantity_current,
            total_production_cost=total_cost,
            cost_per_unit=cost_per_unit,
            suggested_market_price=suggested_price,
            projected_revenue=round(projected_revenue, 2),
            projected_gross_profit=round(gross_profit, 2),
            profit_margin_percent=round(margin_percent, 1),
            break_even_price=break_even,
            cost_breakdown=breakdown,
        )

    def suggest_optimal_price(self, flock_id: int) -> PriceRecommendationResponse:
        """Sugerir preço ótimo de venda baseado no custo zootécnico e mercado."""
        flock = self.db.query(Flock).filter(Flock.id == flock_id).first()
        if not flock:
            raise ValueError("Lote não encontrado")

        _, cost_per_unit, _ = self.calculate_production_cost(flock_id)

        if flock.species == PoultrySpecies.CHICKEN_BROILER:
            prod_type = MarketProductType.LIVE_CHICKEN.value
        elif flock.species == PoultrySpecies.CHICKEN_LAYER:
            prod_type = MarketProductType.EGG_CRATE.value
        else:
            prod_type = MarketProductType.LIVE_CHICKEN.value

        market_info = self.get_market_price(product_type=prod_type)
        mkt_price = market_info.current_price

        # Minimum Break Even
        break_even = cost_per_unit
        # Competitive price: cost + 30% margin or slightly below market
        competitive_price = max(round(cost_per_unit * Decimal("1.30"), 2), mkt_price * Decimal("0.96"))
        # Premium price: 40% margin
        premium_price = max(round(cost_per_unit * Decimal("1.45"), 2), mkt_price * Decimal("1.05"))
        # Bulk price (volume >= 50 birds/crates): 5% discount on competitive
        bulk_price = round(competitive_price * Decimal("0.93"), 2)

        margin_recommended = float(((competitive_price - cost_per_unit) / competitive_price) * 100)

        positioning = (
            "Abaixo do mercado (Estratégia de penetração/venda rápida)"
            if competitive_price < mkt_price
            else "Alinhado com a média dos mercados de Maputo"
        )

        notes = [
            f"Preço de custo unitário apurado: {cost_per_unit} MT. Ponto de equilíbrio zootécnico.",
            f"Preço de mercado atual de referência: {mkt_price} MT.",
            f"Preço sugerido a {competitive_price} MT garante margem bruta de {round(margin_recommended, 1)}%.",
            f"Desconto por atacado (a partir de 50 unidades): {bulk_price} MT/unidade.",
        ]

        return PriceRecommendationResponse(
            flock_id=flock.id,
            flock_number=flock.flock_number,
            product_type=prod_type,
            cost_per_unit=cost_per_unit,
            break_even_price=break_even,
            current_market_price=mkt_price,
            recommended_competitive_price=round(competitive_price, 2),
            recommended_premium_price=round(premium_price, 2),
            recommended_bulk_price=round(bulk_price, 2),
            estimated_profit_margin_at_recommended=round(margin_recommended, 1),
            market_positioning=positioning,
            pricing_strategy_notes=notes,
        )

    def compare_with_market(
        self, product_type: str, my_price: Decimal, region: str = "Maputo/Matola"
    ) -> MarketComparisonResponse:
        """Comparar preço ofertado pelo produtor com a média de mercado."""
        market_info = self.get_market_price(product_type=product_type, region=region)
        mkt_avg = market_info.current_price

        diff_amount = my_price - mkt_avg
        diff_percent = float((diff_amount / mkt_avg) * 100) if mkt_avg > 0 else 0.0

        if diff_percent < -5.0:
            pos = "below_market"
            analysis = f"O seu preço ({my_price} MT) está {abs(round(diff_percent, 1))}% abaixo da média de mercado ({mkt_avg} MT). Excelente para giro rápido de estoque."
        elif diff_percent > 5.0:
            pos = "premium"
            analysis = f"O seu preço ({my_price} MT) está {round(diff_percent, 1)}% acima da média de mercado ({mkt_avg} MT). Indicado para aves pesadas ou canal gourmet/restaurantes."
        else:
            pos = "at_market"
            analysis = f"O seu preço ({my_price} MT) está perfeitamente alinhado com a cotação de mercado ({mkt_avg} MT)."

        return MarketComparisonResponse(
            product_type=product_type,
            region=region,
            my_price=my_price,
            market_average_price=mkt_avg,
            difference_amount=round(diff_amount, 2),
            difference_percentage=round(diff_percent, 1),
            positioning=pos,
            analysis=analysis,
        )

    # ========================================================
    # GESTOR DE PREÇOS, DESCONTOS E MÓDULOS ERP (A PARTIR DE 300 MT)
    # ========================================================

    _default_modules = [
        {
            "module_id": "pos",
            "name": "POS Vendas Rápidas",
            "category": "retail",
            "base_price_mzn": Decimal("300.00"),
            "discount_percent": Decimal("0.00"),
            "is_active": True,
            "description": "Faturação rápida 100% digital, fecho de caixa e recibos por WhatsApp/SMS.",
            "icon": "Terminal",
        },
        {
            "module_id": "informal_sales",
            "name": "Vendas Informais & Mercearia",
            "category": "retail",
            "base_price_mzn": Decimal("300.00"),
            "discount_percent": Decimal("0.00"),
            "is_active": True,
            "description": "Controlo diário simplificado para bancas, mercearias e retalhistas moçambicanos.",
            "icon": "Store",
        },
        {
            "module_id": "fiado",
            "name": "Caderno de Fiado Digital",
            "category": "retail",
            "base_price_mzn": Decimal("300.00"),
            "discount_percent": Decimal("0.00"),
            "is_active": True,
            "description": "Registo de dívidas de clientes com lembretes automáticos amigáveis via WhatsApp.",
            "icon": "BookOpen",
        },
        {
            "module_id": "document_delivery",
            "name": "Faturação WhatsApp & SMS (Sem Papel)",
            "category": "core",
            "base_price_mzn": Decimal("300.00"),
            "discount_percent": Decimal("0.00"),
            "is_active": True,
            "description": "Envio instantâneo de faturas fiscais (FR/FT) diretamente ao telemóvel do cliente.",
            "icon": "Send",
        },
        {
            "module_id": "xitique_savings",
            "name": "Xitique & Poupança Comunitária",
            "category": "finance",
            "base_price_mzn": Decimal("300.00"),
            "discount_percent": Decimal("0.00"),
            "is_active": True,
            "description": "Grupos rotativos comunitários de Xitique com calendário de rodadas e registo de quotas.",
            "icon": "PiggyBank",
        },
        {
            "module_id": "restaurant",
            "name": "Restaurante & Cozinha KDS",
            "category": "operations",
            "base_price_mzn": Decimal("500.00"),
            "discount_percent": Decimal("0.00"),
            "is_active": True,
            "description": "Mapa de mesas em tempo real, pedidos com adicionais e painel visual de pedidos para a cozinha.",
            "icon": "UtensilsCrossed",
        },
        {
            "module_id": "takeaway",
            "name": "Takeaway & Entregas Rápidas",
            "category": "operations",
            "base_price_mzn": Decimal("300.00"),
            "discount_percent": Decimal("0.00"),
            "is_active": True,
            "description": "Gestão de pedidos para levar, atribuição a estafetas/motoristas e confirmação por SMS.",
            "icon": "Bike",
        },
        {
            "module_id": "auto_services",
            "name": "Oficina & Serviços Automotivos",
            "category": "operations",
            "base_price_mzn": Decimal("400.00"),
            "discount_percent": Decimal("0.00"),
            "is_active": True,
            "description": "Ordens de serviço para viaturas, acompanhamento mecânico e histórico de matrículas.",
            "icon": "Wrench",
        },
        {
            "module_id": "hr",
            "name": "Recursos Humanos & Salários MZ",
            "category": "operations",
            "base_price_mzn": Decimal("450.00"),
            "discount_percent": Decimal("0.00"),
            "is_active": True,
            "description": "Folha de salários conforme Lei do Trabalho de MZ, cálculo de INSS (3%+4%) e IRPS.",
            "icon": "Users2",
        },
        {
            "module_id": "accounting",
            "name": "Contabilidade PGC-NIRF & IVA 16%",
            "category": "finance",
            "base_price_mzn": Decimal("600.00"),
            "discount_percent": Decimal("0.00"),
            "is_active": True,
            "description": "Balancete analítico, apuramento automático do IVA (4.4.5) e modelo M/20 da Autoridade Tributária.",
            "icon": "Calculator",
        },
        {
            "module_id": "poultry",
            "name": "Avicultura & Agropecuária",
            "category": "agro",
            "base_price_mzn": Decimal("400.00"),
            "discount_percent": Decimal("0.00"),
            "is_active": True,
            "description": "Controlo de lotes de frangos e poedeiras, taxa de mortalidade, ração e análise de rentabilidade.",
            "icon": "Egg",
        },
        {
            "module_id": "projects",
            "name": "Projetos & Obras",
            "category": "operations",
            "base_price_mzn": Decimal("450.00"),
            "discount_percent": Decimal("0.00"),
            "is_active": True,
            "description": "Orçamento previsto vs real por obra, marcos contratuais e acompanhamento de custos de materiais.",
            "icon": "FolderKanban",
        },
        {
            "module_id": "manufacturing",
            "name": "Produção & Manufatura",
            "category": "operations",
            "base_price_mzn": Decimal("450.00"),
            "discount_percent": Decimal("0.00"),
            "is_active": True,
            "description": "Fichas técnicas de composição (BOM), ordens de fabrico e apuramento do custo unitário do produto.",
            "icon": "Factory",
        },
    ]

    _default_plans = [
        {
            "plan_id": "starter",
            "name": "Starter Micro",
            "monthly_price_mzn": Decimal("300.00"),
            "included_modules": ["pos", "informal_sales", "fiado", "document_delivery"],
            "discount_annual_percent": Decimal("20.00"),
            "badge": "A Partir de 300 MT",
            "description": "Ideal para micro-negócios, quiosques, bancas e pequenos retalhistas.",
        },
        {
            "plan_id": "basic",
            "name": "Básico Comercial",
            "monthly_price_mzn": Decimal("500.00"),
            "included_modules": ["pos", "informal_sales", "fiado", "document_delivery", "xitique_savings", "takeaway"],
            "discount_annual_percent": Decimal("20.00"),
            "badge": "Mais Popular",
            "description": "Para lojas, farmácias, mercadinhos e pequenas empresas em crescimento.",
        },
        {
            "plan_id": "pro",
            "name": "Profissional PME",
            "monthly_price_mzn": Decimal("1500.00"),
            "included_modules": ["pos", "restaurant", "auto_services", "hr", "poultry", "document_delivery"],
            "discount_annual_percent": Decimal("20.00"),
            "badge": "Multi-Setorial",
            "description": "Restaurantes, oficinas, pequenas agro-indústrias e empresas de serviços.",
        },
        {
            "plan_id": "complete",
            "name": "Completo Fiscal PGC-NIRF",
            "monthly_price_mzn": Decimal("3500.00"),
            "included_modules": ["pos", "restaurant", "hr", "accounting", "projects", "manufacturing", "poultry", "auto_services", "document_delivery"],
            "discount_annual_percent": Decimal("20.00"),
            "badge": "Total Compliance",
            "description": "Contabilidade oficial AT, IVA 16%, recursos humanos e controlo fabril completo.",
        },
        {
            "plan_id": "enterprise",
            "name": "Enterprise Ilimitado",
            "monthly_price_mzn": Decimal("7500.00"),
            "included_modules": ["*"],
            "discount_annual_percent": Decimal("25.00"),
            "badge": "Tudo Incluído",
            "description": "Todos os módulos liberados, multi-lojas, suporte prioritário 24/7 e consultoria técnica.",
        },
    ]

    _default_discount_rules = [
        {
            "rule_id": "combo_3",
            "name": "Desconto Combo 3+ Módulos",
            "code": None,
            "discount_percent": Decimal("10.00"),
            "discount_fixed_mzn": Decimal("0.00"),
            "min_modules_count": 3,
            "billing_cycle": None,
            "is_active": True,
        },
        {
            "rule_id": "combo_5",
            "name": "Desconto Combo 5+ Módulos",
            "code": None,
            "discount_percent": Decimal("20.00"),
            "discount_fixed_mzn": Decimal("0.00"),
            "min_modules_count": 5,
            "billing_cycle": None,
            "is_active": True,
        },
        {
            "rule_id": "semiannual_cycle",
            "name": "Desconto Pagamento Semestral",
            "code": None,
            "discount_percent": Decimal("10.00"),
            "discount_fixed_mzn": Decimal("0.00"),
            "min_modules_count": 1,
            "billing_cycle": "semiannual",
            "is_active": True,
        },
        {
            "rule_id": "annual_cycle",
            "name": "Desconto Pagamento Anual (2 Meses Grátis)",
            "code": None,
            "discount_percent": Decimal("20.00"),
            "discount_fixed_mzn": Decimal("0.00"),
            "min_modules_count": 1,
            "billing_cycle": "annual",
            "is_active": True,
        },
        {
            "rule_id": "coupon_carpintaria300",
            "name": "Cupão Especial de Lançamento Carpintaria Digital",
            "code": "CARPINTARIA300",
            "discount_percent": Decimal("15.00"),
            "discount_fixed_mzn": Decimal("0.00"),
            "min_modules_count": 1,
            "billing_cycle": None,
            "is_active": True,
        },
    ]

    # Armazenamento em memória / cache de sessão para alterações em runtime pelo Criador
    _custom_module_overrides: Dict[str, Dict[str, Any]] = {}
    _custom_starting_price: Optional[Decimal] = None

    def get_module_pricing_catalog(self) -> Dict[str, Any]:
        """Obter catálogo completo de módulos, planos predefinidos e regras de desconto."""
        modules = []
        for m in self._default_modules:
            mod_id = m["module_id"]
            if mod_id in self._custom_module_overrides:
                override = self._custom_module_overrides[mod_id]
                modules.append({
                    **m,
                    "base_price_mzn": override.get("base_price_mzn", m["base_price_mzn"]),
                    "discount_percent": override.get("discount_percent", m["discount_percent"]),
                    "is_active": override.get("is_active", m["is_active"]),
                })
            else:
                modules.append(m)

        starting_price = self._custom_starting_price or Decimal("300.00")

        return {
            "currency": "MZN",
            "starting_price_mzn": starting_price,
            "modules": modules,
            "plans": self._default_plans,
            "discount_rules": self._default_discount_rules,
        }

    def update_module_pricing(self, modules_update: List[Dict[str, Any]], starting_price: Optional[Decimal] = None) -> Dict[str, Any]:
        """Atualizar preços e descontos dos módulos pelo Criador/Admin."""
        for item in modules_update:
            mod_id = item["module_id"]
            self._custom_module_overrides[mod_id] = {
                "base_price_mzn": Decimal(str(item["base_price_mzn"])),
                "discount_percent": Decimal(str(item.get("discount_percent", 0))),
                "is_active": item.get("is_active", True),
            }

        if starting_price is not None:
            self._custom_starting_price = Decimal(str(starting_price))

        return self.get_module_pricing_catalog()

    def calculate_custom_plan(
        self, selected_modules: List[str], billing_cycle: str = "monthly", coupon_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """Calcula o valor mensal, descontos por quantidade de módulos e descontos de ciclo anual/semestral."""
        catalog = self.get_module_pricing_catalog()
        modules_map = {m["module_id"]: m for m in catalog["modules"]}

        selected_items = []
        monthly_subtotal = Decimal("0.00")

        # Selecionou todos
        if "*" in selected_modules:
            chosen_keys = list(modules_map.keys())
        else:
            chosen_keys = [k for k in selected_modules if k in modules_map]

        if not chosen_keys:
            chosen_keys = ["pos"]

        for mod_id in chosen_keys:
            m = modules_map[mod_id]
            base_p = m["base_price_mzn"]
            disc_p = m["discount_percent"]
            disc_val = base_p * (disc_p / Decimal("100.00"))
            net_p = max(Decimal("0.00"), base_p - disc_val)
            monthly_subtotal += net_p
            selected_items.append({
                "module_id": mod_id,
                "name": m["name"],
                "base_price_mzn": base_p,
                "discount_mzn": round(disc_val, 2),
                "net_price_mzn": round(net_p, 2),
            })

        months = 1
        cycle_discount_rate = Decimal("0.00")
        applied_discounts = []

        # 1. Desconto por quantidade de módulos
        mod_count = len(chosen_keys)
        if mod_count >= 5:
            applied_discounts.append("Desconto Combo 5+ Módulos (-20%)")
            monthly_subtotal = monthly_subtotal * Decimal("0.80")
        elif mod_count >= 3:
            applied_discounts.append("Desconto Combo 3+ Módulos (-10%)")
            monthly_subtotal = monthly_subtotal * Decimal("0.90")

        # Garantir piso mínimo de 300 MT por mês para qualquer pacote contratado
        if monthly_subtotal < Decimal("300.00"):
            monthly_subtotal = Decimal("300.00")

        if billing_cycle == "annual":
            months = 12
            cycle_discount_rate = Decimal("0.20")  # 20% desconto anual (2 meses grátis)
            applied_discounts.append("Desconto Plano Anual (-20% / 2 meses grátis)")
        elif billing_cycle == "semiannual":
            months = 6
            cycle_discount_rate = Decimal("0.10")  # 10% desconto semestral
            applied_discounts.append("Desconto Plano Semestral (-10%)")

        cycle_subtotal = monthly_subtotal * Decimal(str(months))
        cycle_discount = cycle_subtotal * cycle_discount_rate

        # 2. Cupão promocional
        if coupon_code and coupon_code.strip().upper() == "CARPINTARIA300":
            coupon_disc = (cycle_subtotal - cycle_discount) * Decimal("0.15")
            cycle_discount += coupon_disc
            applied_discounts.append("Cupão CARPINTARIA300 (-15% Adicional)")

        cycle_total = max(Decimal("300.00"), cycle_subtotal - cycle_discount)
        effective_monthly = cycle_total / Decimal(str(months))

        return {
            "selected_modules_count": mod_count,
            "billing_cycle": billing_cycle,
            "billing_months": months,
            "monthly_subtotal_mzn": round(monthly_subtotal, 2),
            "cycle_subtotal_mzn": round(cycle_subtotal, 2),
            "cycle_discount_mzn": round(cycle_discount, 2),
            "cycle_total_mzn": round(cycle_total, 2),
            "effective_monthly_mzn": round(effective_monthly, 2),
            "applied_discounts": applied_discounts,
            "breakdown": selected_items,
            "currency": "MZN",
        }

