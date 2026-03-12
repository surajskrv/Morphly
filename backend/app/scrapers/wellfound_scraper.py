from __future__ import annotations

from urllib.parse import quote_plus

import httpx
from playwright.async_api import async_playwright

from app.scrapers.common import random_delay, random_user_agent, retry_async


async def _fetch_from_api(query: str, location: str, limit: int) -> list[dict]:
    # Wellfound does not provide a consistently documented public jobs API.
    # This call is best-effort and gracefully falls back to scraping.
    url = (
        "https://wellfound.com/jobs/search"
        f"?q={quote_plus(query)}&location={quote_plus(location)}&format=json"
    )
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(url, headers={"User-Agent": random_user_agent()})
        if response.status_code != 200:
            return []

        data = response.json()
        if not isinstance(data, dict):
            return []

        records = data.get("jobs") or []
        results: list[dict] = []
        for item in records[:limit]:
            title = (item.get("title") or "").strip()
            company = (item.get("company") or "").strip()
            apply_url = item.get("url") or item.get("apply_url") or ""
            if title and company and apply_url:
                results.append(
                    {
                        "title": title,
                        "company": company,
                        "location": (item.get("location") or location).strip(),
                        "description": (item.get("description") or "").strip(),
                        "apply_url": apply_url,
                        "source": "wellfound",
                        "posted_date": item.get("posted_at"),
                    }
                )

        return results


async def _fetch_with_playwright(query: str, location: str, limit: int) -> list[dict]:
    url = (
        "https://wellfound.com/jobs"
        f"?q={quote_plus(query)}&location={quote_plus(location)}"
    )

    jobs: list[dict] = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent=random_user_agent())
        page = await context.new_page()

        await page.goto(url, timeout=60_000)
        await page.wait_for_timeout(2_000)

        cards = await page.query_selector_all("[data-test='StartupResult'], .styles_component")
        for card in cards[:limit]:
            title_el = await card.query_selector("a[href*='/jobs/'], .styles_title")
            company_el = await card.query_selector("[data-test='StartupResult_companyName'], .styles_companyName")
            location_el = await card.query_selector("[data-test='StartupResult_location'], .styles_location")

            title = (await title_el.inner_text()) if title_el else ""
            company = (await company_el.inner_text()) if company_el else ""
            job_location = (await location_el.inner_text()) if location_el else location
            apply_url = (await title_el.get_attribute("href")) if title_el else ""

            if apply_url and apply_url.startswith("/"):
                apply_url = f"https://wellfound.com{apply_url}"

            if title.strip() and company.strip() and apply_url:
                jobs.append(
                    {
                        "title": title.strip(),
                        "company": company.strip(),
                        "location": job_location.strip() if job_location else location,
                        "description": "",
                        "apply_url": apply_url,
                        "source": "wellfound",
                        "posted_date": None,
                    }
                )

            await random_delay()

        await browser.close()

    return jobs


async def fetch_wellfound_jobs(query: str, location: str, limit: int = 20) -> list[dict]:
    try:
        api_jobs = await retry_async(lambda: _fetch_from_api(query, location, limit), retries=2)
        if api_jobs:
            return api_jobs
    except Exception:  # noqa: BLE001
        pass

    try:
        return await retry_async(lambda: _fetch_with_playwright(query, location, limit), retries=2)
    except Exception:  # noqa: BLE001
        return []
