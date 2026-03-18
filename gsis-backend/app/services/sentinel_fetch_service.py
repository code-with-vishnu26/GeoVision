"""
Sentinel Fetch Service — Satellite imagery retrieval.

Dual-mode:
  1. REAL MODE  — When SENTINEL_CLIENT_ID is configured, fetches actual
                  Sentinel-2 L2A imagery from Sentinel Hub Process API.
  2. SIM MODE  — Deterministic simulation for development/demo.

The service auto-detects which mode to use based on .env configuration.
"""

import os
import math
import time
import hashlib
import logging
import tempfile
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from app.core.config import get_settings

logger = logging.getLogger("sentinel_fetch")

# Try to import requests for real API calls
try:
    import requests as http_client
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class SentinelTile:
    """Represents a Sentinel-2 satellite tile (real or simulated)."""
    tile_id: str
    region_name: str
    acquisition_date: str
    cloud_cover: float
    bands_available: int = 13
    resolution_m: int = 10
    # Simulated values (used when no real TIFF)
    ndvi_simulated: Optional[float] = None
    ndwi_simulated: Optional[float] = None
    # Real TIFF path (set when real API used)
    tiff_path: Optional[str] = None
    mode: str = "simulated"


@dataclass
class MonitoredRegion:
    """A region being actively monitored."""
    name: str
    latitude: float
    longitude: float
    bbox: dict = field(default_factory=dict)
    last_ndvi: Optional[float] = None
    last_ndwi: Optional[float] = None


# ---------------------------------------------------------------------------
# Evalscript for Sentinel Hub — returns Red (B04) and NIR (B08) bands
# ---------------------------------------------------------------------------

