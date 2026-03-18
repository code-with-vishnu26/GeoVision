"""
Alert model.
"""

from pydantic import BaseModel
from typing import Optional


class AlertResponse(BaseModel):
    id: int
    title: str
    severity: str
    module: str
    region: str
    time: str
    resolved: bool


class AlertsListResponse(BaseModel):
    alerts: list[AlertResponse]


class AlertResolveResponse(BaseModel):
    success: bool
    alert_id: int
