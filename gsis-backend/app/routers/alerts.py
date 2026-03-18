"""
Alerts Router — Alert management endpoints.
"""

from fastapi import APIRouter, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.services.alert_service import get_all_alerts, resolve_alert

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Alerts"])


@router.get("/")
@limiter.limit("60/minute")
async def list_alerts(request: Request):
    """Return all alerts."""
    return {"alerts": get_all_alerts()}


@router.post("/resolve/{alert_id}")
@limiter.limit("30/minute")
async def resolve(request: Request, alert_id: int):
    """Mark an alert as resolved."""
    if resolve_alert(alert_id):
        return {"success": True, "alert_id": alert_id}
    raise HTTPException(status_code=404, detail="Alert not found")
