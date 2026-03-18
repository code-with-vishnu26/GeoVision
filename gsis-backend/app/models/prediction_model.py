"""
Pydantic models for prediction request/response.
"""

from pydantic import BaseModel
from typing import Optional


class ProcessingMetadata(BaseModel):
    file_size_bytes: int
    file_size_kb: float
    processing_time_seconds: float
    image_dimensions: str
    file_type: str
    model_version: str


class VegetationStress(BaseModel):
    level: str
    description: str


class DominantRGB(BaseModel):
    red: float
    green: float
    blue: float


class ProbabilityItem(BaseModel):
    name: str
    value: float


class PredictionResponse(BaseModel):
    predicted_class: str
    confidence: float
    ndvi_mean: float
    ndvi_min: Optional[float] = None
    ndvi_max: Optional[float] = None
    ndvi_std: Optional[float] = None
    ndwi_mean: Optional[float] = None
    flood_risk: Optional[str] = None
    vegetation_status: Optional[str] = None
    vegetation_stress: Optional[VegetationStress] = None
    analysis_model: str
    probabilities: list[ProbabilityItem]
    dominant_rgb: Optional[DominantRGB] = None
    brightness: Optional[float] = None
    texture: Optional[float] = None
    band_count: Optional[int] = None
    image_dimensions: Optional[str] = None
    processing_metadata: Optional[ProcessingMetadata] = None
    alerts_triggered: Optional[list[dict]] = None


class BatchPredictionResponse(BaseModel):
    results: list[dict]
    total: int
    successful: int
