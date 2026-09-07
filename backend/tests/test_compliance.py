from decimal import Decimal
import pytest

from app.compliance.irt import IRTCalculator, calculate_irt
from app.compliance.iva import IVAController
from app.compliance.pita import PITACalculator
from app.compliance.inss import INSSCalculator
from app.compliance.e_invoice import ElectronicInvoice
from app.compliance.validators import validate_nuit, validate_invoice_number, validate_tax_amounts


def test_validate_nuit_mozambique():
    assert validate_nuit("400123456") is True
    assert validate_nuit("100200300") is True
    assert validate_nuit("12345") is False
    assert validate_nuit("ABCDEFGHI") is False
    assert validate_nuit("4001234567") is False


def test_validate_invoice_number():
    assert validate_invoice_number("FT 2024/00001") is True
    assert validate_invoice_number("FR 2026/00120") is True
    assert validate_invoice_number("VD 2024/1") is True
    assert validate_invoice_number("FATURA-123") is False


def test_validate_tax_amounts():
    # 16% de 1000 = 160
    assert validate_tax_amounts(Decimal("1000.00"), Decimal("160.00"), Decimal("16.0")) is True
    assert validate_tax_amounts(Decimal("1000.00"), Decimal("200.00"), Decimal("16.0")) is False


def test_irt_calculations_brackets():
    calc = IRTCalculator()

    # Isento até 20.249,99 MZN
    r1 = calc.apply_tax_brackets(Decimal("18000.00"))
    assert float(r1["tax_due"]) == 0.00

    # 1º Escalão (10%): Salário 25.000 MZN -> 25000*0.10 - 2025 = 475.00 MZN
    r2 = calc.apply_tax_brackets(Decimal("25000.00"))
    assert float(r2["tax_due"]) == 475.00

    # 2º Escalão (15%): Salário 40.000 MZN -> 40000*0.15 - 3662.50 = 2337.50 MZN
    r3 = calc.apply_tax_brackets(Decimal("40000.00"))
    assert float(r3["tax_due"]) == 2337.50

    # Declaração mensal IRT
    dec = calc.generate_irt_declaration(
        company_nuit="400123456",
        payroll_items=[
            {"name": "Trabalhador 1", "gross_salary": "25000.00", "nuit": "100100100"},
            {"name": "Trabalhador 2", "gross_salary": "15000.00", "nuit": "200200200"},
        ],
        month=8,
        year=2026,
    )
    assert dec["company_nuit"] == "400123456"
    assert dec["employee_count"] == 2
    assert dec["status"] == "READY_FOR_SUBMISSION"


def test_calculate_irt_with_dependents_deduction():
    """
    Teste 1: trabalhador com salário de 25.000 MZN e 3 dependentes —
    valida que a isenção adicional por dependentes reduz correctamente
    o IRPS calculado vs o mesmo salário sem dependentes.
    """
    salary = Decimal("25000.00")

    # Cálculo sem dependentes
    res_no_dependents = calculate_irt(gross_salary=salary, dependents=0)
    tax_without_dependents = res_no_dependents["irt_retained"]

    # Cálculo com 3 dependentes
    res_with_dependents = calculate_irt(gross_salary=salary, dependents=3)
    tax_with_dependents = res_with_dependents["irt_retained"]

    assert tax_without_dependents > Decimal("0.00")
    assert tax_with_dependents < tax_without_dependents
    assert res_with_dependents["dependents"] == 3
    assert res_with_dependents["dependents_deduction"] == Decimal("300.00")
    assert tax_with_dependents == (tax_without_dependents - Decimal("300.00"))


def test_calculate_irt_below_minimum_exempt_salary():
    """
    Teste 2: trabalhador com salário abaixo do mínimo isento (15.000 MZN) —
    valida que o resultado é 0.00 MZN de retenção (isenção total).
    """
    salary = Decimal("15000.00")
    result = calculate_irt(gross_salary=salary, dependents=0)

    assert result["tax_due"] == Decimal("0.00")
    assert result["irt_retained"] == Decimal("0.00")
    assert float(result["irt_retained"]) == 0.00
    assert float(result["rate"]) == 0.00


