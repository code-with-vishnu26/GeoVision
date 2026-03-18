"""
Heat Anomaly Service — Land Surface Temperature (LST) analysis.

Detects urban heat islands and thermal anomalies.

Data sources:
- Landsat 8/9 Band 10 (thermal infrared, 10.6-11.19 um)
- Sentinel-3 SLSTR (future)

Currently uses simulation for Sentinel-2 data, which lacks thermal bands.
"""

import numpy as np
import logging
from typing import Optional

logger = logging.getLogger("heat_service")


def estimate_lst_from_rgb(red: np.ndarray, nir: np.ndarray, ndvi: np.ndarray) -> dict:
    """
    Estimate surface temperature proxy from RGB/NIR data.

    Uses emissivity-based approximation:
    - High NDVI (vegetation) = lower temperature
    - Low NDVI (urban/barren) = higher temperature
    - Water bodies = moderate temperature

    This is an approximation — real LST requires thermal infrared bands.
    """
    # Surface emissivity estimate from NDVI
    # Pv (proportion of vegetation)
    ndvi_min = float(np.nanmin(ndvi))
    ndvi_max = float(np.nanmax(ndvi))
    ndvi_range = ndvi_max - ndvi_min if ndvi_max > ndvi_min else 1.0

    pv = ((ndvi - ndvi_min) / ndvi_range) ** 2
    emissivity = 0.004 * pv + 0.986

    # Brightness temperature proxy (normalized reflectance)
    brightness = (red * 0.3 + nir * 0.7) / 10000  # Rough DN to reflectance
    # Approximate LST in Celsius (calibrated proxy)
    lst_proxy = 20 + (brightness * 40) - (pv * 15)

    lst_mean = round(float(np.nanmean(lst_proxy)), 1)
    lst_max = round(float(np.nanmax(lst_proxy)), 1)
    lst_min = round(float(np.nanmin(lst_proxy)), 1)

    return {
        "temperature_avg": lst_mean,
        "temperature_max": lst_max,
        "temperature_min": lst_min,
        "emissivity_avg": round(float(np.nanmean(emissivity)), 4),
    }


def classify_heat_risk(temperature_avg: float, ndvi_mean: float) -> dict:
    """Classify heat anomaly risk from temperature and vegetation cover."""
    # Urban heat island: high temp + low NDVI
    is_urban_heat = temperature_avg > 35 and ndvi_mean < 0.2

    if temperature_avg > 45:
        level = "Extreme"
        description = "Extreme heat — possible wildfire or industrial hotspot"
    elif temperature_avg > 38 or is_urban_heat:
        level = "High"
        description = "Urban heat island detected" if is_urban_heat else "High surface temperature"
    elif temperature_avg > 32:
        level = "Moderate"
        description = "Elevated surface temperature"
    elif temperature_avg > 25:
        level = "Low"
        description = "Normal surface temperature"
    else:
        level = "None"
        description = "Cool surface — likely water or dense vegetation"

    return {
        "heat_risk": level,
        "description": description,
        "is_urban_heat_island": is_urban_heat,
    }


def analyze_thermal(red: np.ndarray, nir: np.ndarray, ndvi: np.ndarray, ndvi_mean: float) -> dict:
    """Full thermal analysis: LST estimation + heat risk classification."""
    lst = estimate_lst_from_rgb(red, nir, ndvi)
    risk = classify_heat_risk(lst["temperature_avg"], ndvi_mean)

    return {
        **lst,
        **risk,
    }
