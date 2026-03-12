import logging
from typing import List

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException
from kombu.exceptions import OperationalError

from app.models.job import Job
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationJobSummary
from app.models.application import Application
from app.models.user import User
from app.api.deps import get_current_user
from app.worker.celery_app import celery_app

router = APIRouter()
logger = logging.getLogger(__name__)


async def _get_job(job_id: str) -> Job | None:
    try:
        return await Job.get(PydanticObjectId(job_id))
    except Exception:  # noqa: BLE001
        return None


def _serialize_job(job: Job) -> ApplicationJobSummary:
    return ApplicationJobSummary(
        id=str(job.id),
        title=job.title,
        company=job.company,
        location=job.location,
        apply_url=job.apply_url,
        url=job.url,
        source=job.source,
    )

@router.post("/", response_model=ApplicationResponse)
async def create_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user)
):
    job = await _get_job(app_in.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = await Application.find_one(
        Application.user_id == str(current_user.id),
        Application.job_id == app_in.job_id,
    )
    if existing:
        res = existing.model_dump()
        res["id"] = str(existing.id)
        res["job"] = _serialize_job(job).model_dump()
        return res

    app_doc = Application(**app_in.model_dump(), user_id=str(current_user.id), status="pending")
    await app_doc.insert()

    # Trigger auto-apply with configured Celery app.
    try:
        celery_app.send_task("apply_to_job_task", args=[str(app_doc.id)], ignore_result=True)
    except OperationalError as exc:
        logger.warning("Failed to enqueue apply_to_job_task for application %s: %s", app_doc.id, exc)

    res = app_doc.model_dump()
    res["id"] = str(app_doc.id)
    res["job"] = _serialize_job(job).model_dump()
    return res

@router.get("/", response_model=List[ApplicationResponse])
async def get_applications(
    skip: int = 0, limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    apps = (
        await Application.find(Application.user_id == str(current_user.id))
        .sort(-Application.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    job_cache: dict[str, ApplicationJobSummary] = {}
    results = []
    for app_doc in apps:
        res = app_doc.model_dump()
        res["id"] = str(app_doc.id)
        if app_doc.job_id not in job_cache:
            job = await _get_job(app_doc.job_id)
            if job:
                job_cache[app_doc.job_id] = _serialize_job(job)
        if app_doc.job_id in job_cache:
            res["job"] = job_cache[app_doc.job_id].model_dump()
        results.append(res)
    return results
