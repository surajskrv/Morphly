from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "morphly_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.worker.jobs", "app.worker.ai", "app.worker.playwright_applier"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
