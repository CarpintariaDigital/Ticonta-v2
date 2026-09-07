import csv
import io
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import structlog

from app.models.sale import Sale, SaleItem, Payment
from app.models.entities import Customer, Product
from app.models.account import Account, JournalEntry
from app.models.lead import Lead, LeadStage, Interaction
from app.models.project import Project, ProjectExpense, ProjectStatus
from app.models.employee import Employee, Payroll, Attendance
from app.models.report import SavedReport, ReportType
from app.schemas.report import (
    CRMReportData,
    FinancialReportData,
    HRReportData,
    ProjectsReportData,
    SalesReportData,
    CustomReportConfig,
)

logger = structlog.get_logger()

# In-memory simple cache: { cache_key: { "expires_at": timestamp, "data": Any } }
REPORT_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 3600  # 1 hora


def get_cached_report(key: str) -> Optional[Any]:
    entry = REPORT_CACHE.get(key)
    if entry and datetime.now() < entry["expires_at"]:
        return entry["data"]
    return None


def set_cached_report(key: str, data: Any):
    REPORT_CACHE[key] = {
        "expires_at": datetime.now() + timedelta(seconds=CACHE_TTL_SECONDS),
        "data": data,
    }


class ReportsService:
    def __init__(self, db: Session):
        self.db = db

    def generate_sales_report(
        self,
        company_id: int = 1,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        customer_id: Optional[int] = None,
        product_id: Optional[int] = None,
    ) -> SalesReportData:
        cache_key = f"sales_{company_id}_{date_from}_{date_to}_{customer_id}_{product_id}"
        cached = get_cached_report(cache_key)
        if cached:
            return SalesReportData(**cached)

        query = self.db.query(Sale).filter(Sale.company_id == company_id)
        if date_from:
            query = query.filter(Sale.sale_date >= datetime.combine(date_from, datetime.min.time()))
        if date_to:
            query = query.filter(Sale.sale_date <= datetime.combine(date_to, datetime.max.time()))
        if customer_id:
            query = query.filter(Sale.customer_id == customer_id)

        sales = query.all()

        total_sales_count = len(sales)
        total_revenue = sum((s.total_amount for s in sales), Decimal("0.00"))
        total_tax_collected = sum((s.tax_amount for s in sales), Decimal("0.00"))
        avg_ticket = (total_revenue / total_sales_count) if total_sales_count > 0 else Decimal("0.00")

        # Payment Methods
        payments_breakdown: Dict[str, Decimal] = {}
        for s in sales:
            for p in s.payments:
                method_name = p.method or "cash"
                payments_breakdown[method_name] = (
                    payments_breakdown.get(method_name, Decimal("0.00")) + p.amount
                )

        # Top Products
        product_sales_map: Dict[int, Dict[str, Any]] = {}
        for s in sales:
            for item in s.items:
                if product_id and item.product_id != product_id:
                    continue
                pid = item.product_id
                if pid not in product_sales_map:
                    product_sales_map[pid] = {
                        "product_id": pid,
                        "name": item.product.name if item.product else f"Produto {pid}",
                        "quantity": 0,
                        "revenue": Decimal("0.00"),
                    }
                item_total = item.quantity * item.unit_price
                product_sales_map[pid]["quantity"] += item.quantity
                product_sales_map[pid]["revenue"] += item_total

        top_products = sorted(
            product_sales_map.values(), key=lambda x: x["revenue"], reverse=True
        )[:10]

        # Top Customers
        customer_sales_map: Dict[int, Dict[str, Any]] = {}
        for s in sales:
            cid = s.customer_id or 0
            cname = s.customer.name if s.customer else "Cliente a Dinheiro / Balcão"
            if cid not in customer_sales_map:
                customer_sales_map[cid] = {
                    "customer_id": cid,
                    "name": cname,
                    "sales_count": 0,
                    "revenue": Decimal("0.00"),
                }
            customer_sales_map[cid]["sales_count"] += 1
            customer_sales_map[cid]["revenue"] += s.total_amount

        top_customers = sorted(
            customer_sales_map.values(), key=lambda x: x["revenue"], reverse=True
        )[:10]

        # Daily Timeline
        timeline_map: Dict[str, Dict[str, Any]] = {}
        for s in sales:
            day_str = s.sale_date.strftime("%Y-%m-%d")
            if day_str not in timeline_map:
                timeline_map[day_str] = {"date": day_str, "revenue": Decimal("0.00"), "count": 0}
            timeline_map[day_str]["revenue"] += s.total_amount
            timeline_map[day_str]["count"] += 1

        daily_timeline = sorted(timeline_map.values(), key=lambda x: x["date"])

        period_str = f"{date_from or 'Início'} a {date_to or 'Hoje'}"
        report = SalesReportData(
            period=period_str,
            total_sales_count=total_sales_count,
            total_revenue=total_revenue,
            total_tax_collected=total_tax_collected,
            average_ticket=round(avg_ticket, 2),
            payment_methods_breakdown=payments_breakdown,
            top_products=top_products,
            top_customers=top_customers,
            daily_timeline=daily_timeline,
        )

        set_cached_report(cache_key, report.model_dump())
        return report

    def generate_financial_report(self, company_id: int = 1, period: str = "2026-08") -> FinancialReportData:
        # Calcular Receitas (Vendas) e Despesas (Projetos + Folha)
        sales_sum = (
            self.db.query(func.sum(Sale.total_amount))
            .filter(Sale.company_id == company_id)
            .scalar()
            or Decimal("0.00")
        )

        project_expenses = (
            self.db.query(func.sum(ProjectExpense.amount))
            .join(Project)
            .filter(Project.company_id == company_id)
            .scalar()
            or Decimal("0.00")
        )

        payroll_expenses = (
            self.db.query(func.sum(Payroll.gross_salary))
            .filter(Payroll.company_id == company_id)
            .scalar()
            or Decimal("0.00")
        )

        total_expenses = project_expenses + payroll_expenses
        net_cash_flow = sales_sum - total_expenses

        # Balanço de Caixa & Bancos
        cash_accounts = (
            self.db.query(Account)
            .filter(Account.company_id == company_id, Account.account_code.like("1.%"))
            .all()
        )
        cash_total = sum((a.current_balance for a in cash_accounts), Decimal("0.00"))

        receivables = Decimal("0.00")
        margin = float((net_cash_flow / sales_sum) * Decimal("100.0")) if sales_sum > 0 else 0.0

        return FinancialReportData(
            period=period,
            total_income=sales_sum,
            total_expenses=total_expenses,
            net_cash_flow=net_cash_flow,
            total_receivables=receivables,
            cash_in_hand=cash_total,
            bank_balances=cash_total,
            profit_margin_percentage=round(margin, 2),
        )

    def generate_crm_report(self, company_id: int = 1, period: str = "2026-08") -> CRMReportData:
        leads = self.db.query(Lead).filter(Lead.company_id == company_id).all()
        total_leads = len(leads)
        pipeline_total = sum((l.value for l in leads), Decimal("0.00"))
        weighted = sum((l.value * (l.probability / Decimal("100.00")) for l in leads), Decimal("0.00"))

        stages: Dict[str, int] = {}
        sources: Dict[str, int] = {}
        won_count = 0

        for l in leads:
            stages[l.stage.value] = stages.get(l.stage.value, 0) + 1
            sources[l.source or "outro"] = sources.get(l.source or "outro", 0) + 1
            if l.stage == LeadStage.GANHO:
                won_count += 1

        win_rate = (won_count / total_leads * 100.0) if total_leads > 0 else 0.0

        return CRMReportData(
            period=period,
            total_leads=total_leads,
            pipeline_total_value=pipeline_total,
            weighted_pipeline_value=round(weighted, 2),
            win_rate_percentage=round(win_rate, 1),
            leads_by_stage=stages,
            leads_by_source=sources,
            average_days_in_stage=14.5,
        )

    def generate_project_report(self, company_id: int = 1, period: str = "2026-08") -> ProjectsReportData:
        projects = self.db.query(Project).filter(Project.company_id == company_id).all()
        total_proj = len(projects)
        active_proj = sum(1 for p in projects if p.status == ProjectStatus.ACTIVE)
        completed_proj = sum(1 for p in projects if p.status == ProjectStatus.COMPLETED)

        total_budget = sum((p.budget for p in projects), Decimal("0.00"))
        total_actual = sum((p.total_expenses for p in projects), Decimal("0.00"))
        profit = total_budget - total_actual

        avg_progress = (
            sum(p.progress_percentage for p in projects) / total_proj if total_proj > 0 else 0.0
        )

        categories: Dict[str, Decimal] = {}
        for p in projects:
            for e in p.expenses:
                categories[e.category] = categories.get(e.category, Decimal("0.00")) + e.amount

        return ProjectsReportData(
            period=period,
            total_projects=total_proj,
            active_projects=active_proj,
            completed_projects=completed_proj,
            total_budget_contracted=total_budget,
            total_actual_expenses=total_actual,
            overall_profit=profit,
            average_progress_percentage=round(avg_progress, 1),
            expenses_by_category=categories,
        )

    def generate_hr_report(self, company_id: int = 1, period: str = "2026-08") -> HRReportData:
        employees = self.db.query(Employee).filter(Employee.company_id == company_id).all()
        total_emp = len(employees)

        payrolls = (
            self.db.query(Payroll)
            .filter(Payroll.company_id == company_id, Payroll.period == period)
            .all()
        )

        total_gross = sum((p.gross_salary for p in payrolls), Decimal("0.00"))
        total_inss_emp = sum((p.inss_employee for p in payrolls), Decimal("0.00"))
        total_inss_pat = sum((p.inss_employer for p in payrolls), Decimal("0.00"))
        total_irps = sum((p.irps for p in payrolls), Decimal("0.00"))
        total_net = sum((p.net_salary for p in payrolls), Decimal("0.00"))

        avg_salary = (total_gross / total_emp) if total_emp > 0 else Decimal("0.00")

        # Attendance Rate
        attendances = self.db.query(Attendance).join(Employee).filter(Employee.company_id == company_id).all()
        presences = sum(1 for a in attendances if a.status.value == "present")
        att_rate = (presences / len(attendances) * 100.0) if attendances else 98.0

        return HRReportData(
            period=period,
            total_employees=total_emp,
            total_gross_payroll=total_gross,
            total_inss_employee=total_inss_emp,
            total_inss_employer=total_inss_pat,
            total_inss_guia=total_inss_emp + total_inss_pat,
            total_irps_retained=total_irps,
            total_net_disbursed=total_net,
            average_salary=round(avg_salary, 2),
            attendance_rate_percentage=round(att_rate, 1),
        )

    def export_report_to_csv(self, report_type: ReportType, data: Dict[str, Any]) -> str:
        """Gera string CSV formatada."""
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["TiConta ERP Moçambique - Relatório Executivo"])
        writer.writerow(["Tipo:", report_type.value.upper()])
        writer.writerow(["Gerado em:", datetime.now().strftime("%d/%m/%Y %H:%M:%S")])
        writer.writerow([])

        # Header and rows
        for k, v in data.items():
            if isinstance(v, list):
                writer.writerow([k.upper()])
                if v and isinstance(v[0], dict):
                    keys = list(v[0].keys())
                    writer.writerow(keys)
                    for item in v:
                        writer.writerow([item.get(key, "") for key in keys])
                writer.writerow([])
            elif isinstance(v, dict):
                writer.writerow([k.upper()])
                for sub_k, sub_v in v.items():
                    writer.writerow([sub_k, str(sub_v)])
                writer.writerow([])
            else:
                writer.writerow([k, str(v)])

        return output.getvalue()
