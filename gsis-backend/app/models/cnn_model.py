"""
CNN Model — ResNet50 transfer learning for land-use classification.

EuroSAT 10 Classes:
  AnnualCrop, Forest, HerbaceousVegetation, Highway, Industrial,
  Pasture, PermanentCrop, Residential, River, SeaLake

Supports:
- GPU inference (CUDA) when available
- CPU fallback
- Custom trained weights loading (landuse_model.pt)
"""

import os
import logging
from typing import Optional

logger = logging.getLogger("cnn_model")

try:
    import torch
    import torch.nn as nn
    from torchvision import models
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


# EuroSAT 10-class land-use categories
CLASSES = [
    "AnnualCrop",
    "Forest",
    "HerbaceousVegetation",
    "Highway",
    "Industrial",
    "Pasture",
    "PermanentCrop",
    "Residential",
    "River",
    "SeaLake",
]
NUM_CLASSES = len(CLASSES)


def get_device() -> "torch.device":
    """Select best available device (CUDA > CPU)."""
    if not HAS_TORCH:
        return None
    if torch.cuda.is_available():
        device = torch.device("cuda")
        logger.info(f"Using GPU: {torch.cuda.get_device_name(0)}")
    else:
        device = torch.device("cpu")
        logger.info("Using CPU for inference")
    return device


def build_model(pretrained: bool = True) -> Optional["nn.Module"]:
    """
    Build ResNet50 with custom classifier for 10-class EuroSAT classification.
    """
    if not HAS_TORCH:
        return None

    weights = models.ResNet50_Weights.IMAGENET1K_V2 if pretrained else None
    model = models.resnet50(weights=weights)

    # Freeze backbone
    for param in model.parameters():
        param.requires_grad = False

    # Custom classifier head (must match training script)
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(num_features, 512),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(512, NUM_CLASSES),
    )

    return model


def load_trained_model(model_path: str) -> Optional["nn.Module"]:
    """Load a custom trained model from disk."""
    if not HAS_TORCH:
        return None

    device = get_device()
    model = build_model(pretrained=False)

    try:
        state_dict = torch.load(model_path, map_location=device, weights_only=True)
        model.load_state_dict(state_dict)
        model.to(device)
        model.eval()
        logger.info(f"Loaded trained EuroSAT model from {model_path}")
        return model
    except Exception as e:
        logger.warning(f"Could not load trained model: {e}. Using pretrained backbone.")
        return None


def get_model() -> Optional["nn.Module"]:
    """
    Get the CNN model for inference.
    Priority:
      1. Custom trained weights (models/landuse_model.pt)
      2. Pretrained ResNet50 backbone (ImageNet features — untrained head)
    """
    if not HAS_TORCH:
        return None

    # Check for custom trained weights
    model_dir = os.path.join(os.path.dirname(__file__), "..", "..", "models")
    custom_path = os.path.join(model_dir, "landuse_model.pt")

    if os.path.exists(custom_path):
        model = load_trained_model(custom_path)
        if model:
            return model

    # Fall back to pretrained backbone (won't give meaningful classifications
    # until trained on EuroSAT, but allows the pipeline to run)
    device = get_device()
    model = build_model(pretrained=True)
    if model:
        model.to(device)
        model.eval()
        logger.info("Using pretrained ResNet50 backbone (no EuroSAT weights — run training)")
    return model
