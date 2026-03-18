"""
Raster utilities — Band extraction helpers.
"""

import numpy as np
from typing import Optional

try:
    import rasterio
    HAS_RASTERIO = True
except ImportError:
    HAS_RASTERIO = False


def is_rasterio_available() -> bool:
    return HAS_RASTERIO


def get_band_info(file_path: str) -> dict:
    """Extract band metadata from a GeoTIFF file."""
    if not HAS_RASTERIO:
        return {"error": "rasterio not installed"}

    with rasterio.open(file_path) as src:
        return {
            "band_count": src.count,
            "width": src.width,
            "height": src.height,
            "crs": str(src.crs) if src.crs else None,
            "transform": str(src.transform) if src.transform else None,
            "dtypes": [str(d) for d in src.dtypes],
            "bounds": {
                "left": src.bounds.left,
                "bottom": src.bounds.bottom,
                "right": src.bounds.right,
                "top": src.bounds.top,
            } if src.bounds else None,
        }


def extract_bands(file_path: str) -> dict[str, Optional[np.ndarray]]:
    """
    Extract NIR, Red, Green, Blue bands from a GeoTIFF.
    Handles Sentinel-2, Landsat, and RGB-only TIFFs.
    """
    with rasterio.open(file_path) as src:
        band_count = src.count

        if band_count >= 8:
            return {
                "nir": src.read(8).astype(np.float64),
                "red": src.read(4).astype(np.float64),
                "green": src.read(3).astype(np.float64),
                "blue": src.read(2).astype(np.float64),
                "band_count": band_count,
                "dimensions": (src.width, src.height),
            }
        elif band_count >= 4:
            return {
                "nir": src.read(4).astype(np.float64),
                "red": src.read(3).astype(np.float64),
                "green": src.read(2).astype(np.float64),
                "blue": src.read(1).astype(np.float64),
                "band_count": band_count,
                "dimensions": (src.width, src.height),
            }
        elif band_count >= 3:
            green = src.read(2).astype(np.float64)
            return {
                "nir": green,  # proxy
                "red": src.read(1).astype(np.float64),
                "green": green,
                "blue": src.read(3).astype(np.float64),
                "band_count": band_count,
                "dimensions": (src.width, src.height),
            }
        else:
            return {
                "nir": None,
                "red": None,
                "green": None,
                "blue": None,
                "band_count": band_count,
                "dimensions": (src.width, src.height),
            }
