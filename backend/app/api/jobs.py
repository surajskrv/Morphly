import logging
import time
from typing import List

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Response
from kombu.exceptions import OperationalError

from app.api.deps import get_current_user
from app.models.job import Job
from app.models.user import User
from app.schemas.job import JobFetchStatusResponse, JobResponse
from app.schemas.pagination import PaginatedResponse
from app.services.job_matcher import JobMatcher
from app.services.profile_service import (
    get_or_create_profile,
    mark_fetch_failed,
    mark_fetch_requested,
)
from app.worker.celery_app import celery_app

router = APIRouter()
logger = logging.getLogger(__name__)

class TTLCache:
    def __init__(self, ttl: int = 300):
        self.ttl = ttl
        self.cache: dict[str, tuple[float, any]] = {}

    def get(self, key: str) -> any:
        if key in self.cache:
            timestamp, value = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return value
            else:
                del self.cache[key]
        return None

    def set(self, key: str, value: any) -> None:
        if len(self.cache) > 1000:
            self.cache.clear()
        self.cache[key] = (time.time(), value)

RECOMMENDATION_CACHE = TTLCache(ttl=300)


async def _get_job(job_id: str) -> Job | None:
    try:
        return await Job.get(PydanticObjectId(job_id))
    except Exception:  # noqa: BLE001
        return None


def _serialize_job(job: Job, matcher: JobMatcher | None = None) -> dict:
    res = job.model_dump()
    res["id"] = str(job.id)
    if matcher:
        res["match_score"] = matcher.score_job(job)
        res["relevance_score"] = res["match_score"]
        res["match_reasons"] = matcher.explain_job(job)
    else:
        res["match_reasons"] = []
    return res

@router.get("/")
async def get_jobs(
    skip: int = 0, limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    profile = await get_or_create_profile(str(current_user.id))
    matcher = JobMatcher(profile)
    total = await Job.count()
    jobs = await Job.find().sort(-Job.created_at).skip(skip).limit(limit).to_list()
    return PaginatedResponse(
        items=[_serialize_job(job, matcher) for job in jobs],
        total=total,
        skip=skip,
        limit=limit,
        has_more=(skip + limit) < total,
    )

@router.get("/recommended")
async def get_recommended_jobs(
    skip: int = 0, limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    profile = await get_or_create_profile(str(current_user.id))
    
    # Cache key includes user ID, profile update time, pagination, and jobs count approximation
    # to invalidate when new jobs arrive or profile changes.
    total = await Job.count()
    cache_key = f"{current_user.id}_{profile.updated_at.timestamp()}_{skip}_{limit}_{total}"

    cached_response = RECOMMENDATION_CACHE.get(cache_key)
    if cached_response:
        return cached_response

    matcher = JobMatcher(profile)

    jobs = await Job.find().skip(skip).limit(limit).to_list()
    scored: list[Job] = []
    for job in jobs:
        job.match_score = matcher.score_job(job)
        job.relevance_score = job.match_score
        scored.append(job)

    scored.sort(
        key=lambda item: (
            item.match_score or 0.0,
            item.posted_at.timestamp() if item.posted_at else 0.0,
            item.created_at.timestamp(),
        ),
        reverse=True,
    )

    response = PaginatedResponse(
        items=[_serialize_job(job, matcher) for job in scored],
        total=total,
        skip=skip,
        limit=limit,
        has_more=(skip + limit) < total,
    )
    
    RECOMMENDATION_CACHE.set(cache_key, response)
    return response


@router.get("/fetch-status", response_model=JobFetchStatusResponse)
async def get_job_fetch_status(current_user: User = Depends(get_current_user)):
    profile = await get_or_create_profile(str(current_user.id))
    return JobFetchStatusResponse(**profile.fetch_status.model_dump())


@router.post("/fetch")
async def trigger_job_fetch(
    current_user: User = Depends(get_current_user)
):
    # This triggers a Celery task to fetch jobs for the user based on preferences
    profile = await get_or_create_profile(str(current_user.id))
    mark_fetch_requested(profile)
    await profile.save()
    try:
        task = celery_app.send_task("fetch_jobs_task", args=[str(current_user.id)], ignore_result=True)
    except OperationalError as exc:
        mark_fetch_failed(profile, "Job queue is unavailable. Please try again shortly.")
        await profile.save()
        logger.warning("Queue unavailable while enqueuing fetch_jobs_task for user %s: %s", current_user.id, exc)
        raise HTTPException(status_code=503, detail="Job queue is unavailable. Please try again shortly.") from exc

    return {"status": "Job fetch task triggered successfully", "task_id": task.id}


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, response: Response, current_user: User = Depends(get_current_user)):
    job = await _get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    profile = await get_or_create_profile(str(current_user.id))
    matcher = JobMatcher(profile)
    
    # Cache job data for 5 minutes since jobs rarely mutate after creation
    response.headers["Cache-Control"] = "public, max-age=300"
    
    return _serialize_job(job, matcher)
