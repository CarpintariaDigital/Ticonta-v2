import os
import time
from collections import defaultdict
from typing import Dict, List
import structlog
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

sentry_dsn = os.getenv("SENTRY_DSN")
if sentry_dsn and os.getenv("TESTING") != "true":
    sentry_sdk.init(
        dsn=sentry_dsn,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
        traces_sample_rate=0.2,
        environment=os.getenv("ENVIRONMENT", "production"),
    )

# Configure Structlog
structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)
logger = structlog.get_logger()

# Simple In-Memory Rate Limiter
class InMemoryRateLimiter(BaseHTTPMiddleware):
    def __init__(self, app, requests_limit: int = 100, time_window_seconds: int = 60):
        super().__init__(app)
        self.limit = requests_limit
        self.window = time_window_seconds
        self.clients: Dict[str, List[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next) -> Response:
        if os.getenv("TESTING") == "true":
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Filter request timestamps within current sliding window
        self.clients[client_ip] = [
            t for t in self.clients[client_ip] if now - t < self.window
        ]
        
        if len(self.clients[client_ip]) >= self.limit:
            logger.warn("rate_limit_exceeded", client_ip=client_ip, path=request.url.path)
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded. Please try again later."}
            )
            
        self.clients[client_ip].append(now)
        return await call_next(request)


# Structured Request Logging Middleware
class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        try:
            response = await call_next(request)
            duration = time.time() - start_time
            logger.info(
                "http_request",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_seconds=round(duration, 4)
            )
            return response
        except Exception as e:
            duration = time.time() - start_time
            logger.exception(
                "http_request_failed",
                method=request.method,
                path=request.url.path,
                duration_seconds=round(duration, 4),
                error=str(e)
            )
            raise e


# JSON Response Helper for exceptions
def JSONResponse(status_code: int, content: dict) -> Response:
    from fastapi.responses import JSONResponse as FastJSONResponse
    return FastJSONResponse(status_code=status_code, content=content)


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for TiConta v2 ERP with Clean Architecture",
    version="2.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "prod" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "prod" else None,
)

# Apply Middlewares
from app.middleware.tenant import TenantMiddleware
app.add_middleware(TenantMiddleware)
app.add_middleware(StructuredLoggingMiddleware)

if os.getenv("TESTING") != "true":
    app.add_middleware(
        InMemoryRateLimiter,
        requests_limit=100,
        time_window_seconds=60
    )
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS] or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Restrict allowed hosts in production
if settings.ENVIRONMENT == "prod":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["ticonta.carpintaria.digital", "*.carpintaria.digital", "localhost", "127.0.0.1"]
    )


# Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> Response:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> Response:
    from fastapi.encoders import jsonable_encoder
    encoded_errors = jsonable_encoder(exc.errors())
    logger.warn("validation_error", errors=encoded_errors)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": encoded_errors}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> Response:
    logger.exception("unhandled_exception", error=str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please contact administrator."}
    )


# Health Check Endpoint
@app.get("/health", status_code=status.HTTP_200_OK, tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "timestamp": time.time()
    }

# Include Application Routers
from app.routes import (
    auth_router,
    sales_router,
    accounting_router,
    sync_router,
    crm_router,
    projects_router,
    hr_router,
    reports_router,
    manufacturing_router,
    invoice_ocr_router,
)

app.include_router(auth_router)
app.include_router(sales_router)
app.include_router(accounting_router)
app.include_router(sync_router)
app.include_router(crm_router)
app.include_router(projects_router)
app.include_router(hr_router)
app.include_router(reports_router)
app.include_router(manufacturing_router)
app.include_router(invoice_ocr_router)

from app.routes import (
    poultry,
    payment,
    license_server,
    pricing,
    informal_sales,
    restaurant,
    takeaway,
    barcode,
    document_delivery,
    premium,
    products,
    auto_services,
    licensing,
    xitique,
    savings,
)
from app.routes.admin import licensing as admin_licensing

app.include_router(poultry.router,           prefix="/api/v1/poultry",         tags=["Poultry"])
app.include_router(payment.router,           prefix="/api/v1/payment",          tags=["Payment"])
app.include_router(payment.router,           prefix="/api/v1/payments",         tags=["Payment"])
app.include_router(license_server.router,    prefix="/api/v1/license-server",   tags=["Licenses Server"])
app.include_router(admin_licensing.router)
app.include_router(pricing.router,           prefix="/api/v1/pricing",          tags=["Pricing"])
app.include_router(pricing.router)
app.include_router(informal_sales.router)
app.include_router(restaurant.router)
app.include_router(takeaway.router)
app.include_router(barcode.router)
app.include_router(document_delivery.router)
app.include_router(premium.router)
app.include_router(products.router)
app.include_router(auto_services.router)
app.include_router(licensing.router)
app.include_router(xitique.router,           prefix="/api/v1/xitique",         tags=["Xitique"])
app.include_router(savings.router,           prefix="/api/v1/savings",         tags=["Savings"])
