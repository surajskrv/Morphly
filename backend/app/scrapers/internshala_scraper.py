from __future__ import annotations

from urllib.parse import quote_plus

from playwright.async_api import async_playwright

from app.scrapers.common import random_delay, random_user_agent, retry_async


async def fetch_internshala_jobs(query: str, location: str, limit: int = 20) -> list[dict]:
    search_url = (
        "https://internshala.com/internships/"
        f"keywords-{quote_plus(query)}/"
    )

    async def _run() -> list[dict]:
        jobs: list[dict] = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent=random_user_agent())
            page = await context.new_page()

            await page.goto(search_url, timeout=60_000)
            await page.wait_for_timeout(2_000)

            cards = await page.query_selector_all(".individual_internship, .internship_meta")
            for card in cards[:limit]:
                title_el = await card.query_selector("a.job-title-href, .job-title-href")
                company_el = await card.query_selector(".company-name")
                location_el = await card.query_selector(".locations span, .location_link")

                title = (await title_el.inner_text()) if title_el else ""
                company = (await company_el.inner_text()) if company_el else ""
                job_location = (await location_el.inner_text()) if location_el else location
                detail_url = (await title_el.get_attribute("href")) if title_el else ""

                description = ""
                apply_url = ""
                if detail_url:
                    if detail_url.startswith("/"):
                        detail_url = f"https://internshala.com{detail_url}"
                    detail_page = await context.new_page()
                    await detail_page.goto(detail_url, timeout=60_000)
                    await detail_page.wait_for_timeout(1_200)
                    desc_el = await detail_page.query_selector(".text-container, .internship_details")
                    apply_el = await detail_page.query_selector("a#continue_button, a[href*='apply']")
                    if desc_el:
                        description = (await desc_el.inner_text()).strip()
                    apply_url = (await apply_el.get_attribute("href")) if apply_el else detail_url
                    await detail_page.close()

                if title.strip() and company.strip() and (apply_url or detail_url):
                    jobs.append(
                        {
                            "title": title.strip(),
                            "company": company.strip(),
                            "location": job_location.strip() if job_location else location,
                            "description": description,
                            "apply_url": apply_url or detail_url,
                            "source": "internshala",
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
