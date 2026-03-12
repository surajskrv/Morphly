from __future__ import annotations

from urllib.parse import quote_plus

import httpx
from bs4 import BeautifulSoup

from app.scrapers.common import random_user_agent, retry_async


async def fetch_hirist_jobs(query: str, location: str, limit: int = 20) -> list[dict]:
    search_url = (
        "https://www.hirist.tech/search"
        f"?q={quote_plus(query)}&loc={quote_plus(location)}"
    )

    async def _run() -> list[dict]:
        async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
            response = await client.get(
                search_url,
                headers={"User-Agent": random_user_agent()},
            )

        if response.status_code != 200:
            return []

        soup = BeautifulSoup(response.text, "html.parser")
        cards = soup.select(".job-card, .jobCard, article")

        jobs: list[dict] = []
        for card in cards[:limit]:
            title_node = card.select_one("h2 a, .job-title a, a[title]")
            company_node = card.select_one(".company, .company-name, .job-company")
            location_node = card.select_one(".location, .job-location")
            desc_node = card.select_one(".description, .job-desc")

            title = title_node.get_text(strip=True) if title_node else ""
            company = company_node.get_text(strip=True) if company_node else ""
            job_location = location_node.get_text(strip=True) if location_node else location
            description = desc_node.get_text(" ", strip=True) if desc_node else ""
            apply_url = title_node.get("href", "") if title_node else ""

            if apply_url.startswith("/"):
                apply_url = f"https://www.hirist.tech{apply_url}"

            if title and company and apply_url:
                jobs.append(
                    {
                        "title": title,
                        "company": company,
                        "location": job_location,
                        "description": description,
                        "apply_url": apply_url,
                        "source": "hirist",
                        "posted_date": None,
                    }
                )

        return jobs

    try:
        return await retry_async(_run, retries=3)
    except Exception:  # noqa: BLE001
        return []
