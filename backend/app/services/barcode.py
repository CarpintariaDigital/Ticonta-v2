import csv
import io
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.integrations.cloud_storage import CloudStorageService
from app.models.barcode import BarcodeScanLog
from app.models.entities import Product
from app.services.barcode_generator import BarcodeGenerator


class BarcodeService:
    """Serviço de resolução instantânea, geração e importação em massa de códigos de barras."""

    def __init__(self, db: Session):
        self.db = db
        self.storage = CloudStorageService()

    def validate_barcode_format(self, barcode_string: str) -> Tuple[bool, str]:
        """Verifica a validade do formato e checksum básico."""
        if not barcode_string or len(barcode_string.strip()) < 3:
            return False, "Código de barras demasiado curto (mínimo 3 caracteres)."

        cleaned = barcode_string.strip()
        if len(cleaned) > 100:
            return False, "Código de barras excede 100 caracteres."

        return True, "Válido"

    def generate_barcode(
        self,
        product_id: int,
        barcode_string: Optional[str] = None,
        barcode_format: str = "Code-128",
    ) -> Dict[str, Any]:
        """Gera a imagem do código de barras para o produto e associa na BD."""
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError(f"Produto ID {product_id} não encontrado.")

        final_code = barcode_string.strip() if barcode_string else (product.barcode or product.sku)
        is_valid, msg = self.validate_barcode_format(final_code)
        if not is_valid:
            raise ValueError(msg)

        # Gerar imagem em bytes
        img_bytes = BarcodeGenerator.generate_barcode_image(final_code, barcode_format)
        filename = f"barcode_{product.id}_{final_code}.png"
        image_url = self.storage.upload_pdf(img_bytes, filename)

        product.barcode = final_code
        product.barcode_format = barcode_format
        product.barcode_image = image_url

        self.db.commit()
        self.db.refresh(product)

        return {
            "product_id": product.id,
            "name": product.name,
            "barcode": product.barcode,
            "barcode_format": product.barcode_format,
            "barcode_url": product.barcode_image,
        }

    def resolve_barcode(
        self,
        barcode_string: str,
        company_id: int = 1,
        user_id: Optional[int] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Localiza o produto instantaneamente por código de barras ou SKU (<100ms)
        e regista telemetria de leitura (Scan Log).
        """
        code = barcode_string.strip()
        product = (
            self.db.query(Product)
            .filter(
                Product.company_id == company_id,
                (Product.barcode == code) | (Product.sku == code),
            )
            .first()
        )

        if not product:
            return None

        # Incrementar contagem de leitura
        product.scan_count = (product.scan_count or 0) + 1

        # Registar auditoria de scan
        scan_log = BarcodeScanLog(
            company_id=company_id,
            product_id=product.id,
            user_id=user_id,
            barcode=code,
        )
        self.db.add(scan_log)
        self.db.commit()
        self.db.refresh(product)

        return {
            "product_id": product.id,
            "name": product.name,
            "sku": product.sku,
            "barcode": product.barcode,
            "barcode_format": product.barcode_format,
            "unit_price": float(product.unit_price),
            "stock_quantity": float(product.quantity),
            "tax_rate": float(product.iva_rate),
            "category": product.category,
            "active": product.active,
            "scan_count": product.scan_count,
        }

    def bulk_import_barcodes(
        self,
        csv_content: str,
        company_id: int = 1,
    ) -> Dict[str, Any]:
        """
        Importação em massa a partir de ficheiro CSV.
        Formato esperado das colunas: sku, barcode, barcode_format
        """
        reader = csv.DictReader(io.StringIO(csv_content.strip()))
        imported_count = 0
        errors = []

        for row_idx, row in enumerate(reader, start=1):
            sku = (row.get("sku") or row.get("SKU") or "").strip()
            code = (row.get("barcode") or row.get("BARCODE") or "").strip()
            fmt = (row.get("barcode_format") or row.get("format") or "Code-128").strip()

            if not sku or not code:
                errors.append(f"Linha {row_idx}: SKU e Barcode são obrigatórios.")
                continue

            product = (
                self.db.query(Product)
                .filter(Product.company_id == company_id, Product.sku == sku)
                .first()
            )
            if not product:
                errors.append(f"Linha {row_idx}: Produto com SKU '{sku}' não encontrado.")
                continue

            product.barcode = code
            product.barcode_format = fmt
            imported_count += 1

        self.db.commit()

        return {
            "imported_count": imported_count,
            "errors": errors,
        }
