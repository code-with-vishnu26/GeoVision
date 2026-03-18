"""
Dashboard Router — Aggregated stats + region monitoring data.
"""

from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.services.alert_service import get_all_alerts, get_aggregate_stats
from app.services.region_monitor_service import get_all_region_data

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Dashboard"])


@router.get("/stats")
@limiter.limit("60/minute")
async def get_stats(request: Request):
    """Return aggregated dashboard stats including region monitoring data."""
    agg = get_aggregate_stats()
    active_alerts = sum(1 for a in get_all_alerts() if not a["resolved"])
    regions = get_all_region_data()

    # Compute averages from region data if available
    if regions:
        region_ndvi_avg = round(sum(r.get("average_ndvi", 0) for r in regions) / len(regions), 4)
        region_ndwi_avg = round(sum(r.get("average_ndwi", 0) for r in regions) / len(regions), 4)
        critical_count = sum(1 for r in regions if r.get("risk_level") in ("High", "Critical"))
    else:
        region_ndvi_avg = agg["avg_ndvi"]
        region_ndwi_avg = agg["avg_ndwi"]
        critical_count = 0

    return {
        "sustainability_score": 72,
        "active_alerts": active_alerts,
        "monitored_regions": len(regions),
        "data_points_billions": 2.4,
        "modules": {
            "deforestation": {"risk": 78, "trend": 8.2},
            "water": {"risk": 72, "trend": 4.1},
            "crop": {"risk": 65, "trend": 6.7},
            "flood": {"risk": 58, "trend": 22.5},
            "heat": {"risk": 82, "trend": 12.3},
            "pollution": {"risk": 74, "trend": 6.8},
        },
        "indices": {
            "avg_ndvi": region_ndvi_avg,
            "avg_ndwi": region_ndwi_avg,
            "flood_risk_count": agg["flood_risk_count"],
            "vegetation_stress_count": critical_count,
        },
    }


@router.get("/dashboard/regions")
@limiter.limit("60/minute")
async def dashboard_regions(request: Request):
    """Return regional monitoring summary for the dashboard."""
    regions = get_all_region_data()
    return {
        "regions": [
            {
                "name": r["name"],
                "average_ndvi": r.get("average_ndvi"),
                "average_ndwi": r.get("average_ndwi"),
                "risk_level": r.get("risk_level", "Unknown"),
                "last_processed": r.get("last_processed"),
                "latitude": r.get("latitude"),
                "longitude": r.get("longitude"),
            }
            for r in regions
        ],
        "total": len(regions),
    }
