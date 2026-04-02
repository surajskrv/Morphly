import asyncio
import os
import shutil

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import get_current_user
from app.models.preference import ExtractedProfile
from app.models.user import User
from app.services.profile_service import build_extracted_profile, get_or_create_profile, merge_profile
from app.services.resume_service import get_user_resume_text

router = APIRouter()

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def _sync_cleanup_existing(user_id: str) -> None:
    for existing_name in os.listdir(UPLOAD_DIR):
        if existing_name.startswith(f"{user_id}_"):
            os.remove(os.path.join(UPLOAD_DIR, existing_name))

def _sync_save_file(file_path: str, data: bytes) -> None:
    with open(file_path, "wb") as f:
        f.write(data)

def _sync_find_resume(user_id: str) -> str | None:
    for f in os.listdir(UPLOAD_DIR):
        if f.startswith(f"{user_id}_"):
            return f
    return None

def _sync_delete_resume(user_id: str) -> bool:
    deleted = False
    for f in os.listdir(UPLOAD_DIR):
        if f.startswith(f"{user_id}_"):
            os.remove(os.path.join(UPLOAD_DIR, f))
            deleted = True
    return deleted

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    filename = os.path.basename((file.filename or "").strip())
    if not filename:
        raise HTTPException(status_code=400, detail="File name is required.")

    if not filename.lower().endswith((".pdf", ".doc", ".docx")):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and Word docs are allowed.")

    # Enforce 10 MB file size limit
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10 MB.")

    # All file I/O runs in a thread pool to avoid blocking the event loop
    await asyncio.to_thread(_sync_cleanup_existing, str(current_user.id))
    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{filename}")
    await asyncio.to_thread(_sync_save_file, file_path, contents)

    profile = await get_or_create_profile(str(current_user.id))
    resume_text = get_user_resume_text(str(current_user.id))
    if resume_text:
        profile.extracted_profile = build_extracted_profile(resume_text)
    else:
        profile.extracted_profile = ExtractedProfile()
    await profile.save()

    return {
        "message": "Base resume uploaded and profile extracted successfully",
        "filename": filename,
        "path": file_path,
        "extracted_profile": profile.extracted_profile.model_dump(),
        "merged_profile": merge_profile(profile).model_dump(),
    }

@router.get("/")
async def get_resume(current_user: User = Depends(get_current_user)):
    found = await asyncio.to_thread(_sync_find_resume, str(current_user.id))
    if found:
        return {"resume_exists": True, "filename": found.split("_", 1)[1]}
    return {"resume_exists": False, "filename": None}

@router.delete("/")
async def delete_resume(current_user: User = Depends(get_current_user)):
    deleted = await asyncio.to_thread(_sync_delete_resume, str(current_user.id))

    profile = await get_or_create_profile(str(current_user.id))
    profile.extracted_profile = ExtractedProfile()
    await profile.save()

    if deleted:
        return {"message": "Resume deleted successfully"}
    return {"message": "No resume found to delete"}

