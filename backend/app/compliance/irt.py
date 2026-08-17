import json
import os
from decimal import Decimal
from typing import Any, Dict, List, Optional


class IRTCalculator:
    """
    Calculadora de Imposto sobre Rendimento do Trabalho / IRPS (2ª Categoria Moçambique).
    Tabelas oficiais de retenção na fonte e escalões progressivos.
    """

    BRACKETS_2024 = [
        {"min": Decimal("0.00"), "max": Decimal("20249.99"), "rate": Decimal("0.00"), "deduction": Decimal("0.00")},
        {"min": Decimal("20250.00"), "max": Decimal("32750.00"), "rate": Decimal("0.10"), "deduction": Decimal("2025.00")},
        {"min": Decimal("32750.01"), "max": Decimal("60000.00"), "rate": Decimal("0.15"), "deduction": Decimal("3662.50")},
        {"min": Decimal("60000.01"), "max": Decimal("144250.00"), "rate": Decimal("0.20"), "deduction": Decimal("6662.50")},
        {"min": Decimal("144250.01"), "max": None, "rate": Decimal("0.25"), "deduction": Decimal("13875.00")},
    ]

    def __init__(self, brackets: Optional[List[Dict[str, Any]]] = None):
        self.brackets = brackets or self.BRACKETS_2024

    def calculate_taxable_income(
        self,
        gross_salary: Decimal,
        inss_employee_deduction: Decimal = Decimal("0.00"),
        other_deductions: Decimal = Decimal("0.00"),
    ) -> Decimal:
        """Calcula o rendimento coletável (Salário Bruto deduzido de INSS obrigatório)."""
        taxable = gross_salary - inss_employee_deduction - other_deductions
        return max(Decimal("0.00"), taxable)

    def apply_tax_brackets(self, taxable_income: Decimal) -> Dict[str, Any]:
        """Aplica a tabela progressiva de retenção na fonte do IRPS/IRT."""
        if taxable_income <= Decimal("0.00"):
            return {
                "taxable_income": Decimal("0.00"),
                "rate": Decimal("0.00"),
                "deduction": Decimal("0.00"),
                "tax_due": Decimal("0.00"),
            }

        for b in self.brackets:
            min_val = b["min"]
            max_val = b["max"]
            if min_val <= taxable_income and (max_val is None or taxable_income <= max_val):
                rate = Decimal(str(b["rate"]))
                deduction = Decimal(str(b["deduction"]))
                tax_due = (taxable_income * rate) - deduction
                tax_due = max(Decimal("0.00"), tax_due).quantize(Decimal("0.01"))
                return {
                    "taxable_income": taxable_income,
                    "rate": rate * Decimal("100.0"),
                    "deduction": deduction,
                    "tax_due": tax_due,
                }

        # Fallback último escalão
        last = self.brackets[-1]
        rate = Decimal(str(last["rate"]))
        deduction = Decimal(str(last["deduction"]))
        tax_due = max(Decimal("0.00"), (taxable_income * rate) - deduction).quantize(Decimal("0.01"))
        return {
            "taxable_income": taxable_income,
            "rate": rate * Decimal("100.0"),
            "deduction": deduction,
            "tax_due": tax_due,
        }

    def generate_irt_declaration(
        self,
        company_nuit: str,
        payroll_items: List[Dict[str, Any]],
        month: int,
        year: int,
    ) -> Dict[str, Any]:
        """Gera declaração mensal modelo M/19 da Autoridade Tributária de Moçambique."""
        total_gross = Decimal("0.00")
        total_taxable = Decimal("0.00")
        total_irt_retained = Decimal("0.00")

        processed_employees = []
        for item in payroll_items:
            gross = Decimal(str(item["gross_salary"]))
            inss_ded = (gross * Decimal("0.03")).quantize(Decimal("0.01"))
            taxable = self.calculate_taxable_income(gross, inss_ded)
            calc = self.apply_tax_brackets(taxable)

            total_gross += gross
            total_taxable += taxable
            total_irt_retained += calc["tax_due"]

            processed_employees.append({
                "employee_nuit": item.get("nuit", "999999999"),
                "employee_name": item.get("name", "Trabalhador"),
                "gross_salary": float(gross),
                "taxable_income": float(taxable),
                "irt_rate": float(calc["rate"]),
                "irt_retained": float(calc["tax_due"]),
            })

        return {
            "company_nuit": company_nuit,
            "declaration_period": f"{year}-{month:02d}",
            "currency": "MZN",
            "employee_count": len(payroll_items),
            "total_gross_salaries": float(total_gross),
            "total_taxable_income": float(total_taxable),
            "total_irt_payable": float(total_irt_retained),
            "employees": processed_employees,
            "status": "READY_FOR_SUBMISSION",
        }

    def calculate_quarterly_installments(self, previous_year_turnover: Decimal) -> Dict[str, Any]:
        """Calcula pagamentos por conta (PPC) trimestrais do IRPC/IRT empresarial."""
        # 80% do imposto do ano anterior dividido em 3 prestações (Julho, Setembro, Novembro)
        estimated_tax = previous_year_turnover * Decimal("0.32") * Decimal("0.80")
        installment = (estimated_tax / Decimal("3.0")).quantize(Decimal("0.01"))

        return {
            "annual_base_turnover": float(previous_year_turnover),
            "total_ppc": float(estimated_tax),
            "quarterly_installment": float(installment),
            "due_dates": ["31 de Julho", "30 de Setembro", "30 de Novembro"],
        }


def calculate_irt(
    gross_salary: Decimal,
    dependents: int = 0,
    inss_deduction: Optional[Decimal] = None,
) -> Dict[str, Any]:
    """
    Função de conveniência para cálculo do IRPS / IRT (2ª Categoria Moçambique).
    
    Aplica:
    1. Dedução de INSS obrigatório (3% do trabalhador)
    2. Tabela progressiva de retenção na fonte
    3. Abatimento adicional por dependentes a cargo
    4. Isenção total para rendimentos abaixo do limiar (20.249,99 MZN)
    """
    if not isinstance(gross_salary, Decimal):
        gross_salary = Decimal(str(gross_salary))

    if inss_deduction is None:
        inss = (gross_salary * Decimal("0.03")).quantize(Decimal("0.01"))
    else:
        inss = Decimal(str(inss_deduction)) if not isinstance(inss_deduction, Decimal) else inss_deduction

    calc = IRTCalculator()
    taxable = calc.calculate_taxable_income(gross_salary, inss_employee_deduction=inss)
    bracket_res = calc.apply_tax_brackets(taxable)

    # Abatimento por dependentes (100 MZN por dependente deduzido no imposto)
    dependents_deduction = Decimal(str(dependents)) * Decimal("100.00")
    tax_due = max(Decimal("0.00"), bracket_res["tax_due"] - dependents_deduction).quantize(Decimal("0.01"))

    return {
        "gross_salary": gross_salary,
        "taxable_income": taxable,
        "base_tax": bracket_res["tax_due"],
        "dependents": dependents,
        "dependents_deduction": dependents_deduction,
        "tax_due": tax_due,
        "irt_retained": tax_due,
        "rate": bracket_res["rate"],
    }

