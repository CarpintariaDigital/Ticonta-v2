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
        client_ip = request.client.host if request.client else "unknown"
        if client_ip in ("testclient", "127.0.0.1", "localhost") or settings.DEBUG:
            return await call_next(request)
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


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for TiConta v2 ERP with Clean Architecture",
    version="2.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "prod" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "prod" else None,
)

# Apply Middlewares
app.add_middleware(StructuredLoggingMiddleware)
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


from fastapi.encoders import jsonable_encoder


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> Response:
    serialized_errors = jsonable_encoder(exc.errors())
    logger.warn("validation_error", errors=serialized_errors)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": serialized_errors}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> Response:
    logger.exception("unhandled_exception", error=str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please contact administrator."}
    )


# Routers
from app.routes.auth import router as auth_router
from app.routes.sales import router as sales_router
from app.routes.accounting import router as accounting_router
from app.routes.sync import router as sync_router
from app.routes.crm import router as crm_router
from app.routes.projects import router as projects_router
from app.routes.hr import router as hr_router
from app.routes.reports import router as reports_router
from app.routes.manufacturing import router as manufacturing_router
from app.routes.licensing import router as licensing_router
from app.routes.admin.licensing import router as admin_licensing_router
from app.routes.document_delivery import router as document_delivery_router
from app.routes.barcode import router as barcode_router
from app.routes.premium import router as premium_router
from app.routes.products import router as products_router
from app.routes.restaurant import router as restaurant_router
from app.routes.informal_sales import router as informal_sales_router
from app.routes.takeaway import router as takeaway_router
from app.routes.payment import router as payment_router
from app.routes.poultry import router as poultry_router
from app.routes.pricing import router as pricing_router

app.include_router(auth_router)
app.include_router(sales_router)
app.include_router(accounting_router)
app.include_router(sync_router)
app.include_router(crm_router)
app.include_router(projects_router)
app.include_router(hr_router)
app.include_router(reports_router)
app.include_router(manufacturing_router)
app.include_router(licensing_router)
app.include_router(admin_licensing_router)
app.include_router(document_delivery_router)
app.include_router(barcode_router)
app.include_router(premium_router)
app.include_router(products_router)
app.include_router(restaurant_router)
app.include_router(informal_sales_router)
app.include_router(takeaway_router)
app.include_router(payment_router)
app.include_router(poultry_router)
app.include_router(pricing_router)


# Startup Event to initialize database tables
@app.on_event("startup")
def on_startup():
    try:
        from app.core.database import Base, engine
        import app.models  # ensure all models are registered
        Base.metadata.create_all(bind=engine)
        logger.info("database_tables_initialized")
    except Exception as e:
        logger.warn("database_init_warning", error=str(e))


# Health Check Endpoint
@app.get("/health", status_code=status.HTTP_200_OK, tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "timestamp": time.time()
    }
