"""
GSIS Backend v4.0 — Full Production GeoVision Satellite Intelligence System

Indices: NDVI, NDWI, Flood Risk, Vegetation Stress
Endpoints: /predict, /batch-predict, /stats, /history, /alerts,
           /resolve-alert, /system-health, /admin/users
"""

import io
import os
import time
import tempfile
from datetime import datetime
from typing import List

import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

try:
    import rasterio
    HAS_RASTERIO = True
except ImportError:
    HAS_RASTERIO = False

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
START_TIME = time.time()
MODEL_VERSION = "4.0.0"

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="GSIS Backend", version=MODEL_VERSION)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory alert store (replaced by Supabase in Phase 4)
alerts_db: list[dict] = [
    {"id": 1, "title": "Critical deforestation spike in Amazon Basin", "severity": "critical", "module": "Deforestation", "region": "South America", "time": "2 min ago", "resolved": False},
    {"id": 2, "title": "Water reservoir below 15% in Lake Chad", "severity": "high", "module": "Water Scarcity", "region": "Africa", "time": "15 min ago", "resolved": False},
    {"id": 3, "title": "Flash flood warning in Bangladesh delta", "severity": "critical", "module": "Flood Monitoring", "region": "South Asia", "time": "32 min ago", "resolved": False},
    {"id": 4, "title": "Urban heat anomaly detected in Phoenix", "severity": "medium", "module": "Urban Heat", "region": "North America", "time": "1 hr ago", "resolved": False},
    {"id": 5, "title": "Industrial discharge detected near Ganges", "severity": "high", "module": "Pollution", "region": "South Asia", "time": "2 hr ago", "resolved": False},
]

# ---------------------------------------------------------------------------
# Classification + Index Computation
# ---------------------------------------------------------------------------

def classify_ndvi(ndvi_mean: float) -> tuple[str, str]:
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


def assess_flood_risk(ndwi: float) -> str:
    if ndwi > 0.5:
        return "Critical"
    elif ndwi > 0.3:
        return "High"
    elif ndwi > 0.1:
        return "Moderate"
    elif ndwi > -0.1:
        return "Low"
    return "None"


def compute_vegetation_stress(ndvi_std: float, ndvi_mean: float) -> dict:
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


# ---------------------------------------------------------------------------
# GeoTIFF Analysis
# ---------------------------------------------------------------------------

def analyze_geotiff(file_path: str) -> dict:
    with rasterio.open(file_path) as src:
        band_count = src.count
        width, height = src.width, src.height

        nir, red, green, blue = None, None, None, None

        if band_count >= 8:
            red = src.read(4).astype(np.float64)
            nir = src.read(8).astype(np.float64)
            green = src.read(3).astype(np.float64)
            blue = src.read(2).astype(np.float64)
        elif band_count >= 4:
            red = src.read(3).astype(np.float64)
            nir = src.read(4).astype(np.float64)
            green = src.read(2).astype(np.float64)
            blue = src.read(1).astype(np.float64)
        elif band_count >= 3:
            red = src.read(1).astype(np.float64)
            green = src.read(2).astype(np.float64)
            blue = src.read(3).astype(np.float64)
            nir = green  # proxy

    # NDVI
    denom_ndvi = nir + red + 1e-10
    ndvi = (nir - red) / denom_ndvi
    ndvi_mean = float(np.nanmean(ndvi))
    ndvi_std = float(np.nanstd(ndvi))

    # NDWI = (Green - NIR) / (Green + NIR)
    denom_ndwi = green + nir + 1e-10
    ndwi = (green - nir) / denom_ndwi
    ndwi_mean = float(np.nanmean(ndwi))

    # Classification
    predicted_class, vegetation_status = classify_ndvi(ndvi_mean)
    confidence = min(round(abs(ndvi_mean) + 0.4, 2), 0.99)
    flood_risk = assess_flood_risk(ndwi_mean)
    veg_stress = compute_vegetation_stress(ndvi_std, ndvi_mean)

    # Probabilities
    classes = ["Dense Forest", "Forest", "Vegetation / Crops", "Sparse Vegetation",
               "Bare Soil", "Barren Land", "Water / Non-Vegetation"]
    thresholds = [0.6, 0.4, 0.3, 0.2, 0.05, -0.05, -1.0]
    scores = {}
    for cls, thresh in zip(classes, thresholds):
        scores[cls] = round(max(1.0 - abs(ndvi_mean - thresh) * 2, 0.01), 3)
    total = sum(scores.values())
    probabilities = [{"name": k, "value": round((v / total) * 100, 1)}
                     for k, v in sorted(scores.items(), key=lambda x: -x[1])]

    return {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "ndvi_mean": round(ndvi_mean, 4),
        "ndvi_min": round(float(np.nanmin(ndvi)), 4),
        "ndvi_max": round(float(np.nanmax(ndvi)), 4),
        "ndvi_std": round(ndvi_std, 4),
        "ndwi_mean": round(ndwi_mean, 4),
        "flood_risk": flood_risk,
        "vegetation_status": vegetation_status,
        "vegetation_stress": veg_stress,
        "analysis_model": "ndvi-satellite",
        "probabilities": probabilities,
        "band_count": band_count,
        "image_dimensions": f"{width}x{height}",
    }


