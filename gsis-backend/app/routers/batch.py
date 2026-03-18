"""
Batch Router — Multi-image batch processing.
"""

from typing import List
from fastapi import APIRouter, UploadFile, File, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.services.classification_service import process_single_image
from app.services.alert_service import check_and_create_alerts
from app.utils.validators import validate_batch_size

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Batch"])


@router.post("/")
@limiter.limit("10/minute")
async def batch_predict(request: Request, files: List[UploadFile] = File(...)):
    """Process up to 20 images and return per-file results."""
    validate_batch_size(len(files))

    results = []
    for f in files:
        contents = await f.read()
        try:
            result = process_single_image(contents, f.filename or "image.jpg")
            check_and_create_alerts(result)
            result["filename"] = f.filename
            results.append(result)
        except HTTPException as e:
            results.append({"filename": f.filename, "error": e.detail})

    return {
        "results": results,
        "total": len(results),
        "successful": sum(1 for r in results if "error" not in r),
    }
