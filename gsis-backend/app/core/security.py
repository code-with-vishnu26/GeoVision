"""
Security — JWT Verification + Role-Based Access Control.

Verifies Supabase JWT tokens and enforces role-based access.
In development mode (no JWT_SECRET), falls back to a dev user.
"""

import logging
from typing import Optional

from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.core.config import get_settings

logger = logging.getLogger("security")

# HTTPBearer extracts "Authorization: Bearer <token>" automatically
# auto_error=False allows unauthenticated access to public endpoints
security = HTTPBearer(auto_error=False)


class CurrentUser:
    """Authenticated user extracted from JWT."""
    def __init__(self, user_id: str, email: str, role: str):
        self.user_id = user_id
        self.email = email
        self.role = role

    def __repr__(self):
        return f"<User {self.email} role={self.role}>"


async def verify_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[dict]:
    """
    Verify Supabase JWT and return the decoded payload.
    Returns None if no token provided (public access).
    Raises 401 if token is invalid/expired.
    """
    if credentials is None:
        return None

    settings = get_settings()
    token = credentials.credentials

    if not settings.SUPABASE_JWT_SECRET:
        # Dev mode: no JWT secret configured, skip verification
        logger.debug("JWT verification skipped — SUPABASE_JWT_SECRET not set")
        return {"sub": "dev-user", "email": "dev@geovision.ai", "role": "admin"}

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload

    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user(
    payload: Optional[dict] = Depends(verify_token),
) -> Optional[CurrentUser]:
    """
    Extract CurrentUser from verified JWT payload.
    Returns None for unauthenticated requests.
    """
    if payload is None:
        return None

    return CurrentUser(
        user_id=payload.get("sub", "unknown"),
        email=payload.get("email", ""),
        role=payload.get("role", payload.get("user_role", "viewer")),
    )


def require_role(*allowed_roles: str):
    """
    Dependency that enforces role-based access.

    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(user: CurrentUser = Depends(require_role("admin"))):
            ...
    """
    async def role_checker(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    ) -> CurrentUser:
        settings = get_settings()

        # Dev mode fallback
        if credentials is None and not settings.SUPABASE_JWT_SECRET:
            return CurrentUser(user_id="dev", email="dev@geovision.ai", role="admin")

        if credentials is None:
            raise HTTPException(status_code=401, detail="Authentication required")

        payload = await verify_token(credentials)
        if payload is None:
            raise HTTPException(status_code=401, detail="Authentication required")

        user = CurrentUser(
            user_id=payload.get("sub", "unknown"),
            email=payload.get("email", ""),
            role=payload.get("role", payload.get("user_role", "viewer")),
        )

        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Forbidden — role '{user.role}' not in {list(allowed_roles)}",
            )

        return user

    return role_checker
