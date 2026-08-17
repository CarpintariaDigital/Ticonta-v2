from app.routes.auth import router as auth_router
from app.routes.sales import router as sales_router
from app.routes.accounting import router as accounting_router
from app.routes.sync import router as sync_router
from app.routes.crm import router as crm_router
from app.routes.projects import router as projects_router
from app.routes.hr import router as hr_router
from app.routes.reports import router as reports_router
from app.routes.manufacturing import router as manufacturing_router

__all__ = [
    "auth_router",
    "sales_router",
    "accounting_router",
    "sync_router",
    "crm_router",
    "projects_router",
    "hr_router",
    "reports_router",
    "manufacturing_router",
]
