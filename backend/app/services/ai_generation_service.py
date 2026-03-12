from __future__ import annotations

from app.models.job import Job
from app.services.gemini_service import get_gemini_service
from app.services.resume_service import get_user_resume_text


async def generate_resume_for_job(user_id: str, job_id: str, resume_id: str) -> str:
    job = await Job.get(job_id)
    if not job:
        raise ValueError("Job not found")

    resume_text = get_user_resume_text(user_id=user_id, resume_id=resume_id)
    if not resume_text:
        raise ValueError("Resume content not found for the provided resume_id")

    prompt = (
        "Rewrite the following resume to match the job description.\n\n"
        f"Job Description:\n{job.description or 'No description available.'}\n\n"
        f"Resume:\n{resume_text}\n\n"
        "Make it ATS optimized."
    )

    gemini = get_gemini_service()
    return gemini.generate_text(prompt)


async def generate_cover_letter_for_job(user_id: str, job_id: str, resume_id: str) -> str:
    job = await Job.get(job_id)
    if not job:
        raise ValueError("Job not found")

    resume_text = get_user_resume_text(user_id=user_id, resume_id=resume_id)
    if not resume_text:
        raise ValueError("Resume content not found for the provided resume_id")

    prompt = (
        "Write a professional cover letter.\n\n"
        f"Company: {job.company}\n"
        f"Role: {job.title}\n\n"
        f"Job Description:\n{job.description or 'No description available.'}\n\n"
        f"Candidate Resume:\n{resume_text}"
    )

    gemini = get_gemini_service()
    return gemini.generate_text(prompt)
