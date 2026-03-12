import logging

from fastapi import APIRouter, Depends
from kombu.exceptions import OperationalError
from app.schemas.preference import PreferenceCreate, PreferenceResponse
from app.models.preference import Preference
from app.models.user import User
from app.api.deps import get_current_user
from app.worker.celery_app import celery_app

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=PreferenceResponse)
async def create_or_update_preference(
    pref_in: PreferenceCreate,
    current_user: User = Depends(get_current_user)
):
    pref = await Preference.find_one(Preference.user_id == str(current_user.id))
    if pref:
        for k, v in pref_in.model_dump(exclude_unset=True).items():
            setattr(pref, k, v)
        await pref.save()
    else:
        pref = Preference(**pref_in.model_dump(), user_id=str(current_user.id))
        await pref.insert()

    # Keep UI and backend behavior aligned: saving preferences starts a background fetch.
    try:
        celery_app.send_task("fetch_jobs_task", args=[str(current_user.id)], ignore_result=True)
    except OperationalError as exc:
        logger.warning("Failed to enqueue fetch_jobs_task for user %s: %s", current_user.id, exc)

    res = pref.model_dump()
    res["id"] = str(pref.id)
    return res

@router.get("/", response_model=PreferenceResponse)
async def get_preference(
    current_user: User = Depends(get_current_user)
):
    pref = await Preference.find_one(Preference.user_id == str(current_user.id))
    if not pref:
        return PreferenceResponse(user_id=str(current_user.id))
        
    res = pref.model_dump()
    res["id"] = str(pref.id)
    return res
