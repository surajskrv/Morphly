from __future__ import annotations

from urllib.parse import quote_plus

from playwright.async_api import async_playwright

from app.scrapers.common import random_delay, random_user_agent, retry_async


async def fetch_naukri_jobs(query: str, location: str, limit: int = 20) -> list[dict]:
    search_url = (
        "https://www.naukri.com/"
        f"{quote_plus(query)}-jobs-in-{quote_plus(location)}"
    )

    async def _run() -> list[dict]:
        jobs: list[dict] = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent=random_user_agent())
            page = await context.new_page()

            await page.goto(search_url, timeout=60_000)
            await page.wait_for_timeout(2_000)

            cards = await page.query_selector_all("article.jobTuple, .srp-jobtuple-wrapper")
            for card in cards[:limit]:
                title_el = await card.query_selector("a.title")
                company_el = await card.query_selector("a.comp-name, .comp-name")
                exp_el = await card.query_selector(".exp-wrap .exp, .experience")
                location_el = await card.query_selector(".loc-wrap span, .locWdth")

                title = (await title_el.inner_text()) if title_el else ""
                apply_url = (await title_el.get_attribute("href")) if title_el else ""
                company = (await company_el.inner_text()) if company_el else ""
                experience = (await exp_el.inner_text()) if exp_el else ""
                job_location = (await location_el.inner_text()) if location_el else location

                if title.strip() and company.strip() and apply_url:
                    jobs.append(
                        {
                            "title": title.strip(),
                            "company": company.strip(),
                            "location": job_location.strip() if job_location else location,
                            "description": f"Experience: {experience.strip()}" if experience else "",
                            "experience": experience.strip(),
                            "apply_url": apply_url,
                            "source": "naukri",
                            "posted_date": None,
                        }
                    )

                await random_delay()

            await browser.close()

        return jobs

    try:
        return await retry_async(_run, retries=2)
    except Exception:  # noqa: BLE001
        return []
