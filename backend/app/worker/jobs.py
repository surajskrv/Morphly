from celery import shared_task
import asyncio
from app.core.database import init_db
from app.models.preference import Preference
from app.models.job import Job
from app.services.job_collector import JobCollector
from app.services.job_matcher import JobMatcher

async def async_fetch_jobs(user_id: str):
    await init_db()
    pref = await Preference.find_one(Preference.user_id == user_id)
    if not pref:
        print(f"No preferences found for user {user_id}")
        return

    query = pref.desired_role or "software engineer"
    location = pref.location or "Remote"
    print(f"Fetching jobs for {query} in {location}...")

    collector = JobCollector()
    matcher = JobMatcher(pref)

    jobs = await collector.collect_and_store_jobs(query=query, location=location)

    # Update match score for the requesting user context.
    for job in jobs:
        job.match_score = matcher.score_job(job)
        job.relevance_score = job.match_score
        await job.save()

@shared_task(name="fetch_jobs_task")
def fetch_jobs_task(user_id: str):
    asyncio.run(async_fetch_jobs(user_id))
    return f"Fetched jobs for user {user_id}"
