import io
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm


class PDFGenerator:
    """Motor de geração de documentos fiscais e comerciais profissionais em PDF para o TiConta v2."""

    @staticmethod
    def generate_invoice_pdf(
        company_data: Dict[str, Any],
        customer_data: Dict[str, Any],
        sale_data: Dict[str, Any],
        items: List[Dict[str, Any]],
    ) -> bytes:
        """Gera Fatura Comercial A4 com conformidade fiscal para Moçambique."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=1.5 * cm,
            leftMargin=1.5 * cm,
            topMargin=1.5 * cm,
            bottomMargin=1.5 * cm,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "InvoiceTitle",
            parent=styles["Heading1"],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#065F46"),
        )
        subtitle_style = ParagraphStyle(
            "InvoiceSubtitle",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#4B5563"),
        )
        bold_style = ParagraphStyle(
            "BoldText",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            fontName="Helvetica-Bold",
        )

        story = []

        # 1. Cabeçalho da Empresa & Identificador da Fatura
        header_table_data = [
            [
                Paragraph(f"<b>{company_data.get('name', 'TiConta Enterprise Lda')}</b><br/>"
                          f"NUIT: {company_data.get('nuit', '400123999')}<br/>"
                          f"{company_data.get('address', 'Av. 24 de Julho, Maputo')}<br/>"
                          f"Email: {company_data.get('email', 'contato@ticonta.co.mz')}", subtitle_style),
                Paragraph(f"<font size=16 color='#065F46'><b>FATURA</b></font><br/>"
                          f"<b>Nº:</b> {sale_data.get('invoice_number', 'FT-2026/001')}<br/>"
                          f"<b>Data:</b> {sale_data.get('date', datetime.utcnow().strftime('%d/%m/%Y'))}<br/>"
                          f"<b>Moeda:</b> MZN", subtitle_style),
            ]
        ]
        t_header = Table(header_table_data, colWidths=[10 * cm, 8 * cm])
        t_header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
        story.append(t_header)
        story.append(Spacer(1, 0.6 * cm))

        # 2. Dados do Cliente
        cust_table_data = [
            [
                Paragraph("<b>Faturado a:</b>", bold_style),
                Paragraph("<b>Condições de Pagamento:</b>", bold_style),
            ],
            [
                Paragraph(f"<b>Nome:</b> {customer_data.get('name', 'Cliente Geral')}<br/>"
                          f"<b>NUIT:</b> {customer_data.get('nuit', 'N/D')}<br/>"
                          f"<b>Telefone:</b> {customer_data.get('phone', 'N/D')}", subtitle_style),
                Paragraph(f"<b>Método:</b> {sale_data.get('payment_method', 'Pronto Pagamento')}<br/>"
                          f"<b>Estado:</b> {sale_data.get('payment_status', 'Liquidado')}", subtitle_style),
            ]
        ]
        t_cust = Table(cust_table_data, colWidths=[10 * cm, 8 * cm])
        t_cust.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F3F4F6")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t_cust)
        story.append(Spacer(1, 0.6 * cm))

        # 3. Tabela de Linhas de Artigos
        items_table_data = [["Artigo / Descrição", "Qtd", "Preço Unit. (MZN)", "Taxa IVA", "Total (MZN)"]]
        for it in items:
            items_table_data.append([
                it.get("name", "Produto"),
                str(it.get("quantity", 1)),
                f"{float(it.get('unit_price', 0)):,.2f}",
                f"{it.get('tax_rate', 16)}%",
                f"{float(it.get('total', 0)):,.2f}",
            ])

        t_items = Table(items_table_data, colWidths=[8 * cm, 2 * cm, 3 * cm, 2 * cm, 3 * cm])
        t_items.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#065F46")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(t_items)
        story.append(Spacer(1, 0.4 * cm))

        # 4. Totais
        totais_data = [
            ["Subtotal (Inc. IVA):", f"{float(sale_data.get('total_amount', 0)):,.2f} MZN"],
            ["IVA Liquidado (16%):", f"{float(sale_data.get('tax_amount', 0)):,.2f} MZN"],
            ["Desconto Comercial:", f"{float(sale_data.get('discount_amount', 0)):,.2f} MZN"],
            ["TOTAL A PAGAR:", f"{float(sale_data.get('total_amount', 0)):,.2f} MZN"],
        ]
        t_totais = Table(totais_data, colWidths=[13 * cm, 5 * cm])
        t_totais.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("TEXTCOLOR", (0, -1), (-1, -1), colors.HexColor("#065F46")),
            ("FONTSIZE", (0, -1), (-1, -1), 11),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(t_totais)
        story.append(Spacer(1, 0.8 * cm))

        # 5. Rodapé
        story.append(Paragraph("<i>Documento processado por computador via TiConta v2 ERP • Válido para efeitos fiscais em Moçambique</i>", subtitle_style))

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_receipt_pdf(company_data: Dict[str, Any], sale_data: Dict[str, Any], items: List[Dict[str, Any]]) -> bytes:
        """Gera Recibo compacto em formato térmico/simplificado."""
        return PDFGenerator.generate_invoice_pdf(
            company_data=company_data,
            customer_data={"name": "Consumidor Final", "nuit": "N/D", "phone": "N/D"},
            sale_data=sale_data,
            items=items,
        )

    @staticmethod
    def generate_quote_pdf(company_data: Dict[str, Any], customer_data: Dict[str, Any], quote_data: Dict[str, Any], items: List[Dict[str, Any]]) -> bytes:
        """Gera Proposta / Orçamento Comercial."""
        quote_data["invoice_number"] = f"ORÇAMENTO Nº {quote_data.get('quote_number', 'ORC-2026/01')}"
        return PDFGenerator.generate_invoice_pdf(
            company_data=company_data,
            customer_data=customer_data,
            sale_data=quote_data,
            items=items,
        )

    @staticmethod
    def generate_purchase_order_pdf(company_data: Dict[str, Any], supplier_data: Dict[str, Any], order_data: Dict[str, Any], items: List[Dict[str, Any]]) -> bytes:
        """Gera Ordem de Compra para Fornecedor."""
        order_data["invoice_number"] = f"ORDEM DE COMPRA Nº {order_data.get('order_number', 'PO-2026/01')}"
        return PDFGenerator.generate_invoice_pdf(
            company_data=company_data,
            customer_data=supplier_data,
            sale_data=order_data,
            items=items,
        )
