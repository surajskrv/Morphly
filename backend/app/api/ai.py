from fastapi import APIRouter, Depends
from app.models.user import User
from app.api.deps import get_current_user
from app.worker.celery_app import celery_app
from typing import Dict

router = APIRouter()

@router.post("/generate-resume")
async def generate_resume_endpoint(
    data: Dict,
    current_user: User = Depends(get_current_user)
):
    task = celery_app.send_task("generate_resume_task", args=[str(current_user.id), data.get('job_id')])
    return {"task_id": task.id, "status": "Generating resume..."}

@router.post("/generate-cover-letter")
async def generate_cover_letter_endpoint(
    data: Dict,
    current_user: User = Depends(get_current_user)
):
    task = celery_app.send_task("generate_cover_letter_task", args=[str(current_user.id), data.get('job_id')])
    return {"task_id": task.id, "status": "Generating cover letter..."}
