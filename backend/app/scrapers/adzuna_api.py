from __future__ import annotations

from urllib.parse import quote_plus

import httpx

from app.core.config import settings
from app.scrapers.common import random_user_agent, retry_async


async def fetch_adzuna_jobs(query: str, location: str, limit: int = 20) -> list[dict]:
    if not settings.ADZUNA_APP_ID or not settings.ADZUNA_API_KEY:
        return []

    async def _run() -> list[dict]:
        per_page = max(1, min(limit, 50))
        base_url = (
            "https://api.adzuna.com/v1/api/jobs/in/search/1"
            f"?app_id={quote_plus(settings.ADZUNA_APP_ID)}"
            f"&app_key={quote_plus(settings.ADZUNA_API_KEY)}"
            f"&results_per_page={per_page}"
            f"&what={quote_plus(query)}"
            f"&where={quote_plus(location)}"
            "&content-type=application/json"
        )

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(base_url, headers={"User-Agent": random_user_agent()})

        if response.status_code != 200:
            return []

        payload = response.json()
        records = payload.get("results", []) if isinstance(payload, dict) else []

        jobs: list[dict] = []
        for item in records[:limit]:
            jobs.append(
                {
                    "title": (item.get("title") or "").strip(),
                    "company": (item.get("company", {}).get("display_name") or "").strip(),
                    "location": (item.get("location", {}).get("display_name") or location).strip(),
                    "description": (item.get("description") or "").strip(),
                    "apply_url": item.get("redirect_url") or "",
                    "source": "adzuna",
                    "posted_date": item.get("created"),
                    "salary_min": item.get("salary_min"),
                    "salary_max": item.get("salary_max"),
                }
            )

        return [job for job in jobs if job["title"] and job["company"] and job["apply_url"]]

    try:
        return await retry_async(_run, retries=3)
    except Exception:  # noqa: BLE001
        return []
