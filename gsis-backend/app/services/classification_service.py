"""
Classification Service — Orchestrates image analysis pipeline.

Handles both GeoTIFF (real satellite) and RGB (JPG/PNG) images.
Calls NDVI, NDWI, flood, and stress services.
"""

import io
import os
import time
import tempfile

import numpy as np
from PIL import Image

from app.services.ndvi_service import (
    calculate_ndvi, calculate_ndvi_rgb, classify_ndvi,
    compute_ndvi_stats, build_ndvi_probabilities,
)
from app.services.ndwi_service import calculate_ndwi, calculate_ndwi_rgb
from app.services.flood_service import assess_flood_risk, compute_vegetation_stress
from app.core.config import get_settings

try:
    import rasterio
    HAS_RASTERIO = True
except ImportError:
    HAS_RASTERIO = False


def analyze_geotiff(file_path: str) -> dict:
    """Process a multi-band GeoTIFF and return full analysis."""
    with rasterio.open(file_path) as src:
        band_count = src.count
        width, height = src.width, src.height

        nir, red, green, blue = None, None, None, None

        if band_count >= 8:
            # Sentinel-2: B2=Blue, B3=Green, B4=Red, B8=NIR
            red = src.read(4).astype(np.float64)
            nir = src.read(8).astype(np.float64)
            green = src.read(3).astype(np.float64)
            blue = src.read(2).astype(np.float64)
        elif band_count >= 4:
            # Landsat: B1=Blue, B2=Green, B3=Red, B4=NIR
            red = src.read(3).astype(np.float64)
            nir = src.read(4).astype(np.float64)
            green = src.read(2).astype(np.float64)
            blue = src.read(1).astype(np.float64)
        elif band_count >= 3:
            # RGB GeoTIFF — use Green as NIR proxy
            red = src.read(1).astype(np.float64)
            green = src.read(2).astype(np.float64)
            blue = src.read(3).astype(np.float64)
            nir = green

    # NDVI
    ndvi = calculate_ndvi(nir, red)
    ndvi_stats = compute_ndvi_stats(ndvi)
    predicted_class, vegetation_status = classify_ndvi(ndvi_stats["ndvi_mean"])
    probabilities = build_ndvi_probabilities(ndvi_stats["ndvi_mean"])

    # NDWI
    ndwi = calculate_ndwi(green, nir)
    ndwi_mean = round(float(np.nanmean(ndwi)), 4)

    # Flood + stress
    flood_risk = assess_flood_risk(ndwi_mean)
    veg_stress = compute_vegetation_stress(ndvi_stats["ndvi_std"], ndvi_stats["ndvi_mean"])

    confidence = min(round(abs(ndvi_stats["ndvi_mean"]) + 0.4, 2), 0.99)

    return {
        "predicted_class": predicted_class,
        "confidence": confidence,
        **ndvi_stats,
        "ndwi_mean": ndwi_mean,
        "flood_risk": flood_risk,
        "vegetation_status": vegetation_status,
        "vegetation_stress": veg_stress,
        "analysis_model": "ndvi-satellite",
        "probabilities": probabilities,
        "band_count": band_count,
        "image_dimensions": f"{width}x{height}",
    }


def analyze_rgb_image(image: Image.Image) -> dict:
    """Deterministic pixel-based analysis for standard RGB images."""
    image = image.convert("RGB")
    arr = np.array(image.resize((224, 224)), dtype=np.float64)

    avg_r = float(np.mean(arr[:, :, 0]))
    avg_g = float(np.mean(arr[:, :, 1]))
    avg_b = float(np.mean(arr[:, :, 2]))
    brightness = float(np.mean(arr))

    # NDVI approx
    ndvi = calculate_ndvi_rgb(arr[:, :, 1], arr[:, :, 0])
    ndvi_mean = float(np.mean(ndvi))
    ndvi_std = float(np.std(ndvi))

    # NDWI approx
    ndwi = calculate_ndwi_rgb(arr[:, :, 1], arr[:, :, 2])
    ndwi_mean = float(np.mean(ndwi))

    # Texture
    gray = np.mean(arr, axis=2)
    texture = float(np.std(gray))

    # Classification scoring
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


def process_single_image(contents: bytes, filename: str) -> dict:
    """
    Process a single image file:
    1. TIFF → rasterio NDVI/NDWI analysis
    2. RGB  → pixel-based analysis + CNN deep learning classification
    Returns full analysis dict with processing metadata.
    """
    from fastapi import HTTPException

    start = time.time()
    settings = get_settings()
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

    # -------------------------------------------------------------------
    # CNN Deep Learning Classification (for RGB images)
    # -------------------------------------------------------------------
    analysis_engines = [result.get("analysis_model", "unknown")]

    try:
        from app.services.cnn_service import predict_from_bytes, is_cnn_available
        if is_cnn_available():
            cnn_result = predict_from_bytes(contents)
            if cnn_result:
                result["cnn_class"] = cnn_result["cnn_class"]
                result["cnn_confidence"] = cnn_result["cnn_confidence"]
                result["cnn_probabilities"] = cnn_result["cnn_probabilities"]
                result["cnn_device"] = cnn_result["device"]

                # CNN overrides pixel classification for RGB images
                if not is_tiff:
                    result["predicted_class"] = cnn_result["cnn_class"]
                    result["confidence"] = cnn_result["cnn_confidence"]
                    result["analysis_model"] = "cnn-resnet50"
                    result["probabilities"] = cnn_result["cnn_probabilities"]

                analysis_engines.append("cnn-resnet50")
    except Exception:
        pass  # CNN not available, continue with pixel/NDVI results

    processing_time = round(time.time() - start, 3)
    result["processing_metadata"] = {
        "file_size_bytes": len(contents),
        "file_size_kb": round(len(contents) / 1024, 1),
        "processing_time_seconds": processing_time,
        "image_dimensions": result.get("image_dimensions", "unknown"),
        "file_type": "GeoTIFF" if is_tiff else "RGB Image",
        "model_version": settings.APP_VERSION,
        "analysis_engines": analysis_engines,
    }
    return result

