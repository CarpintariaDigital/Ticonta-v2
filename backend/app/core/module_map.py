from typing import Dict, List, Optional

MODULE_ROUTES: Dict[str, List[str]] = {
    "pos": [
        "/api/v1/sales",
        "/api/sales",
        "/api/v1/products",
        "/api/products",
        "/api/v1/payments",
        "/api/payments",
        "/api/v1/barcode",
        "/api/barcode",
    ],
    "informal": [
        "/api/v1/informal-sales",
        "/api/informal-sales",
    ],
    "restaurant": [
        "/api/v1/restaurant",
        "/api/restaurant",
        "/api/v1/takeaway",
        "/api/takeaway",
    ],
    "hr": [
        "/api/v1/hr",
        "/api/hr",
    ],
    "crm": [
        "/api/v1/crm",
        "/api/crm",
        "/api/v1/leads",
        "/api/leads",
    ],
    "accounting": [
        "/api/v1/accounting",
        "/api/accounting",
        "/api/v1/reports",
        "/api/reports",
    ],
    "poultry": [
        "/api/v1/poultry",
        "/api/poultry",
    ],
    "projects": [
        "/api/v1/projects",
        "/api/projects",
    ],
    "auto_services": [
        "/api/v1/auto-services",
        "/api/auto-services",
    ],
}

PLAN_MODULES: Dict[str, List[str]] = {
    "base": ["pos", "informal"],
    "pro": ["pos", "informal", "restaurant", "hr", "accounting"],
    "enterprise": [
        "pos",
        "informal",
        "restaurant",
        "hr",
        "accounting",
        "crm",
        "poultry",
        "projects",
        "auto_services",
    ],
}


def get_module_for_path(path: str) -> Optional[str]:
    """
    Identifica o módulo funcional correspondente ao caminho da requisição HTTP.
    """
    clean_path = path.rstrip("/")
    for module_name, routes in MODULE_ROUTES.items():
        for route in routes:
            clean_route = route.rstrip("/")
            if clean_path == clean_route or clean_path.startswith(clean_route + "/"):
                return module_name
    return None


def get_modules_for_plan(plan: str) -> List[str]:
    """
    Retorna os módulos licenciados associados a um plano ('base', 'pro', 'enterprise').
    """
    plan_key = (plan or "base").lower().strip()
    return PLAN_MODULES.get(plan_key, PLAN_MODULES["base"])
