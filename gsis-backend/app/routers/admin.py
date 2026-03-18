"""
Admin Router — Admin-only endpoints.
"""

import time
from datetime import datetime

from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.security import require_role, CurrentUser
from app.core.config import get_settings
from app.utils.raster_utils import is_rasterio_available

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Admin"])

START_TIME = time.time()


@router.get("/users")
@limiter.limit("30/minute")
async def list_users(request: Request, user: CurrentUser = Depends(require_role("admin"))):
    """List all users (placeholder — connect to Supabase auth in production)."""
    return {
        "users": [
            {"id": "demo-1", "email": "admin@geovision.ai", "role": "admin", "uploads": 42},
            {"id": "demo-2", "email": "analyst@geovision.ai", "role": "analyst", "uploads": 18},
            {"id": "demo-3", "email": "viewer@geovision.ai", "role": "viewer", "uploads": 0},
        ]
    }


@router.get("/system-health")
@limiter.limit("60/minute")
async def system_health(request: Request):
    """System health check — uptime, resources, capabilities."""
    settings = get_settings()
    uptime = round(time.time() - START_TIME, 1)

    health: dict = {
        "status": "healthy",
        "uptime_seconds": uptime,
        "uptime_human": f"{int(uptime // 3600)}h {int((uptime % 3600) // 60)}m {int(uptime % 60)}s",
        "model_version": settings.APP_VERSION,
        "rasterio_available": is_rasterio_available(),
        "python_version": __import__("sys").version,
        "timestamp": datetime.utcnow().isoformat(),
    }

    if HAS_PSUTIL:
        health["cpu_percent"] = psutil.cpu_percent(interval=0.1)
        health["memory_percent"] = psutil.virtual_memory().percent
        health["disk_percent"] = psutil.disk_usage("/").percent

    return health
