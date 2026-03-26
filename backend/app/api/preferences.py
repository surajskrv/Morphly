import logging

from fastapi import APIRouter, Depends
from kombu.exceptions import OperationalError

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.preference import PreferenceCreate, PreferenceResponse
from app.services.profile_service import (
    apply_preference_updates,
    get_or_create_profile,
    mark_fetch_requested,
    merge_profile,
)
from app.worker.celery_app import celery_app

router = APIRouter()
logger = logging.getLogger(__name__)


def _serialize_preferences(profile) -> PreferenceResponse:
    merged = merge_profile(profile)
    return PreferenceResponse(
        id=str(profile.id),
        user_id=profile.user_id,
        desired_role=merged.desired_role,
        skills=merged.skills,
        experience_level=merged.experience_level,
        location=merged.location,
        remote_only=merged.remote_only,
        salary_min=merged.salary_min,
        preferred_companies=merged.preferred_companies,
        summary=merged.summary,
        past_companies=merged.past_companies,
        education=merged.education,
    )


@router.post("/", response_model=PreferenceResponse)
async def create_or_update_preference(
    pref_in: PreferenceCreate,
    current_user: User = Depends(get_current_user),
):
    profile = await get_or_create_profile(str(current_user.id))
    apply_preference_updates(profile, pref_in.model_dump(exclude_unset=True))
    mark_fetch_requested(profile)
    await profile.save()

    try:
        celery_app.send_task("fetch_jobs_task", args=[str(current_user.id)], ignore_result=True)
    except OperationalError as exc:
        logger.warning("Failed to enqueue fetch_jobs_task for user %s: %s", current_user.id, exc)

    return _serialize_preferences(profile)


@router.get("/", response_model=PreferenceResponse)
async def get_preference(current_user: User = Depends(get_current_user)):
    profile = await get_or_create_profile(str(current_user.id))
    return _serialize_preferences(profile)
