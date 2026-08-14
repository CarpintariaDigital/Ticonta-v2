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


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> Response:
    logger.warn("validation_error", errors=exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": exc.errors()}
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
