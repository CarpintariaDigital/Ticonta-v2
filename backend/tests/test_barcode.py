import io
import pytest
from app.services.barcode_generator import BarcodeGenerator
from app.services.barcode import BarcodeService


def test_barcode_generation_formats():
    # 1. Code-128
    c128_bytes = BarcodeGenerator.generate_barcode_image("SKU-PORTA-01", "Code-128")
    assert len(c128_bytes) > 200
    assert c128_bytes.startswith(b"\x89PNG")

    # 2. EAN-13
    ean_bytes = BarcodeGenerator.generate_barcode_image("560123456789", "EAN-13")
    assert len(ean_bytes) > 200
    assert ean_bytes.startswith(b"\x89PNG")

    # 3. QR-Code
    qr_bytes = BarcodeGenerator.generate_barcode_image("https://ticonta.co.mz/p/SKU-PORTA-01", "QR-Code")
    assert len(qr_bytes) > 200
    assert qr_bytes.startswith(b"\x89PNG")


def test_barcode_resolution_and_scan_logging(client, admin_token_headers):
    # 1. Gerar código de barras para o Produto ID 1 (SKU-PORTA-01)
    gen_res = client.post(
        "/api/v1/products/1/barcode/generate",
        json={"barcode_string": "560123456789", "barcode_format": "EAN-13"},
        headers=admin_token_headers,
    )
    assert gen_res.status_code == 200
    assert gen_res.json()["barcode"] == "560123456789"
    assert gen_res.json()["barcode_url"].startswith("https://")

    # 2. Resolver instantaneamente por código de barras
    resolve_res = client.get(
        "/api/v1/barcodes/resolve/560123456789?company_id=1",
        headers=admin_token_headers,
    )
    assert resolve_res.status_code == 200
    prod = resolve_res.json()
    assert prod["product_id"] == 1
    assert prod["name"] == "Porta Chanfuta Maciça"
    assert prod["unit_price"] == 7500.0
    assert prod["scan_count"] >= 1

    # 3. Resolver por SKU
    sku_res = client.get(
        "/api/v1/barcodes/resolve/SKU-CAD-02?company_id=1",
        headers=admin_token_headers,
    )
    assert sku_res.status_code == 200
    assert sku_res.json()["name"] == "Cadeira de Escritório Ergonómica"


def test_barcode_not_found(client, admin_token_headers):
    res = client.get(
        "/api/v1/barcodes/resolve/UNKNOWN-BARCODE-999?company_id=1",
        headers=admin_token_headers,
    )
    assert res.status_code == 404


def test_bulk_import_barcodes_csv(client, admin_token_headers):
    csv_content = (
        "sku,barcode,barcode_format\n"
        "SKU-PORTA-01,560999888111,EAN-13\n"
        "SKU-CAD-02,560999888222,Code-128\n"
    )

    files = {"file": ("barcodes.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    import_res = client.post(
        "/api/v1/barcodes/import?company_id=1",
        files=files,
        headers=admin_token_headers,
    )
    assert import_res.status_code == 200
    assert import_res.json()["imported_count"] == 2
    assert len(import_res.json()["errors"]) == 0

    # Verificar se foram atualizados
    res1 = client.get("/api/v1/barcodes/resolve/560999888111", headers=admin_token_headers)
    assert res1.status_code == 200
    assert res1.json()["product_id"] == 1