EVALSCRIPT_NDVI_BANDS = """
//VERSION=3
function setup() {
    return {
        input: [{
            bands: ["B02", "B03", "B04", "B08"],
            units: "DN"
        }],
        output: {
            bands: 4,
            sampleType: "INT16"
        }
    };
}

function evaluatePixel(sample) {
    return [sample.B02, sample.B03, sample.B04, sample.B08];
}
"""


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class SentinelFetchService:
    """
    Satellite data retrieval service.
    Auto-selects real or simulation mode based on credentials.
    """

    PROCESS_URL = "https://services.sentinel-hub.com/api/v1/process"

    def __init__(self):
        self._processing_count = 0

    def is_real_mode(self) -> bool:
        """Check if real Sentinel Hub API is available."""
        if not HAS_REQUESTS:
            return False
        from app.services.sentinel_auth_service import sentinel_auth
        return sentinel_auth.is_configured()

    # -------------------------------------------------------------------
    # REAL MODE — Sentinel Hub Process API
    # -------------------------------------------------------------------

    def fetch_real_tile(self, region: MonitoredRegion) -> SentinelTile:
        """
        Fetch a real Sentinel-2 tile from Sentinel Hub API.
        Returns a SentinelTile with tiff_path set to the downloaded GeoTIFF.
        """
        from app.services.sentinel_auth_service import sentinel_auth

        token = sentinel_auth.get_access_token()
        bbox = region.bbox

        # Convert bbox dict to array [west, south, east, north]
        bbox_array = [
            bbox.get("west", region.longitude - 1),
            bbox.get("south", region.latitude - 1),
            bbox.get("east", region.longitude + 1),
            bbox.get("north", region.latitude + 1),
        ]

        payload = {
            "input": {
                "bounds": {
                    "bbox": bbox_array,
                    "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"},
                },
                "data": [{
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "maxCloudCoverage": 30,
                        "mosaickingOrder": "leastCC",
                    },
                }],
            },
            "output": {
                "width": 512,
                "height": 512,
                "responses": [{
                    "identifier": "default",
                    "format": {"type": "image/tiff"},
                }],
            },
            "evalscript": EVALSCRIPT_NDVI_BANDS,
        }

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "image/tiff",
        }

        logger.info(f"🛰 Fetching real Sentinel tile for {region.name} bbox={bbox_array}")

        try:
            response = http_client.post(
                self.PROCESS_URL,
                headers=headers,
                json=payload,
                timeout=60,
            )

            if response.status_code == 200:
                # Save to temp file
                tmp = tempfile.NamedTemporaryFile(
                    delete=False, suffix=".tif",
                    prefix=f"sentinel_{region.name.replace(' ', '_')}_",
                )
                tmp.write(response.content)
                tmp.close()

                logger.info(f"✅ Downloaded {len(response.content)} bytes → {tmp.name}")

                return SentinelTile(
                    tile_id=f"S2_REAL_{region.name.replace(' ', '_')}_{datetime.utcnow().strftime('%Y%m%d')}",
                    region_name=region.name,
                    acquisition_date=datetime.utcnow().isoformat(),
                    cloud_cover=0,
                    bands_available=4,
                    tiff_path=tmp.name,
                    mode="real",
                )
            else:
                logger.warning(
                    f"⚠ Sentinel Hub API returned {response.status_code}: "
                    f"{response.text[:200]}"
                )
                # Fall back to simulation
                return self._simulate_tile(region)

        except Exception as e:
            logger.error(f"❌ Real fetch failed for {region.name}: {e}")
            return self._simulate_tile(region)

    # -------------------------------------------------------------------
    # SIMULATION MODE — Deterministic
    # -------------------------------------------------------------------

    def _region_seed(self, region_name: str) -> float:
        h = hashlib.md5(region_name.encode()).hexdigest()
        return int(h[:8], 16) / 0xFFFFFFFF

    def _time_factor(self) -> float:
        hour = int(time.time() / 3600)
        return math.sin(hour * 0.1) * 0.05

    def _simulate_tile(self, region: MonitoredRegion) -> SentinelTile:
        """Generate a simulated tile with deterministic NDVI/NDWI."""
        seed = self._region_seed(region.name)
        time_var = self._time_factor()
        self._processing_count += 1

        lat_factor = max(0, 1.0 - abs(region.latitude) / 60)
        base_ndvi = 0.2 + (seed * 0.5) + (lat_factor * 0.2)
        drift = math.sin(self._processing_count * 0.3) * 0.03
        ndvi = round(min(max(base_ndvi + time_var + drift, -0.3), 0.95), 4)

        is_coastal = (
            abs(region.longitude) > 100
            or "reef" in region.name.lower()
            or "delta" in region.name.lower()
            or "lake" in region.name.lower()
            or "chad" in region.name.lower()
        )
        base_ndwi = 0.3 if is_coastal else -0.1
        ndwi = round(base_ndwi + (seed * 0.2) + time_var, 4)

        cloud_cover = round((seed * 30) + abs(time_var * 100), 1)

        return SentinelTile(
            tile_id=f"S2_SIM_{region.name.replace(' ', '_')}_{datetime.utcnow().strftime('%Y%m%d')}",
            region_name=region.name,
            acquisition_date=datetime.utcnow().isoformat(),
            cloud_cover=cloud_cover,
            ndvi_simulated=ndvi,
            ndwi_simulated=ndwi,
            mode="simulated",
        )

    # -------------------------------------------------------------------
    # Main entry point — auto-selects mode
    # -------------------------------------------------------------------

    def fetch_sentinel_tile(self, region: MonitoredRegion) -> SentinelTile:
        """
        Fetch tile for a region.
        Uses real API if credentials configured, otherwise simulates.
        """
        if self.is_real_mode():
            return self.fetch_real_tile(region)
        return self._simulate_tile(region)

    def get_monitored_regions(self) -> list[MonitoredRegion]:
        """Return the list of globally monitored regions."""
        return [
            MonitoredRegion("Amazon Basin", -3.4653, -62.2159, {"south": -15, "north": 5, "west": -73, "east": -50}),
            MonitoredRegion("Congo Basin", 0.0, 22.0, {"south": -5, "north": 5, "west": 15, "east": 30}),
            MonitoredRegion("Ganges Delta", 22.5, 90.0, {"south": 21, "north": 24, "west": 88, "east": 92}),
            MonitoredRegion("Lake Chad", 13.0, 14.5, {"south": 12, "north": 14, "west": 13, "east": 16}),
            MonitoredRegion("Borneo Rainforest", 1.0, 114.0, {"south": -4, "north": 7, "west": 108, "east": 119}),
            MonitoredRegion("Great Barrier Reef", -18.0, 147.0, {"south": -24, "north": -10, "west": 143, "east": 153}),
        ]


# Singleton
sentinel_service = SentinelFetchService()
