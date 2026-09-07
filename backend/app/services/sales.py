from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
import structlog

from app.audit.service import log_audit
from app.compliance.e_invoice import generate_einvoice_payload
from app.models.entities import Customer, Product
from app.models.sale import Payment, Sale, SaleItem
from app.schemas.sale import SaleCreate
from app.services.accounting import create_sale_journal_entry

logger = structlog.get_logger()


class SalesService:
    def __init__(self, db: Session):
        self.db = db

    def generate_invoice_number(self, company_id: int) -> str:
        """Gera número sequencial de fatura no formato FT YYYY/NNNNN"""
        current_year = datetime.utcnow().year
        prefix = f"FT {current_year}/"

        last_sale = (
            self.db.query(Sale)
            .filter(
                Sale.company_id == company_id,
                Sale.invoice_number.like(f"{prefix}%"),
            )
            .order_by(Sale.id.desc())
            .first()
        )

        if last_sale and last_sale.invoice_number.startswith(prefix):
            try:
                last_seq = int(last_sale.invoice_number.split("/")[-1])
                new_seq = last_seq + 1
            except ValueError:
                new_seq = 1
        else:
            new_seq = 1

        return f"{prefix}{new_seq:05d}"

    def create_sale(
        self,
        sale_data: SaleCreate,
        user_id: int,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Sale:
        """
        Criação completa de venda com:
        - Validação de produtos e stock suficiente
        - Cálculo de valores (subtotal, IVA, descontos, total líquido)
        - Criação de fatura e itens
        - Baixa no stock
        - Atualização do saldo do cliente (se venda a crédito ou cliente vinculado)
        - Registo de pagamentos
        - Integração com Contabilidade (Journal Entry)
        - Compliance Fiscal (NFe payload)
        - Registo de Auditoria
        """
        company_id = sale_data.company_id

        # 1. Validar itens e stock
        if not sale_data.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A venda deve conter pelo menos 1 item.",
            )

        # Buscar produtos do banco
        product_ids = [item.product_id for item in sale_data.items]
        products = (
            self.db.query(Product)
            .filter(Product.id.in_(product_ids), Product.company_id == company_id)
            .all()
        )
        products_map = {p.id: p for p in products}

        for item in sale_data.items:
            product = products_map.get(item.product_id)
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Produto com ID {item.product_id} não encontrado na empresa.",
                )
            if not product.active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Produto '{product.name}' está inativo para venda.",
                )
            if product.quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuficiente para '{product.name}'. Disponível: {product.quantity}, Solicitado: {item.quantity}",
                )

        # 2. Calcular Totais
        total_gross = Decimal("0.00")
        total_tax = Decimal("0.00")
        processed_items: List[Dict[str, Any]] = []

        for item in sale_data.items:
            prod = products_map[item.product_id]
            unit_price = item.unit_price if item.unit_price is not None else prod.unit_price
            tax_rate = item.tax_rate if item.tax_rate is not None else (prod.iva_rate or Decimal("16.00"))

            line_gross = Decimal(str(unit_price)) * Decimal(str(item.quantity))
            line_tax = (line_gross * (Decimal(str(tax_rate)) / Decimal("100.00"))).quantize(Decimal("0.01"))

            total_gross += line_gross
            total_tax += line_tax

            processed_items.append({
                "product": prod,
                "quantity": item.quantity,
                "unit_price": unit_price,
                "tax_rate": tax_rate,
            })

        discount_amount = Decimal(str(sale_data.discount or "0.00"))
        if discount_amount > total_gross + total_tax:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O desconto não pode ser superior ao valor total da venda.",
            )

        net_amount = (total_gross + total_tax) - discount_amount
        if net_amount < Decimal("0.00"):
            net_amount = Decimal("0.00")

        # 3. Gerar número de fatura
        invoice_number = self.generate_invoice_number(company_id)

        # 4. Criar Registro de Venda
        sale = Sale(
            company_id=company_id,
            customer_id=sale_data.customer_id,
            user_id=user_id,
            invoice_number=invoice_number,
            total_amount=total_gross,
            tax_amount=total_tax,
            discount_amount=discount_amount,
            net_amount=net_amount,
            payment_method=sale_data.payment_method,
            payment_status=sale_data.payment_status,
            sale_date=datetime.utcnow(),
        )
        self.db.add(sale)
        self.db.flush()

        # 5. Criar Itens e Baixar Estoque
        for p_item in processed_items:
            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=p_item["product"].id,
                quantity=p_item["quantity"],
                unit_price=p_item["unit_price"],
                tax_rate=p_item["tax_rate"],
            )
            self.db.add(sale_item)

            # Redução de stock
            p_item["product"].quantity = p_item["product"].quantity - p_item["quantity"]

        # 6. Atualizar Histórico do Cliente (se associado)
        if sale_data.customer_id:
            customer = self.db.query(Customer).filter(Customer.id == sale_data.customer_id).first()
            if customer:
                customer.total_spent = (customer.total_spent or Decimal("0.00")) + net_amount
                if sale_data.payment_method.lower() in ["credit", "crédito", "a prazo"]:
                    customer.debt_amount = (customer.debt_amount or Decimal("0.00")) + net_amount

        # 7. Criar Pagamento(s)
        if sale_data.payments:
            for p in sale_data.payments:
                payment = Payment(
                    sale_id=sale.id,
                    method=p.method,
                    amount=p.amount,
                    reference=p.reference,
                )
                self.db.add(payment)
        else:
            payment = Payment(
                sale_id=sale.id,
                method=sale_data.payment_method,
                amount=net_amount,
                reference=f"PAY-{invoice_number}",
            )
            self.db.add(payment)

        # 8. Integração Contábil Automática (Journal Entry)
        create_sale_journal_entry(self.db, sale, user_id)

        # 9. Geração de Payload Fiscal NFe
        generate_einvoice_payload(sale)

        # 10. Registo de Auditoria
        log_audit(
            db=self.db,
            company_id=company_id,
            action="CREATE_SALE",
            entity="Sale",
            entity_id=sale.id,
            user_id=user_id,
            new_value={
                "invoice_number": invoice_number,
                "net_amount": float(net_amount),
                "payment_method": sale_data.payment_method,
                "items_count": len(sale_data.items),
            },
            ip_address=client_ip,
            user_agent=user_agent,
        )

        self.db.commit()
        self.db.refresh(sale)
        return sale

    def get_sales(
        self,
        company_id: int = 1,
        skip: int = 0,
        limit: int = 50,
        customer_id: Optional[int] = None,
        payment_method: Optional[str] = None,
        payment_status: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Listagem de vendas com filtros e paginação."""
        query = self.db.query(Sale).filter(Sale.company_id == company_id)

        if customer_id:
            query = query.filter(Sale.customer_id == customer_id)
        if payment_method:
            query = query.filter(Sale.payment_method == payment_method)
        if payment_status:
            query = query.filter(Sale.payment_status == payment_status)
        if start_date:
            query = query.filter(Sale.sale_date >= start_date)
        if end_date:
            query = query.filter(Sale.sale_date <= end_date)

        total = query.count()
        sales = query.order_by(Sale.id.desc()).offset(skip).limit(limit).all()

        return {
            "items": sales,
            "total": total,
            "page": (skip // limit) + 1 if limit > 0 else 1,
            "size": limit,
            "pages": (total + limit - 1) // limit if limit > 0 else 1,
        }

    def get_sale(self, sale_id: int, company_id: int = 1) -> Sale:
        """Busca venda por ID."""
        sale = (
            self.db.query(Sale)
            .filter(Sale.id == sale_id, Sale.company_id == company_id)
            .first()
        )
        if not sale:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Venda {sale_id} não encontrada.",
            )
        return sale

    def update_sale(
        self,
        sale_id: int,
        data: Dict[str, Any],
        user_id: int,
        company_id: int = 1,
    ) -> Sale:
        """Atualização de status ou observações da venda."""
        sale = self.get_sale(sale_id, company_id)
        old_status = sale.payment_status

        if "payment_status" in data:
            sale.payment_status = data["payment_status"]

        log_audit(
            db=self.db,
            company_id=company_id,
            action="UPDATE_SALE",
            entity="Sale",
            entity_id=sale.id,
            user_id=user_id,
            old_value={"payment_status": old_status},
            new_value={"payment_status": sale.payment_status},
        )

        self.db.commit()
        self.db.refresh(sale)
        return sale

    def delete_sale(self, sale_id: int, user_id: int, company_id: int = 1) -> Dict[str, Any]:
        """Cancelamento ou exclusão de venda com retorno de stock."""
        sale = self.get_sale(sale_id, company_id)

        # Devolver stock
        for item in sale.items:
            product = self.db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.quantity += item.quantity

        log_audit(
            db=self.db,
            company_id=company_id,
            action="CANCEL_SALE",
            entity="Sale",
            entity_id=sale.id,
            user_id=user_id,
            old_value={"invoice_number": sale.invoice_number, "net_amount": float(sale.net_amount)},
            new_value={"status": "CANCELLED"},
        )

        self.db.delete(sale)
        self.db.commit()
        return {"message": f"Venda {sale.invoice_number} cancelada com sucesso e stock reposto."}

    def get_sales_by_date(self, target_date: date, company_id: int = 1) -> List[Sale]:
        """Busca todas as vendas em uma data específica."""
        start = datetime.combine(target_date, datetime.min.time())
        end = datetime.combine(target_date, datetime.max.time())
        return (
            self.db.query(Sale)
            .filter(
                Sale.company_id == company_id,
                Sale.sale_date >= start,
                Sale.sale_date <= end,
            )
            .all()
        )

    def get_daily_revenue(self, target_date: Optional[date] = None, company_id: int = 1) -> Dict[str, Any]:
        """Calcula a receita diária agregada e métricas de faturamento."""
        if not target_date:
            target_date = datetime.utcnow().date()

        sales = self.get_sales_by_date(target_date, company_id)

        total_revenue = sum((s.net_amount for s in sales), Decimal("0.00"))
        total_tax = sum((s.tax_amount for s in sales), Decimal("0.00"))
        total_discounts = sum((s.discount_amount for s in sales), Decimal("0.00"))

        breakdown: Dict[str, Decimal] = {}
        for s in sales:
            method = s.payment_method.lower()
            breakdown[method] = breakdown.get(method, Decimal("0.00")) + s.net_amount

        return {
            "date": target_date.isoformat(),
            "total_sales_count": len(sales),
            "total_revenue": total_revenue,
            "total_tax": total_tax,
            "total_discounts": total_discounts,
            "payment_breakdown": breakdown,
        }
