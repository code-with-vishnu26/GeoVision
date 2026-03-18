"""
Region Monitor Service — Automated regional NDVI/NDWI monitoring engine.

Supports dual mode:
  - REAL: When Sentinel Hub credentials configured, fetches real GeoTIFF
          and computes NDVI/NDWI from actual satellite bands.
  - SIM:  Uses deterministic simulation for development/demo.

Orchestrates:
1. Fetch Sentinel tile for each region (real or simulated)
2. If real GeoTIFF: compute NDVI/NDWI from pixel data
3. Compute risk level
4. Detect NDVI drops and trigger alerts
5. Update region stats and history
"""

import os
import logging
from datetime import datetime

import numpy as np

from app.services.sentinel_fetch_service import sentinel_service, MonitoredRegion
from app.services.ndvi_service import calculate_ndvi, compute_ndvi_stats
from app.services.ndwi_service import calculate_ndwi
from app.services.flood_service import assess_flood_risk
from app.core.database import alerts_store
from app.core.config import get_settings

try:
    import rasterio
    HAS_RASTERIO = True
except ImportError:
    HAS_RASTERIO = False

logger = logging.getLogger("region_monitor")

# ---------------------------------------------------------------------------
# In-memory region state
# ---------------------------------------------------------------------------

region_data: dict[str, dict] = {}


def determine_risk(ndvi: float, ndwi: float) -> str:
    """Determine overall risk level from NDVI and NDWI."""
    flood = assess_flood_risk(ndwi)
    if flood in ("Critical", "High"):
        return "Critical"
    if ndvi < 0.15:
        return "High"
    if ndvi < 0.3:
        return "Moderate"
    if ndvi > 0.6:
        return "Low"
    return "Moderate"


def _create_region_alert(region_name: str, title: str, severity: str, module: str):
    alert = {
        "id": len(alerts_store) + 1,
        "title": title,
        "severity": severity,
        "module": module,
        "region": region_name,
        "time": "Just now",
        "resolved": False,
    }
    alerts_store.append(alert)
    logger.info(f"ALERT: {title}")
    return alert


def _process_real_tiff(tiff_path: str) -> dict:
    """Compute NDVI/NDWI from a real downloaded GeoTIFF."""
    with rasterio.open(tiff_path) as src:
        band_count = src.count

        if band_count >= 4:
            # Evalscript returns: B02(Blue), B03(Green), B04(Red), B08(NIR)
            blue = src.read(1).astype(np.float64)
            green = src.read(2).astype(np.float64)
            red = src.read(3).astype(np.float64)
            nir = src.read(4).astype(np.float64)
        elif band_count >= 2:
            # Minimal: Red + NIR
            red = src.read(1).astype(np.float64)
            nir = src.read(2).astype(np.float64)
            green = red  # proxy
            blue = red
        else:
            # Single band — can't compute indices
            return {"ndvi": 0.0, "ndwi": 0.0, "band_count": band_count}

    # NDVI = (NIR - Red) / (NIR + Red)
    ndvi = calculate_ndvi(nir, red)
    ndvi_stats = compute_ndvi_stats(ndvi)

    # NDWI = (Green - NIR) / (Green + NIR)
    ndwi = calculate_ndwi(green, nir)
    ndwi_mean = float(np.nanmean(ndwi))

    return {
        "ndvi": ndvi_stats["ndvi_mean"],
        "ndwi": round(ndwi_mean, 4),
        "ndvi_stats": ndvi_stats,
        "band_count": band_count,
    }


