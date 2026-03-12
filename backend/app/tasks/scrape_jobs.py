from __future__ import annotations

import asyncio

from celery import shared_task

from app.core.database import init_db
from app.services.job_collector import JobCollector


async def _collect_for_sources(
    sources: list[str],
    query: str = "software engineer",
    location: str = "India",
    limit_per_source: int = 20,
) -> int:
    await init_db()
    collector = JobCollector()
    jobs = await collector.collect_and_store_jobs(
        query=query,
        location=location,
        limit_per_source=limit_per_source,
        sources=sources,
    )
    return len(jobs)


@shared_task(name="fetch_linkedin_jobs")
def fetch_linkedin_jobs(query: str = "software engineer", location: str = "India") -> str:
    count = asyncio.run(_collect_for_sources(["linkedin"], query=query, location=location))
    return f"Fetched {count} LinkedIn jobs"


@shared_task(name="fetch_naukri_jobs")
def fetch_naukri_jobs(query: str = "software engineer", location: str = "India") -> str:
    count = asyncio.run(_collect_for_sources(["naukri"], query=query, location=location))
    return f"Fetched {count} Naukri jobs"


@shared_task(name="fetch_internshala_jobs")
def fetch_internshala_jobs(query: str = "software engineer", location: str = "India") -> str:
    count = asyncio.run(_collect_for_sources(["internshala"], query=query, location=location))
    return f"Fetched {count} Internshala jobs"


@shared_task(name="fetch_wellfound_jobs")
def fetch_wellfound_jobs(query: str = "software engineer", location: str = "India") -> str:
    count = asyncio.run(_collect_for_sources(["wellfound"], query=query, location=location))
    return f"Fetched {count} Wellfound jobs"


@shared_task(name="fetch_hirist_jobs")
def fetch_hirist_jobs(query: str = "software engineer", location: str = "India") -> str:
    count = asyncio.run(_collect_for_sources(["hirist"], query=query, location=location))
    return f"Fetched {count} Hirist jobs"


@shared_task(name="fetch_adzuna_jobs")
def fetch_adzuna_jobs(query: str = "software engineer", location: str = "India") -> str:
    count = asyncio.run(_collect_for_sources(["adzuna"], query=query, location=location))
    return f"Fetched {count} Adzuna jobs"
