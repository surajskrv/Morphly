from __future__ import annotations

import asyncio
import random
from collections.abc import Awaitable, Callable
from typing import TypeVar

T = TypeVar("T")

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
]


def random_user_agent() -> str:
    return random.choice(USER_AGENTS)


async def random_delay(min_seconds: float = 0.5, max_seconds: float = 1.8) -> None:
    await asyncio.sleep(random.uniform(min_seconds, max_seconds))


async def retry_async(
    operation: Callable[[], Awaitable[T]],
    retries: int = 3,
    base_delay: float = 1.0,
) -> T:
    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            return await operation()
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt == retries:
                raise
            await asyncio.sleep(base_delay * attempt + random.uniform(0, 0.5))

    raise RuntimeError("retry_async exhausted without returning") from last_error
