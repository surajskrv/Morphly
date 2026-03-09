from celery import shared_task
import asyncio
from app.core.database import init_db
from app.models.preference import Preference
from app.models.job import Job

async def async_fetch_jobs(user_id: str):
    await init_db()
    pref = await Preference.find_one(Preference.user_id == user_id)
    if not pref:
        print(f"No preferences found for user {user_id}")
        return
        
    # Mocking external API fetch
    print(f"Fetching jobs for {pref.desired_role} in {pref.location}...")
    
    # Delete only this user's previously-fetched mock jobs (not all jobs globally)
    await Job.find(Job.external_id.startswith(f"job-{user_id}-")).delete()
    
    # Store mocked job
    new_job = Job(
        external_id=f"job-{user_id}-1",
        title=f"Senior {pref.desired_role or 'Software Engineer'}",
        company="Tech Innovators LLC",
        location=pref.location or "Remote",
        description="A great place to work.",
        url="https://example.com/job/1",
        salary_min=120000,
        salary_max=160000,
        relevance_score=0.98
    )
    await new_job.insert()

@shared_task(name="fetch_jobs_task")
def fetch_jobs_task(user_id: str):
    asyncio.run(async_fetch_jobs(user_id))
    return f"Fetched jobs for user {user_id}"
