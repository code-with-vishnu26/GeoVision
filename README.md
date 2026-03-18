# 🌍 GeoVision — AI-Powered Earth Intelligence Platform

Real-time satellite-driven environmental risk monitoring using deep learning and Sentinel-2 multispectral imagery.

## ✨ Features

- **CNN Land-Use Classification** — ResNet-50 trained on EuroSAT (27,000 images, 10 classes, 92.5% accuracy)
- **NDVI / NDWI Analysis** — Vegetation health and water body detection from spectral bands
- **Automated Monitoring** — 24-hour cycle tracking 6 critical global regions
- **Real-Time Alerts** — Risk engine detects deforestation, flooding, heat islands, and pollution
- **Interactive Dashboard** — Live charts, regional monitoring table, and risk scores
- **Upload & Classify** — Drag-and-drop satellite image analysis (JPG, PNG, GeoTIFF)
- **Google OAuth** — Secure authentication via Supabase with JWT and RBAC

## 🌍 Real-World Problem Solving

GeoVision is designed with a suite of advanced features to provide tangible solutions to the environmental threats it monitors:
- **Action Center** — A dedicated module for real-world mitigation.
  - **Disaster Evacuation Planner** — Calculates safe zones and optimal evacuation routes for communities facing active disasters.
  - **Automated PDF Impact Reports** — Generates official, downloadable PDF reports of carbon offsets and mitigations for policymakers.
  - **Resource Allocation Dashboard** — An interactive dispatch interface to assign medical and aviation emergency resources to critical zones.
  - **ReliefWeb NGO Integration** — Fetches live disaster data from the United Nations OCHA API to cross-reference satellite alerts.
  - **Emergency Broadcast** — Simulates an early warning system that dispatches SMS/Email alerts to local authorities.
- **Predictive Forward-Modeling** — Utilizes historical time-series data to forecast 6-month environmental degradation trajectories (e.g., drought risk, temperature rise).
- **Community Ground-Truthing Portal** — A crowdsourced reporting interface allowing local volunteers to upload photographic evidence to validate or dismiss AI-generated satellite alerts.

## 🛰 Monitored Regions

| Region | Coordinates | Primary Risk |
|--------|------------|--------------|
| Amazon Basin | -3.47°, -62.22° | Deforestation |
| Congo Basin | 0.00°, 22.00° | Forest Loss |
| Ganges Delta | 22.00°, 90.00° | Flooding |
| Lake Chad | 13.00°, 14.50° | Water Scarcity |
| Borneo Rainforest | 1.00°, 114.00° | Deforestation |
| Great Barrier Reef | -18.00°, 147.00° | Marine Degradation |

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts |
| Backend | Python 3.12, FastAPI, Uvicorn |
| AI/ML | PyTorch, torchvision (ResNet-50), NumPy, Pillow |
| Database | Supabase (PostgreSQL), Row-Level Security |
| Auth | Google OAuth 2.0, JWT (HS256) |
| Satellite Data | Sentinel Hub API, Sentinel-2 L2A |
| Image Processing | rasterio, Pillow |
| Scheduler | APScheduler (24-hour cycle) |
| Deployment | Vercel (frontend), Render (backend) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ & npm
- Python 3.12+
- Supabase account
- Sentinel Hub API credentials (optional)

### Frontend

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

### Backend

```bash
cd gsis-backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file with:
# SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_KEY=your_service_key
# SUPABASE_JWT_SECRET=your_jwt_secret
# SENTINEL_CLIENT_ID=your_sentinel_id
# SENTINEL_CLIENT_SECRET=your_sentinel_secret

# Run server
python -m uvicorn app.main:app --reload
```

### CNN Training (optional)

```bash
cd geo-vision-training

# Download EuroSAT dataset
python download_eurosat.py

# Train model
python train.py

# Copy trained model to backend
copy landuse_model.pt ..\gsis-backend\models\
```

## 📁 Project Structure

```
gsis-main/
├── src/                          # React frontend
│   ├── pages/                    # Dashboard, Upload, Analytics, Auth
│   ├── components/               # UI components
│   ├── services/                 # API client, utilities
│   └── integrations/supabase/    # Supabase client & types
├── gsis-backend/                 # FastAPI backend
│   ├── app/
│   │   ├── routers/              # API endpoints
│   │   ├── services/             # CNN, NDVI, NDWI, Heat, Sentinel
│   │   ├── models/               # Data models
│   │   └── core/                 # Config, security, database
│   └── models/                   # Trained model weights (.pt)
├── geo-vision-training/          # CNN training scripts
│   ├── train.py                  # ResNet-50 transfer learning
│   └── download_eurosat.py       # Dataset downloader
├── supabase/                     # Database migrations
└── public/                       # Static assets
```

## 📊 Model Performance

| Metric | Value |
|--------|-------|
| Architecture | ResNet-50 (frozen backbone + custom head) |
| Dataset | EuroSAT (27,000 images, 10 classes) |
| Validation Accuracy | **92.5%** |
| Training Time | ~4 hours (CPU) |
| Model Size | ~94 MB |

## 🐛 Challenges & Solutions

*(This section highlights real-world technical problems encountered during development and how they were resolved).*

| Challenge / Error | Solution Implemented |
|-------------------|----------------------|
| **Sentinel Hub API Rate Limiting (HTTP 429)**<br>The 24-hour monitoring cycle rapidly exhausted free-tier API request quotas. | Implemented a robust fallback mechanism that caches the last known satellite data and seamlessly switches to a deterministic simulation mode when the API limit is reached. |
| **CNN Out-Of-Memory (OOM) on GeoTIFFs**<br>Loading massive multi-spectral satellite images for inference crashed the FastAPI backend due to RAM exhaustion. | Developed a sliding-window patch extractor using `rasterio` to slice large images into 224×224 tensors processing them sequentially rather than loading the full array into memory. |
| **Class Imbalance in Training Data**<br>The ResNet model struggled to differentiate minority classes (e.g., *Industrial* vs. *Residential*). | Applied Weighted Cross-Entropy Loss during PyTorch training to penalize misclassifications of minority classes more heavily, boosting overall accuracy. |
| **Supabase JWT Token Expiration**<br>Continuous dashboard polling requests failed abruptly when the auth token expired after 1 hour. | Implemented a silent token refresh interceptor in the React frontend leveraging the Supabase `onAuthStateChange` background listener. |

## 📝 License

This project is for academic/educational purposes.

## 🙏 Acknowledgments

- [EuroSAT Dataset](https://github.com/phelber/EuroSAT) — Helber et al.
- [Sentinel Hub](https://www.sentinel-hub.com/) — Satellite data API
- [Supabase](https://supabase.com/) — Backend-as-a-Service
- [PyTorch](https://pytorch.org/) — Deep learning framework
