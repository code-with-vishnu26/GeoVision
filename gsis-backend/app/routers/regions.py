"""
Regions Router — Regional monitoring endpoints.
"""

from fastapi import APIRouter, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.services.region_monitor_service import (
    get_all_region_data, get_region_data,
    run_full_monitoring_cycle, process_region,
)
from app.services.sentinel_fetch_service import sentinel_service
from app.core.security import require_role, CurrentUser
from fastapi import Depends

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Regions"])


@router.get("/")
@limiter.limit("60/minute")
async def list_regions(request: Request):
    """Return current monitoring data for all regions."""
    regions = get_all_region_data()
    return {"regions": regions, "total": len(regions)}


@router.get("/{region_name}")
@limiter.limit("60/minute")
async def get_region(request: Request, region_name: str):
    """Return data for a specific region."""
    data = get_region_data(region_name)
    if not data:
        raise HTTPException(status_code=404, detail=f"Region '{region_name}' not found")
    return data


@router.post("/trigger-cycle")
@limiter.limit("5/minute")
async def trigger_monitoring(request: Request, user: CurrentUser = Depends(require_role("admin"))):
    """Manually trigger a full monitoring cycle (admin only)."""
    results = run_full_monitoring_cycle()
    return {
        "message": "Monitoring cycle complete",
        "mode": "real" if sentinel_service.is_real_mode() else "simulated",
        "regions_processed": len(results),
        "results": results,
    }


@router.post("/monitor/{region_name}")
@limiter.limit("10/minute")
async def monitor_single_region(request: Request, region_name: str):
    """Manually process a single region (for testing)."""
    all_regions = sentinel_service.get_monitored_regions()
    target = next((r for r in all_regions if r.name.lower() == region_name.lower()), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"Region '{region_name}' not found")
    result = process_region(target)
    return result


@router.get("/status")
@limiter.limit("60/minute")
async def monitoring_status(request: Request):
    """Show monitoring engine status."""
    from app.services.sentinel_auth_service import sentinel_auth
    return {
        "mode": "real" if sentinel_service.is_real_mode() else "simulated",
        "credentials_configured": sentinel_auth.is_configured(),
        "monitored_regions": len(sentinel_service.get_monitored_regions()),
        "regions_with_data": len(get_all_region_data()),
    }

