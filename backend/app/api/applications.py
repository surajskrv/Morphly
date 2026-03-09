from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.models.application import Application
from app.models.user import User
from app.api.deps import get_current_user
from app.worker.playwright_applier import apply_to_job_task

router = APIRouter()

@router.post("/", response_model=ApplicationResponse)
async def create_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user)
):
    app_doc = Application(**app_in.model_dump(), user_id=str(current_user.id))
    await app_doc.insert()
    
    # Trigger auto-apply
    apply_to_job_task.delay(str(app_doc.id))
    
    res = app_doc.model_dump()
    res["id"] = str(app_doc.id)
    return res

@router.get("/", response_model=List[ApplicationResponse])
async def get_applications(
    skip: int = 0, limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    apps = await Application.find(Application.user_id == str(current_user.id)).skip(skip).limit(limit).to_list()
    
    results = []
    for app_doc in apps:
        res = app_doc.model_dump()
        res["id"] = str(app_doc.id)
        results.append(res)
    return results
