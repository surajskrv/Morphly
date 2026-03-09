from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.models.user import User
from app.api.deps import get_current_user
import os
import shutil

router = APIRouter()

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

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

    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"message": "Resume uploaded successfully", "filename": filename, "path": file_path}

@router.get("/")
async def get_resume(current_user: User = Depends(get_current_user)):
    for f in os.listdir(UPLOAD_DIR):
        if f.startswith(f"{current_user.id}_"):
            return {"resume_exists": True, "filename": f.split("_", 1)[1]}
    return {"resume_exists": False, "filename": None}

@router.delete("/")
async def delete_resume(current_user: User = Depends(get_current_user)):
    deleted = False
    for f in os.listdir(UPLOAD_DIR):
        if f.startswith(f"{current_user.id}_"):
            os.remove(os.path.join(UPLOAD_DIR, f))
            deleted = True
            
    if deleted:
        return {"message": "Resume deleted successfully"}
    return {"message": "No resume found to delete"}
