"""Redis-based JWT token blacklist for logout support."""

from __future__ import annotations

import logging

import redis

from app.core.config import settings

logger = logging.getLogger(__name__)

_redis_client: redis.Redis | None = None


def _get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_client


def blacklist_token(token: str, ttl_seconds: int = 1800) -> None:
    """Add a token to the blacklist. TTL should match or exceed the token's remaining lifetime."""
    try:
        _get_redis().setex(f"bl:{token}", ttl_seconds, "1")
    except Exception:  # noqa: BLE001
        logger.warning("Failed to blacklist token — Redis may be unavailable")


def is_token_blacklisted(token: str) -> bool:
    """Check if a token has been blacklisted."""
    try:
        return _get_redis().exists(f"bl:{token}") > 0
    except Exception:  # noqa: BLE001
        # If Redis is down, we fail open (allow the token).
        logger.warning("Token blacklist check failed — Redis may be unavailable")
        return False
