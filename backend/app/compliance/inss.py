from decimal import Decimal
from typing import Any, Dict, List


class INSSCalculator:
    """
    Calculadora da Segurança Social Obrigatória de Moçambique (INSS).
    Taxas Regulamentares:
    - 3% Contribuição do Empregado (Desconto no Salário)
    - 4% Contribuição da Entidade Empregadora (Patronal)
    - Total: 7% de contribuição para o INSS
    """

    EMPLOYEE_CONTRIBUTION_RATE = Decimal("0.03")  # 3%
    EMPLOYER_CONTRIBUTION_RATE = Decimal("0.04")  # 4%
    TOTAL_RATE = Decimal("0.07")                  # 7%

    def calculate_employee_inss(self, gross_salary: Decimal) -> Decimal:
        """Calcula o desconto de 3% a reter no salário do trabalhador."""
        return (gross_salary * self.EMPLOYEE_CONTRIBUTION_RATE).quantize(Decimal("0.01"))

    def calculate_employer_inss(self, gross_salary: Decimal) -> Decimal:
        """Calcula a contribuição patronal de 4% a cargo da empresa."""
        return (gross_salary * self.EMPLOYER_CONTRIBUTION_RATE).quantize(Decimal("0.01"))

    def calculate_payroll(self, gross_salary: Decimal, additional_allowances: Decimal = Decimal("0.00")) -> Dict[str, Any]:
        """Calcula a folha individual com detalhe das contribuições do INSS."""
        base_salary = gross_salary + additional_allowances
        employee_inss = self.calculate_employee_inss(base_salary)
        employer_inss = self.calculate_employer_inss(base_salary)
        total_inss = employee_inss + employer_inss

        return {
            "gross_salary": base_salary,
            "employee_deduction": employee_inss,
            "employer_contribution": employer_inss,
            "total_inss": total_inss,
            "net_before_irt": base_salary - employee_inss,
            "currency": "MZN",
        }

    def generate_inss_declaration(
        self,
        company_nuit: str,
        company_inss_number: str,
        month: int,
        year: int,
        employees_salaries: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Gera a Folha de Relação Nominal / Guia de Pagamento mensal do INSS Moçambique."""
        total_payroll = Decimal("0.00")
        total_employee_inss = Decimal("0.00")
        total_employer_inss = Decimal("0.00")

        records = []
        for emp in employees_salaries:
            salary = Decimal(str(emp["salary"]))
            emp_inss = self.calculate_employee_inss(salary)
            pat_inss = self.calculate_employer_inss(salary)

            total_payroll += salary
            total_employee_inss += emp_inss
            total_employer_inss += pat_inss

            records.append({
                "employee_name": emp.get("name", "Trabalhador"),
                "employee_inss_number": emp.get("inss_number", "00000000"),
                "employee_nuit": emp.get("nuit", "999999999"),
                "gross_salary": float(salary),
                "employee_3pct": float(emp_inss),
                "employer_4pct": float(pat_inss),
                "total_7pct": float(emp_inss + pat_inss),
            })

        total_due = total_employee_inss + total_employer_inss

        return {
            "company_nuit": company_nuit,
            "company_inss_number": company_inss_number,
            "period": f"{year}-{month:02d}",
            "currency": "MZN",
            "total_employees": len(employees_salaries),
            "total_gross_salaries": float(total_payroll),
            "total_employee_contributions": float(total_employee_inss),
            "total_employer_contributions": float(total_employer_inss),
            "total_inss_payable": float(total_due),
            "payment_deadline": "Dia 10 do mês seguinte",
            "records": records,
            "status": "APPROVED",
        }
