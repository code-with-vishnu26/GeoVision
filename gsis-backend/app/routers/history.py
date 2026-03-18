"""
History Router — Upload analysis history.
"""

from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["History"])


@router.get("/")
@limiter.limit("60/minute")
async def get_history(request: Request):
    """Return recent analysis history."""
    return {
        "history": [
            {"date": "2026-02-24", "class": "Dense Forest", "confidence": 0.92, "ndvi": 0.72, "ndwi": 0.08, "flood_risk": "None"},
            {"date": "2026-02-23", "class": "Urban Area", "confidence": 0.82, "ndvi": 0.08, "ndwi": -0.12, "flood_risk": "None"},
            {"date": "2026-02-22", "class": "Vegetation / Crops", "confidence": 0.76, "ndvi": 0.35, "ndwi": 0.15, "flood_risk": "Moderate"},
            {"date": "2026-02-21", "class": "Water / Non-Vegetation", "confidence": 0.91, "ndvi": -0.22, "ndwi": 0.55, "flood_risk": "Critical"},
            {"date": "2026-02-20", "class": "Bare Soil", "confidence": 0.68, "ndvi": 0.08, "ndwi": -0.05, "flood_risk": "None"},
        ]
    }
