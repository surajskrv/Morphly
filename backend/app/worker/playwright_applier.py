from celery import shared_task
import asyncio
from app.core.database import init_db
from app.models.application import Application

async def async_apply_to_job(application_id: str):
    await init_db()
    # Beanie ObjectId is represented as strings natively in Pydantic logic,
    # but to query by ID string in find_one we must parse it to PydanticObjectId,
    # or just use Application.get(application_id)
    app_doc = await Application.get(application_id)
    if not app_doc:
        print(f"Application {application_id} not found.")
        return
        
    print(f"Started applying process for user {app_doc.user_id} and job {app_doc.job_id}")
    
    # Mock playwright process
    await asyncio.sleep(2)
    
    app_doc.status = "applied"
    await app_doc.save()

@shared_task(name="apply_to_job_task")
def apply_to_job_task(application_id: str):
    asyncio.run(async_apply_to_job(application_id))
    return f"Application process completed for {application_id}"
