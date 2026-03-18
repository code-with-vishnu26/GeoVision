"""
Database connection — Supabase client for direct DB access.
"""

import logging
from typing import Optional

from app.core.config import get_settings

logger = logging.getLogger("database")

# ---------------------------------------------------------------------------
# Supabase Client
# ---------------------------------------------------------------------------

_supabase_client = None


def get_supabase_client():
    """
    Get or create the Supabase client singleton.
    Returns None if credentials are not configured.
    """
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    settings = get_settings()
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        logger.warning("Supabase credentials not configured — using in-memory storage")
        return None

    try:
        from supabase import create_client
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY,
        )
        logger.info(f"Supabase client initialized: {settings.SUPABASE_URL}")
        return _supabase_client
    except ImportError:
        logger.warning("supabase package not installed — run: pip install supabase")
        return None
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None


# ---------------------------------------------------------------------------
# DB helper functions
# ---------------------------------------------------------------------------

def insert_prediction(user_id: str, data: dict) -> Optional[dict]:
    """Insert a prediction result into the uploads table."""
    sb = get_supabase_client()
    if not sb:
        return None
    try:
        result = sb.table("uploads").insert({
            "user_id": user_id,
            "image_url": data.get("image_url", ""),
            "predicted_class": data.get("predicted_class"),
            "confidence": data.get("confidence"),
            "ndvi_value": data.get("ndvi_mean"),
            "ndwi_value": data.get("ndwi_mean"),
            "flood_risk": data.get("flood_risk"),
            "processing_time": data.get("processing_metadata", {}).get("processing_time_seconds"),
            "model_version": data.get("processing_metadata", {}).get("model_version"),
            "image_size": data.get("processing_metadata", {}).get("image_dimensions"),
            "analysis_model": data.get("analysis_model"),
        }).execute()
        return result.data
    except Exception as e:
        logger.error(f"Failed to insert prediction: {e}")
        return None


def insert_alert(alert_data: dict) -> Optional[dict]:
    """Insert an alert into the alerts table."""
    sb = get_supabase_client()
    if not sb:
        return None
    try:
        result = sb.table("alerts").insert({
            "title": alert_data.get("title"),
            "severity": alert_data.get("severity"),
            "module": alert_data.get("module"),
            "region": alert_data.get("region", ""),
            "resolved": False,
        }).execute()
        return result.data
    except Exception as e:
        logger.error(f"Failed to insert alert: {e}")
        return None


def fetch_regions_from_db() -> list[dict]:
    """Read all regions from the regions table."""
    sb = get_supabase_client()
    if not sb:
        return []
    try:
        result = sb.table("regions").select("*").execute()
        return result.data or []
    except Exception as e:
        logger.error(f"Failed to fetch regions: {e}")
        return []


def update_region_ndvi(region_id: str, ndvi: float, ndwi: float, risk: str) -> Optional[dict]:
    """Update a region's NDVI/NDWI and risk level."""
    sb = get_supabase_client()
    if not sb:
        return None
    try:
        from datetime import datetime
        result = sb.table("regions").update({
            "average_ndvi": ndvi,
            "average_ndwi": ndwi,
            "risk_level": risk,
            "last_processed": datetime.utcnow().isoformat(),
        }).eq("id", region_id).execute()
        return result.data
    except Exception as e:
        logger.error(f"Failed to update region: {e}")
        return None


def fetch_dashboard_aggregates() -> dict:
    """Aggregate dashboard stats from the uploads table."""
    sb = get_supabase_client()
    if not sb:
        return {}
    try:
        uploads = sb.table("uploads").select("ndvi_value, ndwi_value, flood_risk").execute()
        rows = uploads.data or []
        if not rows:
            return {}
        total = len(rows)
        ndvi_sum = sum(r.get("ndvi_value") or 0 for r in rows)
        ndwi_sum = sum(r.get("ndwi_value") or 0 for r in rows)
        flood_count = sum(1 for r in rows if r.get("flood_risk") in ("High", "Critical"))
        return {
            "total_uploads": total,
            "avg_ndvi": round(ndvi_sum / total, 4) if total else 0,
            "avg_ndwi": round(ndwi_sum / total, 4) if total else 0,
            "flood_risk_count": flood_count,
        }
    except Exception as e:
        logger.error(f"Failed to aggregate dashboard data: {e}")
        return {}


# ---------------------------------------------------------------------------
# In-memory fallback stores (used when Supabase is not configured)
# ---------------------------------------------------------------------------

alerts_store: list[dict] = [
    {"id": 1, "title": "Critical deforestation spike in Amazon Basin", "severity": "critical", "module": "Deforestation", "region": "South America", "time": "2 min ago", "resolved": False},
    {"id": 2, "title": "Water reservoir below 15% in Lake Chad", "severity": "high", "module": "Water Scarcity", "region": "Africa", "time": "15 min ago", "resolved": False},
    {"id": 3, "title": "Flash flood warning in Bangladesh delta", "severity": "critical", "module": "Flood Monitoring", "region": "South Asia", "time": "32 min ago", "resolved": False},
    {"id": 4, "title": "Urban heat anomaly detected in Phoenix", "severity": "medium", "module": "Urban Heat", "region": "North America", "time": "1 hr ago", "resolved": False},
    {"id": 5, "title": "Industrial discharge detected near Ganges", "severity": "high", "module": "Pollution", "region": "South Asia", "time": "2 hr ago", "resolved": False},
]

upload_stats: dict = {
    "total_uploads": 0,
    "ndvi_sum": 0.0,
    "ndwi_sum": 0.0,
    "flood_high_count": 0,
    "stress_count": 0,
}
