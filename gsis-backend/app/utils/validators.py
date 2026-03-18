"""
Input validators.
"""

from fastapi import HTTPException, UploadFile
from app.core.config import get_settings


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/tiff"}


def validate_upload_file(file: UploadFile) -> None:
    """Validate that the uploaded file is an acceptable image."""
    settings = get_settings()
    filename = (file.filename or "").lower()

    # Check extension
    ext = "." + filename.rsplit(".", 1)[-1] if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )


def validate_batch_size(count: int) -> None:
    """Validate batch upload size."""
    settings = get_settings()
    if count > settings.MAX_BATCH_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {settings.MAX_BATCH_SIZE} files per batch. Got {count}."
        )
    if count < 1:
        raise HTTPException(status_code=400, detail="At least 1 file required.")


def is_tiff(filename: str) -> bool:
    """Check if filename is a TIFF/GeoTIFF."""
    return filename.lower().endswith((".tif", ".tiff"))
