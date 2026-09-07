import io
from typing import Optional
import barcode
from barcode.writer import ImageWriter
import qrcode


class BarcodeGenerator:
    """Gerador multiformato de Códigos de Barras e QR-Codes em PNG/SVG para produtos."""

    @staticmethod
    def generate_barcode_image(
        code_string: str,
        barcode_format: str = "Code-128",
    ) -> bytes:
        """
        Gera imagem PNG em bytes do código de barras ou QR Code.
        Formatos suportados: Code-128, EAN-13, UPC-A, QR-Code
        """
        fmt = barcode_format.upper().replace(" ", "").replace("_", "-")

        if fmt in ["QR", "QRCODE", "QR-CODE"]:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=8,
                border=2,
            )
            qr.add_data(code_string)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            return buffer.getvalue()

        elif fmt == "EAN-13":
            # EAN-13 requer 12 ou 13 dígitos
            digits = "".join(filter(str.isdigit, code_string)).zfill(12)[:12]
            ean_class = barcode.get_barcode_class("ean13")
            ean = ean_class(digits, writer=ImageWriter())
            buffer = io.BytesIO()
            ean.write(buffer)
            return buffer.getvalue()

        elif fmt == "UPC-A":
            digits = "".join(filter(str.isdigit, code_string)).zfill(11)[:11]
            upc_class = barcode.get_barcode_class("upca")
            upc = upc_class(digits, writer=ImageWriter())
            buffer = io.BytesIO()
            upc.write(buffer)
            return buffer.getvalue()

        else:
            # Code-128 (Padrão alfanumérico flexível)
            code128_class = barcode.get_barcode_class("code128")
            c128 = code128_class(code_string, writer=ImageWriter())
            buffer = io.BytesIO()
            c128.write(buffer)
            return buffer.getvalue()
