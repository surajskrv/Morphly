from __future__ import annotations

from urllib.parse import quote_plus

from playwright.async_api import async_playwright

from app.scrapers.common import random_delay, random_user_agent, retry_async


async def fetch_linkedin_jobs(query: str, location: str, limit: int = 20) -> list[dict]:
    search_url = (
        "https://www.linkedin.com/jobs/search/"
        f"?keywords={quote_plus(query)}&location={quote_plus(location)}"
    )

    async def _run() -> list[dict]:
        results: list[dict] = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent=random_user_agent())
            page = await context.new_page()

            await page.goto(search_url, timeout=60_000)
            await page.wait_for_timeout(2_000)

            cards = await page.query_selector_all(".base-card, .jobs-search__results-list li")
            for card in cards[:limit]:
                title_el = await card.query_selector("h3, .base-search-card__title")
                company_el = await card.query_selector("h4, .base-search-card__subtitle")
                location_el = await card.query_selector(".job-search-card__location, .job-search-card__location")
                link_el = await card.query_selector("a.base-card__full-link, a")

                title = (await title_el.inner_text()) if title_el else ""
                company = (await company_el.inner_text()) if company_el else ""
                job_location = (await location_el.inner_text()) if location_el else location
                apply_url = (await link_el.get_attribute("href")) if link_el else ""

                description = ""
                if apply_url:
                    detail_page = await context.new_page()
                    await detail_page.goto(apply_url, timeout=60_000)
                    await detail_page.wait_for_timeout(1_200)
                    desc_el = await detail_page.query_selector(
                        ".show-more-less-html__markup, .description__text, .jobs-description"
                    )
                    if desc_el:
                        description = (await desc_el.inner_text()).strip()
                    await detail_page.close()

                if title.strip() and company.strip() and apply_url:
                    results.append(
                        {
                            "title": title.strip(),
                            "company": company.strip(),
                            "location": job_location.strip() if job_location else location,
                            "description": description,
                            "apply_url": apply_url,
                            "source": "linkedin",
                            "posted_date": None,
                        }
                    )

                await random_delay()

            await browser.close()
        return results

    try:
        return await retry_async(_run, retries=2)
    except Exception:  # noqa: BLE001
        return []