# ---------------------------------------------------------------------------
# RGB Fallback
# ---------------------------------------------------------------------------

def analyze_rgb_image(image: Image.Image) -> dict:
    image = image.convert("RGB")
    arr = np.array(image.resize((224, 224)), dtype=np.float64)

    avg_r = float(np.mean(arr[:, :, 0]))
    avg_g = float(np.mean(arr[:, :, 1]))
    avg_b = float(np.mean(arr[:, :, 2]))
    brightness = float(np.mean(arr))

    # NDVI approx
    r_band, g_band = arr[:, :, 0], arr[:, :, 1]
    denom = g_band + r_band
    valid = denom != 0
    ndvi = np.where(valid, (g_band - r_band) / denom, 0.0)
    ndvi_mean = float(np.mean(ndvi))
    ndvi_std = float(np.std(ndvi))

    # NDWI approx = (Green - Blue) / (Green + Blue)
    b_band = arr[:, :, 2]
    denom_w = g_band + b_band
    valid_w = denom_w != 0
    ndwi = np.where(valid_w, (g_band - b_band) / denom_w, 0.0)
    ndwi_mean = float(np.mean(ndwi))

    # Texture
    gray = np.mean(arr, axis=2)
    texture = float(np.std(gray))

    total_i = avg_r + avg_g + avg_b or 1.0
    gr, br, rr = avg_g / total_i, avg_b / total_i, avg_r / total_i

    scores = {
        "Forest": (gr * 1.5) + max(ndvi_mean, 0) * 2.0 + (0.1 if avg_g > 100 else 0),
        "Water Body": (br * 1.5) + max(-ndvi_mean, 0) * 1.5 + (0.2 if brightness < 100 else 0),
        "Urban Area": (rr * 1.0) + (texture / 255) * 1.5 + (0.15 if brightness > 140 else 0),
        "Agriculture": (gr * 1.0) + (0.3 if 0 < ndvi_mean < 0.3 else 0) + (0.1 if 80 < avg_g < 150 else 0),
        "Barren Land": (rr * 0.8) + (0.3 if abs(ndvi_mean) < 0.05 else 0) + (0.2 if brightness > 160 else 0),
        "Wetland": (gr * 0.5 + br * 0.5) + (0.2 if 0 < ndvi_mean < 0.2 else 0),
    }
    ts = sum(scores.values()) or 1.0
    probs = {k: round((v / ts) * 100, 1) for k, v in scores.items()}
    predicted = max(probs, key=probs.get)
    conf = round(probs[predicted] / 100, 2)

    _, veg_status = classify_ndvi(ndvi_mean)
    flood_risk = assess_flood_risk(ndwi_mean)
    veg_stress = compute_vegetation_stress(ndvi_std, ndvi_mean)

    return {
        "predicted_class": predicted,
        "confidence": conf,
        "ndvi_mean": round(ndvi_mean, 4),
        "ndvi_std": round(ndvi_std, 4),
        "ndwi_mean": round(ndwi_mean, 4),
        "flood_risk": flood_risk,
        "vegetation_status": veg_status,
        "vegetation_stress": veg_stress,
        "analysis_model": "rgb-pixel",
        "probabilities": sorted([{"name": k, "value": v} for k, v in probs.items()], key=lambda x: -x["value"]),
        "dominant_rgb": {"red": round(avg_r, 1), "green": round(avg_g, 1), "blue": round(avg_b, 1)},
        "brightness": round(brightness, 1),
        "texture": round(texture, 1),
    }


# ---------------------------------------------------------------------------
# Core processing function
# ---------------------------------------------------------------------------