def test_iva_controller_rates_and_return():
    iva = IVAController()

    # Venda Geral 16%
    sale_std = iva.calculate_iva_sale(Decimal("10000.00"), category="standard")
    assert float(sale_std["iva_amount"]) == 1600.00
    assert float(sale_std["total_with_iva"]) == 11600.00

    # Venda Reduzida 7% (Hotelaria/Restauração)
    sale_red = iva.calculate_iva_sale(Decimal("10000.00"), category="reduced")
    assert float(sale_red["iva_amount"]) == 700.00

    # Declaração Periódica do IVA
    return_doc = iva.generate_iva_return(
        company_nuit="400123456",
        month=8,
        year=2026,
        sales_items=[{"amount": "50000.00", "rate": "16.00"}],
        purchases_items=[{"amount": "20000.00", "rate": "16.00"}],
    )
    assert float(return_doc["iva_liquidated"]) == 8000.00   # 16% de 50.000
    assert float(return_doc["iva_deductible"]) == 3200.00   # 16% de 20.000
    assert float(return_doc["iva_payable"]) == 4800.00      # 8000 - 3200


def test_pita_simplified_tax():
    pita = PITACalculator()

    # Microempresa: 3% sobre faturação
    res_micro = pita.calculate_pita(Decimal("100000.00"), category="micro")
    assert float(res_micro["pita_due"]) == 3000.00

    # Pequena empresa: 5% sobre faturação
    res_peq = pita.calculate_pita(Decimal("100000.00"), category="pequena")
    assert float(res_peq["pita_due"]) == 5000.00

    # Teste anual de enquadramento
    annual = pita.calculate_annual_pita([500000, 400000, 600000, 500000])  # 2.000.000 MZN -> Micro
    assert annual["assigned_category"] == "micro"
    assert annual["annual_turnover"] == 2000000.00
    assert annual["annual_tax_due"] == 60000.00  # 3% de 2M


def test_inss_contributions_and_declaration():
    inss = INSSCalculator()

    # Salário Bruto 30.000 MZN
    emp_ded = inss.calculate_employee_inss(Decimal("30000.00"))
    pat_ded = inss.calculate_employer_inss(Decimal("30000.00"))

    assert float(emp_ded) == 900.00   # 3% de 30.000
    assert float(pat_ded) == 1200.00  # 4% de 30.000

    payroll = inss.calculate_payroll(Decimal("30000.00"))
    assert float(payroll["total_inss"]) == 2100.00  # 7% total
    assert float(payroll["net_before_irt"]) == 29100.00

    # Declaração Guia INSS
    guide = inss.generate_inss_declaration(
        company_nuit="400123456",
        company_inss_number="98765432",
        month=8,
        year=2026,
        employees_salaries=[
            {"name": "Carlos", "salary": "30000.00"},
            {"name": "Ana", "salary": "20000.00"},
        ],
    )
    assert guide["total_employees"] == 2
    assert float(guide["total_gross_salaries"]) == 50000.00
    assert float(guide["total_employee_contributions"]) == 1500.00  # 3% de 50k
    assert float(guide["total_employer_contributions"]) == 2000.00  # 4% de 50k
    assert float(guide["total_inss_payable"]) == 3500.00            # 7% de 50k


def test_electronic_invoice_nfe_signature_and_validation():
    nfe_service = ElectronicInvoice(private_signing_key="TEST_KEY_2026")

    nfe = nfe_service.generate_nfe(
        invoice_number="FT 2026/00099",
        company_nuit="400123456",
        company_name="TiConta Lda",
        customer_nuit="100200300",
        customer_name="Cliente Exemplo",
        items=[{"product_id": 1, "quantity": 2, "unit_price": 500.0, "tax_rate": 16.0}],
        gross_amount=Decimal("1000.00"),
        tax_amount=Decimal("160.00"),
        discount_amount=Decimal("0.00"),
        net_amount=Decimal("1160.00"),
    )

    assert nfe["status"] == "CERTIFIED"
    assert "digital_signature" in nfe
    assert len(nfe["digital_signature"]) == 64  # SHA-256 hex string

    # Validação da Assinatura
    assert nfe_service.validate_nfe(nfe) is True

    # Adulteração de valor invalida a assinatura
    tampered_nfe = dict(nfe)
    tampered_nfe["totals"] = dict(nfe["totals"])
    tampered_nfe["totals"]["net_amount"] = 9999.00
    assert nfe_service.validate_nfe(tampered_nfe) is False

    # Submissão à AT
    submission = nfe_service.submit_to_authorities(nfe)
    assert submission["success"] is True
    assert submission["status"] == "ACCEPTED"
