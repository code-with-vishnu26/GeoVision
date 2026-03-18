"""
Predict Router — Single image classification.
"""

from fastapi import APIRouter, UploadFile, File, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.services.classification_service import process_single_image
from app.services.alert_service import check_and_create_alerts
from app.utils.validators import validate_upload_file

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Prediction"])


@router.post("/")
@limiter.limit("30/minute")
async def predict(request: Request, file: UploadFile = File(...)):
    """
    Analyze a single image:
    - .tif/.tiff → Real NDVI/NDWI with rasterio
    - .jpg/.png  → Deterministic RGB pixel analysis

    Returns classification, indices, and any triggered alerts.
    """
    validate_upload_file(file)
    contents = await file.read()
    result = process_single_image(contents, file.filename or "image.jpg")

    # Check thresholds and auto-create alerts
    alerts_triggered = check_and_create_alerts(result)
    if alerts_triggered:
        result["alerts_triggered"] = alerts_triggered

    return result
