from __future__ import annotations

import asyncio
import hashlib
from datetime import datetime, timezone
from typing import Any

from app.models.job import Job
from app.scrapers.adzuna_api import fetch_adzuna_jobs
from app.scrapers.hirist_scraper import fetch_hirist_jobs
from app.scrapers.internshala_scraper import fetch_internshala_jobs
from app.scrapers.linkedin_scraper import fetch_linkedin_jobs
from app.scrapers.naukri_scraper import fetch_naukri_jobs
from app.scrapers.wellfound_scraper import fetch_wellfound_jobs


def _parse_posted_at(raw_value: Any) -> datetime | None:
    if raw_value is None:
        return None
    if isinstance(raw_value, datetime):
        return raw_value if raw_value.tzinfo else raw_value.replace(tzinfo=timezone.utc)
    if isinstance(raw_value, str):
        cleaned = raw_value.strip()
        if not cleaned:
            return None
        try:
            return datetime.fromisoformat(cleaned.replace("Z", "+00:00"))
        except ValueError:
            return None
    return None


def _normalize_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _fingerprint(title: str, company: str, location: str) -> str:
    base = f"{title.lower()}::{company.lower()}::{location.lower()}"
    return hashlib.sha256(base.encode("utf-8")).hexdigest()


class JobCollector:
    def __init__(self) -> None:
        self.scrapers = {
            "linkedin": fetch_linkedin_jobs,
            "naukri": fetch_naukri_jobs,
            "internshala": fetch_internshala_jobs,
            "wellfound": fetch_wellfound_jobs,
            "hirist": fetch_hirist_jobs,
            "adzuna": fetch_adzuna_jobs,
        }

    async def _fetch_source(
        self,
        source: str,
        query: str,
        location: str,
        limit: int,
    ) -> list[dict]:
        scraper = self.scrapers[source]
        try:
            return await scraper(query=query, location=location, limit=limit)
        except Exception:  # noqa: BLE001
            return []

    def normalize_jobs(self, jobs: list[dict]) -> list[dict]:
        normalized: list[dict] = []
        seen: set[str] = set()

        for item in jobs:
            title = _normalize_text(item.get("title"))
            company = _normalize_text(item.get("company"))
            location = _normalize_text(item.get("location")) or "Remote"
            description = _normalize_text(item.get("description"))
            apply_url = _normalize_text(item.get("apply_url"))
            source = _normalize_text(item.get("source")) or "unknown"
            posted_at = _parse_posted_at(item.get("posted_date"))

            if not (title and company and apply_url):
                continue

            fingerprint = _fingerprint(title=title, company=company, location=location)
            if fingerprint in seen:
                continue

            seen.add(fingerprint)
            raw_skills = item.get("skills")
            if isinstance(raw_skills, str):
                skills = [part.strip() for part in raw_skills.split(",") if part.strip()]
            elif isinstance(raw_skills, list):
                skills = [str(part).strip() for part in raw_skills if str(part).strip()]
            else:
                skills = []
            normalized.append(
                {
                    "title": title,
                    "company": company,
                    "location": location,
                    "description": description,
                    "apply_url": apply_url,
                    "source": source,
                    "posted_at": posted_at,
                    "salary_min": item.get("salary_min"),
                    "salary_max": item.get("salary_max"),
                    "experience_level": _normalize_text(item.get("experience")) or None,
                    "skills": skills,
                    "fingerprint": fingerprint,
                    "external_id": item.get("external_id") or fingerprint,
                    "url": apply_url,
                }
            )

        return normalized

    async def collect_jobs(
        self,
        query: str,
        location: str,
        limit_per_source: int = 20,
        sources: list[str] | None = None,
    ) -> list[dict]:
        chosen_sources = sources or list(self.scrapers.keys())

        tasks = [
            self._fetch_source(
                source=source,
                query=query,
                location=location,
                limit=limit_per_source,
            )
            for source in chosen_sources
            if source in self.scrapers
        ]
        source_results = await asyncio.gather(*tasks)

        combined = [job for result in source_results for job in result]

        # Adzuna backup when non-Adzuna sources return nothing.
        if not combined and "adzuna" in self.scrapers and (not sources or "adzuna" in chosen_sources):
            combined.extend(await self._fetch_source("adzuna", query, location, limit_per_source))

        return self.normalize_jobs(combined)

    async def store_jobs(self, jobs: list[dict]) -> list[Job]:
        stored: list[Job] = []
        for payload in jobs:
            existing = await Job.find_one(Job.fingerprint == payload["fingerprint"])
            if existing:
                for key, value in payload.items():
                    setattr(existing, key, value)
                await existing.save()
                stored.append(existing)
                continue

            job = Job(**payload)
            await job.insert()
            stored.append(job)

        return stored

    async def collect_and_store_jobs(
        self,
        query: str,
        location: str,
        limit_per_source: int = 20,
        sources: list[str] | None = None,
    ) -> list[Job]:
        jobs = await self.collect_jobs(
            query=query,
            location=location,
            limit_per_source=limit_per_source,
            sources=sources,
        )
        return await self.store_jobs(jobs)
