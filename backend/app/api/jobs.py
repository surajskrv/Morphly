from fastapi import APIRouter, Depends
from typing import List
from app.schemas.job import JobResponse
from app.models.job import Job
from app.models.user import User
from app.models.preference import Preference
from app.api.deps import get_current_user
from app.worker.jobs import fetch_jobs_task
from app.services.job_matcher import JobMatcher

router = APIRouter()

@router.get("/", response_model=List[JobResponse])
async def get_jobs(
    skip: int = 0, limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    # Beanie query format
    jobs = await Job.find().sort(-Job.created_at).skip(skip).limit(limit).to_list()
    
    results = []
    for job in jobs:
        res = job.model_dump()
        res["id"] = str(job.id)
        results.append(res)
        
    return results

@router.get("/recommended", response_model=List[JobResponse])
async def get_recommended_jobs(
    skip: int = 0, limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    pref = await Preference.find_one(Preference.user_id == str(current_user.id))
    matcher = JobMatcher(pref)

    jobs = await Job.find().skip(skip).limit(limit).to_list()
    scored: list[Job] = []
    for job in jobs:
        job.match_score = matcher.score_job(job)
        job.relevance_score = job.match_score
        scored.append(job)

    scored.sort(key=lambda item: item.match_score or 0.0, reverse=True)

    results = []
    for job in scored:
        res = job.model_dump()
        res["id"] = str(job.id)
        results.append(res)
    return results

@router.post("/fetch")
async def trigger_job_fetch(
    current_user: User = Depends(get_current_user)
):
    # This triggers a Celery task to fetch jobs for the user based on preferences
    fetch_jobs_task.delay(str(current_user.id))
    return {"status": "Job fetch task triggered successfully"}
