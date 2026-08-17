from decimal import Decimal
from typing import Any, Dict, List, Optional


class IVAController:
    """
    Controlador do Imposto sobre o Valor Acrescentado (IVA) de Moçambique.
    Taxas: 16% (Geral), 7% (Reduzida), 0% (Isenção CIVA).
    """

    RATES = {
        "standard": Decimal("16.00"),
        "reduced": Decimal("7.00"),
        "exempt": Decimal("0.00"),
    }

    def calculate_iva_sale(
        self,
        amount: Decimal,
        category: str = "standard",
        custom_rate: Optional[Decimal] = None,
    ) -> Dict[str, Any]:
        """Calcula o IVA liquidado em uma operação de venda."""
        rate = custom_rate if custom_rate is not None else self.RATES.get(category.lower(), Decimal("16.00"))
        iva_amount = (amount * (rate / Decimal("100.00"))).quantize(Decimal("0.01"))
        total_with_iva = amount + iva_amount

        return {
            "net_amount": amount,
            "iva_rate": rate,
            "iva_amount": iva_amount,
            "total_with_iva": total_with_iva,
            "category": category,
        }

    def calculate_iva_deductible(
        self,
        purchase_amount: Decimal,
        deductible_percentage: Decimal = Decimal("100.00"),
        rate: Decimal = Decimal("16.00"),
    ) -> Dict[str, Any]:
        """Calcula o IVA suportado e dedutível nas aquisições de bens e serviços."""
        iva_total = (purchase_amount * (rate / Decimal("100.00"))).quantize(Decimal("0.01"))
        deductible_amount = (iva_total * (deductible_percentage / Decimal("100.00"))).quantize(Decimal("0.01"))

        return {
            "purchase_amount": purchase_amount,
            "iva_rate": rate,
            "iva_total": iva_total,
            "deductible_percentage": deductible_percentage,
            "iva_deductible": deductible_amount,
        }

    def generate_iva_return(
        self,
        company_nuit: str,
        month: int,
        year: int,
        sales_items: List[Dict[str, Any]],
        purchases_items: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Gera a Declaração Periódica de Rendimentos do IVA (Modelo A - AT Moçambique)."""
        base_taxable_sales = Decimal("0.00")
        base_exempt_sales = Decimal("0.00")
        iva_liquidated = Decimal("0.00")

        for s in sales_items:
            amt = Decimal(str(s["amount"]))
            rate = Decimal(str(s.get("rate", "16.00")))
            if rate == Decimal("0.00"):
                base_exempt_sales += amt
            else:
                base_taxable_sales += amt
                iva_liquidated += (amt * (rate / Decimal("100.00"))).quantize(Decimal("0.01"))

        base_purchases = Decimal("0.00")
        iva_deductible = Decimal("0.00")

        for p in purchases_items:
            amt = Decimal(str(p["amount"]))
            rate = Decimal(str(p.get("rate", "16.00")))
            base_purchases += amt
            iva_deductible += (amt * (rate / Decimal("100.00"))).quantize(Decimal("0.01"))

        iva_due = iva_liquidated - iva_deductible

        return {
            "company_nuit": company_nuit,
            "period": f"{year}-{month:02d}",
            "currency": "MZN",
            "sales_taxable_base": float(base_taxable_sales),
            "sales_exempt_base": float(base_exempt_sales),
            "iva_liquidated": float(iva_liquidated),
            "purchases_base": float(base_purchases),
            "iva_deductible": float(iva_deductible),
            "iva_payable": float(max(Decimal("0.00"), iva_due)),
            "iva_credit": float(abs(min(Decimal("0.00"), iva_due))),
            "status": "VALIDATED",
        }

    def get_iva_due(self, total_liquidated: Decimal, total_deductible: Decimal) -> Decimal:
        """Retorna o valor final de IVA a pagar ou a recuperar."""
        return total_liquidated - total_deductible
