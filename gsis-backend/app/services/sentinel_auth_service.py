"""
Sentinel Hub Authentication Service — OAuth2 token management.

Handles:
- Client credentials OAuth2 flow
- Token caching with expiry
- Automatic refresh on expiration
"""

import time
import logging
from typing import Optional

import requests

from app.core.config import get_settings

logger = logging.getLogger("sentinel_auth")


class SentinelAuthService:
    """
    Manages OAuth2 access tokens for Sentinel Hub API.
    Tokens are cached and auto-refreshed 60s before expiry.
    """

    TOKEN_URL = "https://services.sentinel-hub.com/oauth/token"

    def __init__(self):
        self._token: Optional[str] = None
        self._expires_at: float = 0

    def is_configured(self) -> bool:
        """Check if Sentinel Hub credentials are configured."""
        settings = get_settings()
        return bool(settings.SENTINEL_CLIENT_ID and settings.SENTINEL_CLIENT_SECRET)

    def get_access_token(self) -> str:
        """
        Get a valid access token (cached or refreshed).
        Raises ValueError if credentials not configured.
        """
        if not self.is_configured():
            raise ValueError(
                "Sentinel Hub credentials not configured. "
                "Set SENTINEL_CLIENT_ID and SENTINEL_CLIENT_SECRET in .env"
            )

        # Return cached token if still valid (with 60s buffer)
        if self._token and time.time() < (self._expires_at - 60):
            return self._token

        return self._refresh_token()

    def _refresh_token(self) -> str:
        """Request a new OAuth2 token from Sentinel Hub."""
        settings = get_settings()

        logger.info("🔐 Requesting new Sentinel Hub access token...")

        try:
            response = requests.post(
                self.TOKEN_URL,
                data={
                    "grant_type": "client_credentials",
                    "client_id": settings.SENTINEL_CLIENT_ID,
                    "client_secret": settings.SENTINEL_CLIENT_SECRET,
                },
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()

            self._token = data["access_token"]
            # Token typically valid for 300s (5 min)
            expires_in = data.get("expires_in", 300)
            self._expires_at = time.time() + expires_in

            logger.info(f"✅ Token acquired (expires in {expires_in}s)")
            return self._token

        except requests.RequestException as e:
            logger.error(f"❌ Token request failed: {e}")
            raise ConnectionError(f"Failed to authenticate with Sentinel Hub: {e}")

    def invalidate(self):
        """Force token refresh on next request."""
        self._token = None
        self._expires_at = 0


# Singleton
sentinel_auth = SentinelAuthService()
