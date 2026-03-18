"""
NDWI Service — Normalized Difference Water Index computation.

For satellite:  NDWI = (Green - NIR) / (Green + NIR)
For RGB:        NDWI = (Green - Blue) / (Green + Blue)

Range: -1 to +1
  > 0.3   → Open water / high moisture
  0 to 0.3 → Moist surface
  < 0     → Dry / vegetated surface
"""

import numpy as np


def calculate_ndwi(green: np.ndarray, nir: np.ndarray) -> np.ndarray:
    """Compute per-pixel NDWI from Green and NIR bands (satellite)."""
    denominator = green + nir + 1e-10
    return (green - nir) / denominator


def calculate_ndwi_rgb(green: np.ndarray, blue: np.ndarray) -> np.ndarray:
    """Approximate NDWI from RGB image using Blue band."""
    denominator = green + blue
    valid = denominator != 0
    return np.where(valid, (green - blue) / denominator, 0.0)


def compute_ndwi_stats(ndwi: np.ndarray) -> dict:
    """Return mean/min/max of NDWI array."""
    return {
        "ndwi_mean": round(float(np.nanmean(ndwi)), 4),
        "ndwi_min": round(float(np.nanmin(ndwi)), 4),
        "ndwi_max": round(float(np.nanmax(ndwi)), 4),
    }


def classify_water_presence(ndwi_mean: float) -> str:
    """Classify water presence from NDWI value."""
    if ndwi_mean > 0.5:
        return "Open water"
    elif ndwi_mean > 0.3:
        return "High moisture / shallow water"
    elif ndwi_mean > 0.0:
        return "Some moisture"
    return "Dry surface"
