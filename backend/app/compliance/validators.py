import re
from decimal import Decimal
from typing import Union


def validate_nuit(nuit: Union[str, int], strict: bool = False) -> bool:
    """
    Valida NUIT moçambicano (9 dígitos).
    strict=True: valida o dígito de controlo Módulo 11 (AT compliant).
    strict=False: aceita qualquer sequência de 9 dígitos numéricos.
    """
    digits = [int(d) for d in str(nuit) if d.isdigit()]
    if len(digits) != 9:
        return False
    if not strict:
        return True
    # Cálculo Módulo 11
    weights = [9, 8, 7, 6, 5, 4, 3, 2]
    total = sum(d * w for d, w in zip(digits[:8], weights))
    remainder = total % 11
    check_digit = 0 if remainder in (0, 1) else 11 - remainder
    return digits[8] == check_digit


def validate_invoice_number(invoice_number: str) -> bool:
    """
    Valida o formato da fatura exigido pela AT Moçambique (ex: FT 2024/00001, FR 2026/00120, VD 2024/1).
    """
    pattern = r"^(FT|FR|VD|NC|ND)\s+\d{4}\/\d+$"
    return bool(re.match(pattern, invoice_number.strip()))


def validate_tax_amounts(gross_amount: Decimal, tax_amount: Decimal, rate: Decimal = Decimal("16.0")) -> bool:
    """
    Verifica se o valor do IVA calculado coincide com a taxa declarada (com tolerância de arredondamento de 0.02 MZN).
    """
    expected_tax = (gross_amount * (rate / Decimal("100.0"))).quantize(Decimal("0.01"))
    return abs(expected_tax - tax_amount) <= Decimal("0.05")
