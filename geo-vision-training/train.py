"""
GeoVision CNN Training — EuroSAT Dataset
Transfer Learning with ResNet50

Train:   python train.py
Result:  landuse_model.pt (10-class land-use classifier)

Classes: AnnualCrop, Forest, HerbaceousVegetation, Highway,
         Industrial, Pasture, PermanentCrop, Residential, River, SeaLake
"""

import os
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
DATA_DIR = "data/EuroSAT"
MODEL_PATH = "landuse_model.pt"
BATCH_SIZE = 32
EPOCHS = 10
LEARNING_RATE = 0.001
IMG_SIZE = 224
TRAIN_SPLIT = 0.8

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Device: {device}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")

# ---------------------------------------------------------------------------
# Data
# ---------------------------------------------------------------------------
print(f"\nLoading dataset from {DATA_DIR}...")

train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

val_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Load full dataset to get class names
full_dataset = datasets.ImageFolder(DATA_DIR, transform=train_transform)
classes = full_dataset.classes
num_classes = len(classes)
print(f"Classes ({num_classes}): {classes}")
print(f"Total images: {len(full_dataset)}")

# Split
train_size = int(TRAIN_SPLIT * len(full_dataset))
val_size = len(full_dataset) - train_size
train_dataset, val_dataset = torch.utils.data.random_split(full_dataset, [train_size, val_size])

# Apply different transforms for validation
val_dataset.dataset = datasets.ImageFolder(DATA_DIR, transform=val_transform)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2, pin_memory=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)

print(f"Train: {train_size} | Val: {val_size}")

# ---------------------------------------------------------------------------
# Model
# ---------------------------------------------------------------------------
print("\nBuilding ResNet50 model...")
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

# Freeze backbone
for param in model.parameters():
    param.requires_grad = False

# Replace classifier
model.fc = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(model.fc.in_features, 512),
    nn.ReLU(),
    nn.Dropout(0.2),
    nn.Linear(512, num_classes),
)

model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.fc.parameters(), lr=LEARNING_RATE)
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.5)

# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------
print(f"\nTraining for {EPOCHS} epochs...")
best_acc = 0.0
start_time = time.time()

for epoch in range(EPOCHS):
    # Train
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for batch_idx, (images, labels) in enumerate(train_loader):
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

        if (batch_idx + 1) % 50 == 0:
            print(f"  Batch {batch_idx+1}/{len(train_loader)} | Loss: {loss.item():.4f}")

    train_acc = 100 * correct / total
    train_loss = running_loss / len(train_loader)

    # Validate
    model.eval()
    val_correct = 0
    val_total = 0

    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            val_total += labels.size(0)
            val_correct += (predicted == labels).sum().item()

    val_acc = 100 * val_correct / val_total

    elapsed = time.time() - start_time
    print(f"Epoch [{epoch+1}/{EPOCHS}] | Loss: {train_loss:.4f} | Train Acc: {train_acc:.1f}% | Val Acc: {val_acc:.1f}% | Time: {elapsed:.0f}s")

    # Save best model
    if val_acc > best_acc:
        best_acc = val_acc
        torch.save(model.state_dict(), MODEL_PATH)
        print(f"  -> Best model saved ({val_acc:.1f}%)")

    scheduler.step()

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
total_time = time.time() - start_time
print(f"\n{'='*50}")
print(f"Training complete!")
print(f"Best validation accuracy: {best_acc:.1f}%")
print(f"Total time: {total_time:.0f}s ({total_time/60:.1f} min)")
print(f"Model saved: {MODEL_PATH}")
print(f"Classes: {classes}")
print(f"\nTo integrate: copy {MODEL_PATH} to gsis-backend/models/")
