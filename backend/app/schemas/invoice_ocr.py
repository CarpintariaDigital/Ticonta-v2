"""
Pydantic Schema for Mozambique Fiscal Invoice OCR & Ingestion (TiConta ERP v2).
Validates 9-digit NUIT, 16% standard VAT (IVA), and itemized invoice calculations.
"""

from datetime import date
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


class InvoiceItem(BaseModel):
    descricao: str = Field(..., description="Descrição do produto ou serviço")
    quantidade: Decimal = Field(default=Decimal("1.0"), ge=Decimal("0.001"), description="Quantidade faturada")
    preco_unitario: Decimal = Field(..., ge=Decimal("0.0"), description="Preço unitário em Meticais (MZN)")
    iva_aplicado: bool = Field(default=True, description="Indica se o item está sujeito à taxa normal de IVA de 16%")
    subtotal: Optional[Decimal] = Field(default=None, description="Subtotal da linha (quantidade * preco_unitario)")

    @model_validator(mode="after")
    def calculate_subtotal(self) -> "InvoiceItem":
        if self.subtotal is None:
            self.subtotal = (self.quantidade * self.preco_unitario).quantize(Decimal("0.01"))
        return self


class InvoiceOCRResponse(BaseModel):
    nuit: str = Field(..., description="Número Único de Identificação Tributária (9 dígitos numéricos)")
    nome_empresa: str = Field(..., min_length=2, description="Denominação social ou nome comercial da entidade emitente")
    data_fatura: date = Field(..., description="Data de emissão do documento fiscal")
    numero_fatura: Optional[str] = Field(default=None, description="Número de série / identificador do documento")
    items: List[InvoiceItem] = Field(default_factory=list, description="Linhas e itens descritivos da fatura")
    total_sem_iva: Decimal = Field(..., ge=Decimal("0.0"), description="Base de incidência / Total líquido sem IVA (MZN)")
    iva_16: Decimal = Field(..., ge=Decimal("0.0"), description="Montante de IVA apurado à taxa de 16% (MZN)")
    total_com_iva: Decimal = Field(..., ge=Decimal("0.0"), description="Total bruto a pagar com IVA incluído (MZN)")
    confianca_ocr: Optional[float] = Field(default=1.0, ge=0.0, le=1.0, description="Nível de confiança da extração OCR (0.0 a 1.0)")
    observacoes: Optional[str] = Field(default=None, description="Notas ou inconformidades detectadas")

    @field_validator("nuit")
    @classmethod
    def validate_nuit(cls, value: str) -> str:
        cleaned = "".join(filter(str.isdigit, str(value).strip()))
        if len(cleaned) != 9:
            raise ValueError(f"NUIT inválido ('{value}'). Deve conter exatamente 9 dígitos numéricos conforme a legislação tributária de Moçambique.")
        return cleaned

    @model_validator(mode="after")
    def validate_totais_iva(self) -> "InvoiceOCRResponse":
        # Tolerância matemática de arredondamento aceitável (±0.01 MZN)
        tolerance = Decimal("0.01")
        taxa_iva = Decimal("0.16")
        
        iva_esperado = (self.total_sem_iva * taxa_iva).quantize(Decimal("0.01"))
        total_esperado = (self.total_sem_iva * Decimal("1.16")).quantize(Decimal("0.01"))

        diff_iva = abs(self.iva_16 - iva_esperado)
        diff_total = abs(self.total_com_iva - total_esperado)

        if diff_total > tolerance and diff_iva > tolerance:
            # Notifica erro fiscal de cálculo
            raise ValueError(
                f"Incoerência fiscal no cálculo do IVA de 16%: Total s/ IVA ({self.total_sem_iva} MZN) "
                f"+ IVA 16% ({self.iva_16} MZN) difere do Total c/ IVA ({self.total_com_iva} MZN). "
                f"Total esperado c/ IVA: {total_esperado} MZN (tolerância ±0.01 MZN)."
            )

        return self
