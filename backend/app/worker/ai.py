from celery import shared_task
import asyncio
from app.core.database import init_db
from app.services.ai_generation_service import (
    generate_cover_letter_for_job,
    generate_resume_for_job,
)

@shared_task(name="generate_resume_task")
def generate_resume_task(user_id: str, job_id: str, resume_id: str):
    async def _run() -> str:
        await init_db()
        return await generate_resume_for_job(user_id=user_id, job_id=job_id, resume_id=resume_id)

    return asyncio.run(_run())

@shared_task(name="generate_cover_letter_task")
def generate_cover_letter_task(user_id: str, job_id: str, resume_id: str):
    async def _run() -> str:
        await init_db()
        return await generate_cover_letter_for_job(user_id=user_id, job_id=job_id, resume_id=resume_id)

    return asyncio.run(_run())
