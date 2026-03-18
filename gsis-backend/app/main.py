"""
GSIS Backend v5.1 — Modular Production Entry Point with Auto-Monitoring

Run with:
    cd gsis-backend
    uvicorn app.main:app --reload
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.routers import predict, batch, dashboard, history, alerts, admin, regions

# Scheduler
try:
    from apscheduler.schedulers.background import BackgroundScheduler
    HAS_SCHEDULER = True
except ImportError:
    HAS_SCHEDULER = False

logger = logging.getLogger("gsis")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")

# ---------------------------------------------------------------------------
# Lifespan — start/stop scheduler
# ---------------------------------------------------------------------------

scheduler = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global scheduler
    # Startup
    if HAS_SCHEDULER:
        from app.services.region_monitor_service import run_full_monitoring_cycle
        scheduler = BackgroundScheduler()
        scheduler.add_job(
            run_full_monitoring_cycle,
            "interval",
            hours=24,
            id="region_monitor",
            name="Global Region Monitoring (24h)",
        )
        scheduler.start()
        logger.info("🛰 Scheduler started — monitoring every 24 hours")

        # Run initial cycle on startup
        run_full_monitoring_cycle()
    else:
        logger.warning("⚠ apscheduler not installed — auto-monitoring disabled")
        # Still run initial data load
        from app.services.region_monitor_service import run_full_monitoring_cycle
        run_full_monitoring_cycle()

    yield

    # Shutdown
    if scheduler:
        scheduler.shutdown()
        logger.info("Scheduler stopped")


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

settings = get_settings()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Multi-Source Satellite Intelligence Platform",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — dynamically add production frontend URL
origins = list(settings.CORS_ORIGINS)
if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Router registration
# ---------------------------------------------------------------------------

app.include_router(predict.router, prefix="/predict")
app.include_router(batch.router, prefix="/batch-predict")
app.include_router(dashboard.router, prefix="")
app.include_router(history.router, prefix="/history")
app.include_router(alerts.router, prefix="/alerts")
app.include_router(admin.router, prefix="/admin")
app.include_router(regions.router, prefix="/regions")


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
async def root():
    from app.utils.raster_utils import is_rasterio_available
    return {
        "service": settings.APP_NAME,
        "status": "running",
        "version": settings.APP_VERSION,
        "rasterio": is_rasterio_available(),
        "scheduler": HAS_SCHEDULER,
        "architecture": "modular",
    }
