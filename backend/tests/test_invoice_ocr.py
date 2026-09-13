from datetime import date
from decimal import Decimal
import pytest
from pydantic import ValidationError

from app.schemas.invoice_ocr import InvoiceItem, InvoiceOCRResponse
from app.services.invoice_ocr_service import invoice_ocr_service


def test_valid_invoice_ocr_schema():
    invoice = InvoiceOCRResponse(
        nuit="400123456",
        nome_empresa="Carpintaria Digital, Lda",
        data_fatura=date(2026, 9, 12),
        total_sem_iva=Decimal("1000.00"),
        iva_16=Decimal("160.00"),
        total_com_iva=Decimal("1160.00"),
        items=[
            InvoiceItem(
                descricao="Licença TiConta ERP v2",
                quantidade=Decimal("1.0"),
                preco_unitario=Decimal("1000.00"),
                iva_aplicado=True
            )
        ]
    )
    assert invoice.nuit == "400123456"
    assert invoice.total_com_iva == Decimal("1160.00")
    assert invoice.items[0].subtotal == Decimal("1000.00")


def test_invalid_nuit_length():
    with pytest.raises(ValidationError) as exc:
        InvoiceOCRResponse(
            nuit="12345",  # Apenas 5 dígitos
            nome_empresa="Empresa Teste",
            data_fatura=date(2026, 9, 12),
            total_sem_iva=Decimal("100.00"),
            iva_16=Decimal("16.00"),
            total_com_iva=Decimal("116.00")
        )
    assert "NUIT inválido" in str(exc.value)


def test_invalid_iva_calculation():
    with pytest.raises(ValidationError) as exc:
        InvoiceOCRResponse(
            nuit="400123456",
            nome_empresa="Empresa Teste",
            data_fatura=date(2026, 9, 12),
            total_sem_iva=Decimal("1000.00"),
            iva_16=Decimal("100.00"),  # Errado: 16% de 1000 é 160
            total_com_iva=Decimal("1100.00")  # Errado
        )
    assert "Incoerência fiscal no cálculo do IVA de 16%" in str(exc.value)


def test_invoice_ocr_service_processing():
    sample_text = """
    FATURA FISCAL Nº FT 2026/089
    Emitente: Fornecedor de TI Moçambique, Lda
    NUIT: 400 987 654
    Data de Emissão: 12/09/2026
    
    Descrição: Manutenção de Servidores e PDV
    Subtotal: 2500.00 MZN
    IVA (16%): 400.00 MZN
    Total a Pagar: 2900.00 MZN
    """
    validated, errors = invoice_ocr_service.process_invoice(sample_text.encode("utf-8"), "fatura.txt")
    assert errors == []
    assert validated is not None
    assert validated.nuit == "400987654"
    assert validated.total_sem_iva == Decimal("2500.00")
    assert validated.iva_16 == Decimal("400.00")
    assert validated.total_com_iva == Decimal("2900.00")
