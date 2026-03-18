"""
Flood Service — Flood risk assessment from NDWI values.
"""


def assess_flood_risk(ndwi_mean: float) -> str:
    """Determine flood risk level from NDWI."""
    if ndwi_mean > 0.5:
        return "Critical"
    elif ndwi_mean > 0.3:
        return "High"
    elif ndwi_mean > 0.1:
        return "Moderate"
    elif ndwi_mean > -0.1:
        return "Low"
    return "None"


def compute_vegetation_stress(ndvi_std: float, ndvi_mean: float) -> dict:
    """Assess vegetation stress from NDVI spatial variance."""
    if ndvi_mean < 0.1:
        return {"level": "N/A", "description": "No vegetation detected"}
    ratio = ndvi_std / (abs(ndvi_mean) + 1e-6)
    if ratio > 0.5:
        return {"level": "Severe", "description": "High spatial variance — vegetation under severe stress"}
    elif ratio > 0.3:
        return {"level": "Moderate", "description": "Significant variance — possible drought or disease"}
    elif ratio > 0.15:
        return {"level": "Mild", "description": "Some variance — light stress present"}
    return {"level": "Healthy", "description": "Uniform vegetation — no significant stress"}
