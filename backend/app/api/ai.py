from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.ai import AIJobGenerationRequest, AITextResponse
from app.services.ai_generation_service import (
    generate_cover_letter_for_job,
    generate_resume_for_job,
)

router = APIRouter()

@router.post("/generate-resume", response_model=AITextResponse)
async def generate_resume_endpoint(
    data: AIJobGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        content = await generate_resume_for_job(
            user_id=str(current_user.id),
            job_id=data.job_id,
            resume_id=data.resume_id,
        )
        return AITextResponse(content=content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Resume generation failed: {exc}") from exc

@router.post("/generate-cover-letter", response_model=AITextResponse)
async def generate_cover_letter_endpoint(
    data: AIJobGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        content = await generate_cover_letter_for_job(
            user_id=str(current_user.id),
            job_id=data.job_id,
            resume_id=data.resume_id,
        )
        return AITextResponse(content=content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Cover letter generation failed: {exc}") from exc
