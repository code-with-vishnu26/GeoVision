"""
Region model — Pydantic schemas for monitored regions.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RegionBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    bbox: Optional[dict] = None


class RegionResponse(RegionBase):
    id: str
    last_processed: Optional[str] = None
    average_ndvi: Optional[float] = None
    average_ndwi: Optional[float] = None
    risk_level: str = "Unknown"
    ndvi_history: Optional[list[dict]] = None


class RegionListResponse(BaseModel):
    regions: list[RegionResponse]
    total: int


class MonitoringResult(BaseModel):
    region_name: str
    ndvi_value: float
    ndwi_value: float
    risk_level: str
    alerts_triggered: int
    processed_at: str
