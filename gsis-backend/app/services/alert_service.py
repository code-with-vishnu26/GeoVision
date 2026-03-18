"""
Alert Service — Threshold-based alert generation and management.
"""

from app.core.config import get_settings
from app.core.database import alerts_store, upload_stats


def check_and_create_alerts(analysis_result: dict) -> list[dict]:
    """
    Check analysis result against thresholds and create alerts if triggered.
    Returns list of new alerts created.
    """
    settings = get_settings()
    new_alerts = []

    ndvi_mean = analysis_result.get("ndvi_mean", 0)
    flood_risk = analysis_result.get("flood_risk", "None")
    predicted_class = analysis_result.get("predicted_class", "")

    # NDVI threshold alert
    if ndvi_mean < settings.NDVI_ALERT_THRESHOLD and ndvi_mean != 0:
        alert = {
            "id": len(alerts_store) + 1,
            "title": f"Vegetation stress detected — NDVI {ndvi_mean:.3f} below threshold {settings.NDVI_ALERT_THRESHOLD}",
            "severity": "high" if ndvi_mean < 0.1 else "medium",
            "module": "Deforestation",
            "region": "Analysis Upload",
            "time": "Just now",
            "resolved": False,
        }
        alerts_store.append(alert)
        new_alerts.append(alert)

    # Flood risk alert
    if flood_risk in ("High", "Critical"):
        alert = {
            "id": len(alerts_store) + 1,
            "title": f"Flood risk {flood_risk} — NDWI indicates water accumulation ({predicted_class})",
            "severity": "critical" if flood_risk == "Critical" else "high",
            "module": "Flood Monitoring",
            "region": "Analysis Upload",
            "time": "Just now",
            "resolved": False,
        }
        alerts_store.append(alert)
        new_alerts.append(alert)

    # Update aggregate stats
    upload_stats["total_uploads"] += 1
    upload_stats["ndvi_sum"] += ndvi_mean
    upload_stats["ndwi_sum"] += analysis_result.get("ndwi_mean", 0)
    if flood_risk in ("High", "Critical"):
        upload_stats["flood_high_count"] += 1
    veg_stress = analysis_result.get("vegetation_stress", {})
    if isinstance(veg_stress, dict) and veg_stress.get("level") in ("Severe", "Moderate"):
        upload_stats["stress_count"] += 1

    return new_alerts


def resolve_alert(alert_id: int) -> bool:
    """Mark an alert as resolved. Returns True if found."""
    for a in alerts_store:
        if a["id"] == alert_id:
            a["resolved"] = True
            return True
    return False


def get_all_alerts() -> list[dict]:
    """Return all alerts."""
    return alerts_store


def get_aggregate_stats() -> dict:
    """Return aggregated stats from all uploads."""
    total = upload_stats["total_uploads"] or 1
    return {
        "total_uploads": upload_stats["total_uploads"],
        "avg_ndvi": round(upload_stats["ndvi_sum"] / total, 4),
        "avg_ndwi": round(upload_stats["ndwi_sum"] / total, 4),
        "flood_risk_count": upload_stats["flood_high_count"],
        "vegetation_stress_count": upload_stats["stress_count"],
    }
