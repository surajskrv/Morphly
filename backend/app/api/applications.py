from datetime import datetime, timezone
from typing import List

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.models.application import Application
from app.models.job import Job
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationJobSummary,
    ApplicationResponse,
    ApplicationStatusUpdate,
    ApplicationUpdate,
)

router = APIRouter()


def _normalize_status(status: str | None) -> str:
    if status in {"saved", "ready", "applied"}:
        return status
    return "saved"


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


def _serialize_application(application: Application, job: Job | None = None) -> dict:
    res = application.model_dump()
    res["id"] = str(application.id)
    res["status"] = _normalize_status(res.get("status"))
    if job:
        res["job"] = _serialize_job(job).model_dump()
    return res


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
        updates = app_in.model_dump(exclude_unset=True)
        if "status" in updates:
            existing.status = updates["status"]
        if "resume_path" in updates:
            existing.resume_path = updates["resume_path"]
        if "resume_sections" in updates:
            existing.resume_sections = updates["resume_sections"]
        if "resume_grounding" in updates:
            existing.resume_grounding = updates["resume_grounding"]
        if "cover_letter_content" in updates:
            existing.cover_letter_content = updates["cover_letter_content"]
        if "cover_letter_grounding" in updates:
            existing.cover_letter_grounding = updates["cover_letter_grounding"]
        existing.updated_at = datetime.now(timezone.utc)
        if app_in.status == "applied" and existing.applied_at is None:
            existing.applied_at = datetime.now(timezone.utc)
        await existing.save()
        return _serialize_application(existing, job)

    app_doc = Application(**app_in.model_dump(), user_id=str(current_user.id))
    if app_doc.status == "applied":
        app_doc.applied_at = datetime.now(timezone.utc)
    app_doc.updated_at = datetime.now(timezone.utc)
    await app_doc.insert()
    return _serialize_application(app_doc, job)


@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str,
    payload: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
):
    try:
        application = await Application.get(PydanticObjectId(application_id))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=404, detail="Application not found") from exc

    if not application or application.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Application not found")

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        job = await _get_job(application.job_id)
        return _serialize_application(application, job)

    if "status" in updates and updates["status"] is not None:
        application.status = updates["status"]
    elif any(
        key in updates
        for key in {"resume_sections", "resume_grounding", "cover_letter_content", "cover_letter_grounding", "resume_path"}
    ) and application.status == "saved":
        application.status = "ready"

    if "resume_path" in updates:
        application.resume_path = updates["resume_path"]
    if "resume_sections" in updates and updates["resume_sections"] is not None:
        application.resume_sections = updates["resume_sections"]
    if "resume_grounding" in updates and updates["resume_grounding"] is not None:
        application.resume_grounding = updates["resume_grounding"]
    if "cover_letter_content" in updates:
        application.cover_letter_content = updates["cover_letter_content"]
    if "cover_letter_grounding" in updates and updates["cover_letter_grounding"] is not None:
        application.cover_letter_grounding = updates["cover_letter_grounding"]

    application.updated_at = datetime.now(timezone.utc)
    if application.status == "applied" and application.applied_at is None:
        application.applied_at = datetime.now(timezone.utc)
    await application.save()

    job = await _get_job(application.job_id)
    return _serialize_application(application, job)

@router.get("/", response_model=List[ApplicationResponse])
async def get_applications(
    skip: int = 0, limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    apps = (
        await Application.find(Application.user_id == str(current_user.id))
        .sort(-Application.updated_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    job_cache: dict[str, ApplicationJobSummary] = {}
    results = []
    for app_doc in apps:
        if app_doc.job_id not in job_cache:
            job = await _get_job(app_doc.job_id)
            if job:
                job_cache[app_doc.job_id] = _serialize_job(job)
        results.append(_serialize_application(app_doc))
        if app_doc.job_id in job_cache:
            results[-1]["job"] = job_cache[app_doc.job_id].model_dump()
    return results
