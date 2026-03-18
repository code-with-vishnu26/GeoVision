"""
NDVI Service — Normalized Difference Vegetation Index computation.

NDVI = (NIR - Red) / (NIR + Red)
Range: -1 to +1
  +0.6 to +1.0  → Dense vegetation
  +0.2 to +0.5  → Crops / grass
   0.0 to +0.2  → Bare soil
        < 0      → Water
"""

import numpy as np


def calculate_ndvi(nir: np.ndarray, red: np.ndarray) -> np.ndarray:
    """Compute per-pixel NDVI from NIR and Red bands."""
    denominator = nir + red + 1e-10
    return (nir - red) / denominator


def calculate_ndvi_rgb(green: np.ndarray, red: np.ndarray) -> np.ndarray:
    """Approximate NDVI from RGB image using Green as NIR proxy."""
    denominator = green + red
    valid = denominator != 0
    return np.where(valid, (green - red) / denominator, 0.0)


def classify_ndvi(ndvi_mean: float) -> tuple[str, str]:
    """Return (predicted_class, vegetation_status) from NDVI value."""
    if ndvi_mean > 0.6:
        return "Dense Forest", "Thriving dense vegetation"
    elif ndvi_mean > 0.4:
        return "Forest", "Healthy vegetation cover"
    elif ndvi_mean > 0.3:
        return "Vegetation / Crops", "Moderate vegetation — likely agricultural"
    elif ndvi_mean > 0.2:
        return "Sparse Vegetation", "Sparse or stressed vegetation"
    elif ndvi_mean > 0.05:
        return "Bare Soil", "Minimal vegetation — bare ground"
    elif ndvi_mean > -0.05:
        return "Barren Land", "No significant vegetation"
    else:
        return "Water / Non-Vegetation", "Water body or non-vegetated surface"


def compute_ndvi_stats(ndvi: np.ndarray) -> dict:
    """Return mean, min, max, std of NDVI array."""
    return {
        "ndvi_mean": round(float(np.nanmean(ndvi)), 4),
        "ndvi_min": round(float(np.nanmin(ndvi)), 4),
        "ndvi_max": round(float(np.nanmax(ndvi)), 4),
        "ndvi_std": round(float(np.nanstd(ndvi)), 4),
    }


def build_ndvi_probabilities(ndvi_mean: float) -> list[dict]:
    """Build probability distribution based on NDVI distance to class thresholds."""
    classes = ["Dense Forest", "Forest", "Vegetation / Crops", "Sparse Vegetation",
               "Bare Soil", "Barren Land", "Water / Non-Vegetation"]
    thresholds = [0.6, 0.4, 0.3, 0.2, 0.05, -0.05, -1.0]
    scores = {}
    for cls, thresh in zip(classes, thresholds):
        scores[cls] = round(max(1.0 - abs(ndvi_mean - thresh) * 2, 0.01), 3)
    total = sum(scores.values())
    return [{"name": k, "value": round((v / total) * 100, 1)}
            for k, v in sorted(scores.items(), key=lambda x: -x[1])]