def process_image(contents: bytes, filename: str) -> dict:
    """Process a single image (TIFF or RGB) and return full analysis."""
    start = time.time()
    is_tiff = filename.lower().endswith((".tif", ".tiff"))

    if is_tiff:
        if not HAS_RASTERIO:
            raise HTTPException(status_code=400, detail="rasterio not installed. Run: pip install rasterio")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".tif") as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        try:
            result = analyze_geotiff(tmp_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading GeoTIFF: {e}")
        finally:
            os.unlink(tmp_path)
    else:
        try:
            image = Image.open(io.BytesIO(contents))
            result = analyze_rgb_image(image)
            result["image_dimensions"] = f"{image.width}x{image.height}"
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image file")

    processing_time = round(time.time() - start, 3)
    result["processing_metadata"] = {
        "file_size_bytes": len(contents),
        "file_size_kb": round(len(contents) / 1024, 1),
        "processing_time_seconds": processing_time,
        "image_dimensions": result.get("image_dimensions", "unknown"),
        "file_type": "GeoTIFF" if is_tiff else "RGB Image",
        "model_version": MODEL_VERSION,
    }
    return result


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    return {"service": "GSIS Backend", "status": "running", "version": MODEL_VERSION, "rasterio": HAS_RASTERIO}


@app.post("/predict")
@limiter.limit("30/minute")
async def predict(request: Request, file: UploadFile = File(...)):
    contents = await file.read()
    return process_image(contents, file.filename or "image.jpg")


@app.post("/batch-predict")
@limiter.limit("10/minute")
async def batch_predict(request: Request, files: List[UploadFile] = File(...)):
    """Process multiple images and return per-file results."""
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 files per batch")
    results = []
    for f in files:
        contents = await f.read()
        try:
            result = process_image(contents, f.filename or "image.jpg")
            result["filename"] = f.filename
            results.append(result)
        except HTTPException as e:
            results.append({"filename": f.filename, "error": e.detail})
    return {"results": results, "total": len(results), "successful": sum(1 for r in results if "error" not in r)}


@app.get("/stats")
@limiter.limit("60/minute")
async def get_stats(request: Request):
    return {
        "sustainability_score": 72,
        "active_alerts": sum(1 for a in alerts_db if not a["resolved"]),
        "monitored_regions": 195,
        "data_points_billions": 2.4,
        "modules": {
            "deforestation": {"risk": 78, "trend": 8.2},
            "water": {"risk": 72, "trend": 4.1},
            "crop": {"risk": 65, "trend": 6.7},
            "flood": {"risk": 58, "trend": 22.5},
            "heat": {"risk": 82, "trend": 12.3},
            "pollution": {"risk": 74, "trend": 6.8},
        },
        "indices": {
            "avg_ndvi": 0.38,
            "avg_ndwi": 0.12,
            "flood_risk_count": 3,
            "vegetation_stress_count": 5,
        },
    }


@app.get("/history")
@limiter.limit("60/minute")
async def get_history(request: Request):
    return {
        "history": [
            {"date": "2026-02-24", "class": "Dense Forest", "confidence": 0.92, "ndvi": 0.72, "ndwi": 0.08, "flood_risk": "None"},
            {"date": "2026-02-23", "class": "Urban Area", "confidence": 0.82, "ndvi": 0.08, "ndwi": -0.12, "flood_risk": "None"},
            {"date": "2026-02-22", "class": "Vegetation / Crops", "confidence": 0.76, "ndvi": 0.35, "ndwi": 0.15, "flood_risk": "Moderate"},
            {"date": "2026-02-21", "class": "Water / Non-Vegetation", "confidence": 0.91, "ndvi": -0.22, "ndwi": 0.55, "flood_risk": "Critical"},
            {"date": "2026-02-20", "class": "Bare Soil", "confidence": 0.68, "ndvi": 0.08, "ndwi": -0.05, "flood_risk": "None"},
        ]
    }


@app.get("/alerts")
@limiter.limit("60/minute")
async def get_alerts(request: Request):
    return {"alerts": alerts_db}


@app.post("/resolve-alert/{alert_id}")
@limiter.limit("30/minute")
async def resolve_alert(request: Request, alert_id: int):
    for a in alerts_db:
        if a["id"] == alert_id:
            a["resolved"] = True
            return {"success": True, "alert_id": alert_id}
    raise HTTPException(status_code=404, detail="Alert not found")


@app.get("/system-health")
@limiter.limit("60/minute")
async def system_health(request: Request):
    uptime = round(time.time() - START_TIME, 1)
    health: dict = {
        "status": "healthy",
        "uptime_seconds": uptime,
        "uptime_human": f"{int(uptime // 3600)}h {int((uptime % 3600) // 60)}m {int(uptime % 60)}s",
        "model_version": MODEL_VERSION,
        "rasterio_available": HAS_RASTERIO,
        "python_version": __import__("sys").version,
        "timestamp": datetime.utcnow().isoformat(),
    }
    if HAS_PSUTIL:
        health["cpu_percent"] = psutil.cpu_percent(interval=0.1)
        health["memory_percent"] = psutil.virtual_memory().percent
        health["disk_percent"] = psutil.disk_usage("/").percent
    return health


@app.get("/admin/users")
@limiter.limit("30/minute")
async def admin_users(request: Request):
    """Placeholder — in production, query Supabase auth.users."""
    return {
        "users": [
            {"id": "demo-1", "email": "admin@geovision.ai", "role": "admin", "uploads": 42},
            {"id": "demo-2", "email": "analyst@geovision.ai", "role": "analyst", "uploads": 18},
            {"id": "demo-3", "email": "viewer@geovision.ai", "role": "viewer", "uploads": 0},
        ]
    }
