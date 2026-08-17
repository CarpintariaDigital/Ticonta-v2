from decimal import Decimal
from typing import Any, Dict


class PITACalculator:
    """
    Calculadora do Regime Simplificado de Tributação / Imposto Simplificado para Pequenos Contribuintes (PITA / ISPC Moçambique).
    Destinado a micro e pequenas empresas com faturação simplificada.
    """

    RATES = {
        "micro": Decimal("3.00"),     # Microempresa: faturação até 2.500.000 MZN
        "pequena": Decimal("5.00"),   # Pequena empresa: até 7.500.000 MZN
        "grande": Decimal("32.00"),   # Regime Geral (IRPC sobre o lucro tributável)
    }

    TURNOVER_LIMIT_MICRO = Decimal("2500000.00")
    TURNOVER_LIMIT_PEQUENA = Decimal("7500000.00")

    def determine_category(self, annual_turnover: Decimal) -> str:
        """Determina o enquadramento fiscal com base na faturação anual."""
        if annual_turnover <= self.TURNOVER_LIMIT_MICRO:
            return "micro"
        elif annual_turnover <= self.TURNOVER_LIMIT_PEQUENA:
            return "pequena"
        return "grande"

    def calculate_pita(
        self,
        turnover_amount: Decimal,
        category: str = "micro",
    ) -> Dict[str, Any]:
        """Calcula o imposto simplificado incidente sobre o volume de negócios do período."""
        cat = category.lower()
        rate = self.RATES.get(cat, Decimal("3.00"))

        if cat == "grande":
            # No regime geral aplica-se 32% sobre lucro estimado/real
            tax_amount = (turnover_amount * (Decimal("0.32") * Decimal("0.20"))).quantize(Decimal("0.01"))
        else:
            tax_amount = (turnover_amount * (rate / Decimal("100.00"))).quantize(Decimal("0.01"))

        return {
            "turnover_amount": turnover_amount,
            "category": cat,
            "rate": rate,
            "pita_due": tax_amount,
            "currency": "MZN",
        }

    def calculate_annual_pita(self, quarterly_turnovers: list) -> Dict[str, Any]:
        """Calcula o somatório anual e o imposto total liquidado."""
        total_turnover = sum((Decimal(str(t)) for t in quarterly_turnovers), Decimal("0.00"))
        category = self.determine_category(total_turnover)
        calc = self.calculate_pita(total_turnover, category)

        return {
            "annual_turnover": float(total_turnover),
            "assigned_category": category,
            "tax_rate": float(calc["rate"]),
            "annual_tax_due": float(calc["pita_due"]),
            "currency": "MZN",
        }