def process_region(region: MonitoredRegion) -> dict:
    """
    Process a single region:
    1. Fetch sentinel tile (real or simulated)
    2. Get NDVI/NDWI (from real TIFF or simulation)
    3. Determine risk
    4. Check for NDVI drop -> alert
    5. Update region data
    """
    settings = get_settings()
    tile = sentinel_service.fetch_sentinel_tile(region)

    # Get NDVI/NDWI values
    if tile.mode == "real" and tile.tiff_path and HAS_RASTERIO:
        # REAL: Process the actual GeoTIFF
        try:
            indices = _process_real_tiff(tile.tiff_path)
            ndvi = indices["ndvi"]
            ndwi = indices["ndwi"]
            logger.info(f"REAL satellite data: {region.name} NDVI={ndvi:.4f} NDWI={ndwi:.4f}")
        except Exception as e:
            logger.error(f"Failed to process real TIFF for {region.name}: {e}")
            ndvi = tile.ndvi_simulated or 0.0
            ndwi = tile.ndwi_simulated or 0.0
        finally:
            # Clean up temp file
            if tile.tiff_path and os.path.exists(tile.tiff_path):
                os.unlink(tile.tiff_path)
    else:
        # SIMULATED
        ndvi = tile.ndvi_simulated or 0.0
        ndwi = tile.ndwi_simulated or 0.0

    risk = determine_risk(ndvi, ndwi)
    alerts_triggered = 0

    # Check previous NDVI for drop detection
    prev = region_data.get(region.name, {})
    prev_ndvi = prev.get("average_ndvi")

    # NDVI drop alert
    if prev_ndvi is not None and (prev_ndvi - ndvi) > 0.1:
        _create_region_alert(
            region.name,
            f"NDVI drop detected in {region.name}: {prev_ndvi:.3f} -> {ndvi:.3f}",
            "high",
            "Deforestation",
        )
        alerts_triggered += 1

    # Absolute NDVI threshold alert
    if ndvi < settings.NDVI_ALERT_THRESHOLD:
        _create_region_alert(
            region.name,
            f"Vegetation stress in {region.name}: NDVI {ndvi:.3f} below {settings.NDVI_ALERT_THRESHOLD}",
            "high" if ndvi < 0.1 else "medium",
            "Deforestation",
        )
        alerts_triggered += 1

    # Flood risk alert
    flood_risk = assess_flood_risk(ndwi)
    if flood_risk in ("High", "Critical"):
        _create_region_alert(
            region.name,
            f"Flood risk {flood_risk} in {region.name}: NDWI {ndwi:.3f}",
            "critical" if flood_risk == "Critical" else "high",
            "Flood Monitoring",
        )
        alerts_triggered += 1

    # Build NDVI history entry
    history_entry = {
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "ndvi": ndvi,
        "ndwi": ndwi,
        "risk": risk,
        "mode": tile.mode,
    }

    existing_history = prev.get("ndvi_history", [])
    existing_history.append(history_entry)
    if len(existing_history) > 30:
        existing_history = existing_history[-30:]

    region_data[region.name] = {
        "name": region.name,
        "latitude": region.latitude,
        "longitude": region.longitude,
        "average_ndvi": ndvi,
        "average_ndwi": ndwi,
        "risk_level": risk,
        "last_processed": datetime.utcnow().isoformat(),
        "ndvi_history": existing_history,
        "tile_id": tile.tile_id,
        "cloud_cover": tile.cloud_cover,
        "data_mode": tile.mode,
    }

    logger.info(f"[{tile.mode.upper()}] {region.name}: NDVI={ndvi:.4f} NDWI={ndwi:.4f} Risk={risk} Alerts={alerts_triggered}")

    return {
        "region_name": region.name,
        "ndvi_value": ndvi,
        "ndwi_value": ndwi,
        "risk_level": risk,
        "alerts_triggered": alerts_triggered,
        "data_mode": tile.mode,
        "processed_at": datetime.utcnow().isoformat(),
    }


def run_full_monitoring_cycle() -> list[dict]:
    """Run monitoring for ALL regions. Called by scheduler every 24h."""
    mode = "REAL" if sentinel_service.is_real_mode() else "SIMULATED"
    logger.info(f"Starting global monitoring cycle [{mode} MODE]...")
    regions = sentinel_service.get_monitored_regions()
    results = []
    for region in regions:
        result = process_region(region)
        results.append(result)
    logger.info(f"Monitoring cycle complete: {len(results)} regions [{mode}]")
    return results


def get_all_region_data() -> list[dict]:
    if not region_data:
        run_full_monitoring_cycle()
    return list(region_data.values())


def get_region_data(region_name: str) -> dict | None:
    return region_data.get(region_name)
