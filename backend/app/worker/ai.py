from celery import shared_task
import time

@shared_task(name="generate_resume_task")
def generate_resume_task(user_id: str, job_id: str):
    # Stub for OpenAI resume generation
    time.sleep(2)
    return f"Resume generated for user {user_id}, job {job_id}"

@shared_task(name="generate_cover_letter_task")
def generate_cover_letter_task(user_id: str, job_id: str):
    # Stub for OpenAI cover letter generation
    time.sleep(2)
    return f"Cover letter generated for user {user_id}, job {job_id}"
