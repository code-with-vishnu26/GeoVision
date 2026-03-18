"""
CNN Service — Deep learning land-use classification.

Provides CNN-based image classification using ResNet50 transfer learning.
Falls back to pixel-based analysis when PyTorch is not available.

Pipeline:
  Image → Preprocess (224x224, normalize) → ResNet50 → Softmax → Class + Confidence
"""

import io
import logging
from typing import Optional

from PIL import Image

from app.models.cnn_model import CLASSES, HAS_TORCH

if HAS_TORCH:
    import torch
    import torch.nn.functional as F
    from torchvision import transforms

logger = logging.getLogger("cnn_service")

# ---------------------------------------------------------------------------
# Image preprocessing (ImageNet normalization)
# ---------------------------------------------------------------------------

if HAS_TORCH:
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ])

# ---------------------------------------------------------------------------
# Model singleton
# ---------------------------------------------------------------------------

_model = None
_model_loaded = False


def _get_model():
    """Lazy-load the CNN model."""
    global _model, _model_loaded
    if _model_loaded:
        return _model
    _model_loaded = True

    from app.models.cnn_model import get_model
    _model = get_model()
    if _model:
        logger.info(f"CNN model ready — {len(CLASSES)} classes: {CLASSES}")
    else:
        logger.warning("CNN model not available — using pixel-based fallback")
    return _model


def is_cnn_available() -> bool:
    """Check if CNN inference is available."""
    return HAS_TORCH and _get_model() is not None


def predict_landuse(image: Image.Image) -> Optional[dict]:
    """
    Run CNN inference on an image.

    Returns:
        {
            "cnn_class": "Forest",
            "cnn_confidence": 0.87,
            "cnn_probabilities": [{"name": "Forest", "value": 87.2}, ...],
            "model_type": "resnet50",
            "device": "cuda" / "cpu"
        }
    Or None if CNN is not available.
    """
    model = _get_model()
    if model is None:
        return None

    try:
        # Preprocess
        image = image.convert("RGB")
        input_tensor = preprocess(image).unsqueeze(0)

        # Move to same device as model
        device = next(model.parameters()).device
        input_tensor = input_tensor.to(device)

        # Inference
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = F.softmax(outputs, dim=1)[0]

        # Extract results
        confidence, predicted_idx = torch.max(probabilities, 0)
        predicted_class = CLASSES[predicted_idx.item()]

        # Build probability list
        prob_list = sorted(
            [{"name": CLASSES[i], "value": round(probabilities[i].item() * 100, 1)}
             for i in range(len(CLASSES))],
            key=lambda x: -x["value"],
        )

        return {
            "cnn_class": predicted_class,
            "cnn_confidence": round(confidence.item(), 4),
            "cnn_probabilities": prob_list,
            "model_type": "resnet50",
            "device": str(device),
        }

    except Exception as e:
        logger.error(f"CNN inference failed: {e}")
        return None


def predict_from_bytes(image_bytes: bytes) -> Optional[dict]:
    """Run CNN inference from raw image bytes."""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        return predict_landuse(image)
    except Exception as e:
        logger.error(f"Failed to open image for CNN: {e}")
        return None
