"""
Download EuroSAT dataset and organize for training.

Run: python download_eurosat.py
Result: data/EuroSAT/ folder with 10 class subdirectories
"""

import os
import shutil

print("Downloading EuroSAT dataset...")

try:
    from torchvision.datasets import EuroSAT

    # Download to 'data' folder
    dataset = EuroSAT(root="data", download=True)
    print(f"Downloaded {len(dataset)} images")
    print(f"Classes: {dataset.classes}")

    # Find where torchvision actually put the class folders
    # It typically downloads to: data/eurosat/2750/ or data/eurosat-rgb/
    eurosat_dir = None
    for root, dirs, files in os.walk("data"):
        # Look for the folder containing all 10 EuroSAT class folders
        if "Forest" in dirs and "River" in dirs and "Highway" in dirs:
            eurosat_dir = root
            print(f"Found dataset at: {eurosat_dir}")
            break

    if eurosat_dir is None:
        # Check if EuroSAT images live directly inside dataset._data_dir
        if hasattr(dataset, '_data_dir'):
            candidate = str(dataset._data_dir)
            if os.path.exists(candidate):
                for root, dirs, files in os.walk(candidate):
                    if "Forest" in dirs:
                        eurosat_dir = root
                        print(f"Found dataset at: {eurosat_dir}")
                        break

    target = os.path.join("data", "EuroSAT")

    if eurosat_dir and os.path.normpath(eurosat_dir) != os.path.normpath(target):
        if os.path.exists(target):
            shutil.rmtree(target)
        print(f"Copying {eurosat_dir} -> {target}")
        shutil.copytree(eurosat_dir, target)
        print("Dataset organized!")
    elif eurosat_dir:
        print("Dataset already at correct location.")
    else:
        print("WARNING: Could not find class folders automatically.")
        print("Checking standard torchvision locations...")

        # Try common torchvision paths
        candidates = [
            os.path.join("data", "eurosat", "2750"),
            os.path.join("data", "eurosat"),
            os.path.join("data", "EuroSAT", "2750"),
        ]
        for c in candidates:
            if os.path.exists(c) and os.path.isdir(c):
                subdirs = [d for d in os.listdir(c) if os.path.isdir(os.path.join(c, d))]
                if "Forest" in subdirs:
                    eurosat_dir = c
                    if os.path.normpath(c) != os.path.normpath(target):
                        shutil.copytree(c, target)
                    print(f"Found at {c}")
                    break

        if eurosat_dir is None:
            print("Auto-locate failed. Please manually move the class folders to data/EuroSAT/")

except Exception as e:
    print(f"Error: {e}")
    print()
    print("Manual download:")
    print("1. Go to: https://github.com/phelber/eurosat")
    print("2. Download the RGB dataset ZIP")
    print("3. Extract to: geo-vision-training/data/EuroSAT/")

# Verify
target = os.path.join("data", "EuroSAT")
if os.path.exists(target):
    classes = sorted([c for c in os.listdir(target) if os.path.isdir(os.path.join(target, c))])
    if classes:
        total = sum(len(os.listdir(os.path.join(target, c))) for c in classes)
        print(f"\n✅ Verified: {len(classes)} classes, {total} images")
        for c in classes:
            count = len(os.listdir(os.path.join(target, c)))
            print(f"  {c}: {count}")
    else:
        print("WARNING: data/EuroSAT exists but has no class subdirectories")
else:
    print(f"\n❌ {target} not found. See manual download instructions above.")
