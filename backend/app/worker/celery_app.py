from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "morphly_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.worker.jobs",
        "app.worker.ai",
        "app.worker.playwright_applier",
        "app.tasks.scrape_jobs",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    broker_connection_retry_on_startup=True,
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "scrape-linkedin-every-6-hours": {
            "task": "fetch_linkedin_jobs",
            "schedule": crontab(minute=0, hour="*/6"),
        },
        "scrape-naukri-every-6-hours": {
            "task": "fetch_naukri_jobs",
            "schedule": crontab(minute=10, hour="*/6"),
        },
        "scrape-internshala-every-12-hours": {
            "task": "fetch_internshala_jobs",
            "schedule": crontab(minute=20, hour="*/12"),
        },
        "scrape-wellfound-every-12-hours": {
            "task": "fetch_wellfound_jobs",
            "schedule": crontab(minute=30, hour="*/12"),
        },
        "scrape-hirist-every-12-hours": {
            "task": "fetch_hirist_jobs",
            "schedule": crontab(minute=40, hour="*/12"),
        },
        "scrape-adzuna-every-3-hours": {
            "task": "fetch_adzuna_jobs",
            "schedule": crontab(minute=50, hour="*/3"),
        },
    },
)
