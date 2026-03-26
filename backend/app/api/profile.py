import logging

from fastapi import APIRouter, Depends
from kombu.exceptions import OperationalError

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileReviewRequest
from app.services.profile_service import (
    apply_preference_updates,
    get_or_create_profile,
    mark_fetch_requested,
    serialize_profile,
)
from app.worker.celery_app import celery_app

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=ProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    profile = await get_or_create_profile(str(current_user.id))
    return serialize_profile(profile)


@router.post("/review", response_model=ProfileResponse)
async def review_profile(
    payload: ProfileReviewRequest,
    current_user: User = Depends(get_current_user),
):
    profile = await get_or_create_profile(str(current_user.id))
    apply_preference_updates(profile, payload.model_dump(exclude_unset=True))
    mark_fetch_requested(profile)
    await profile.save()

    try:
        celery_app.send_task("fetch_jobs_task", args=[str(current_user.id)], ignore_result=True)
    except OperationalError as exc:
        logger.warning("Failed to enqueue fetch_jobs_task for user %s: %s", current_user.id, exc)

    return serialize_profile(profile)
