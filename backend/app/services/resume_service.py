from __future__ import annotations

import os
import re
import zipfile
from pathlib import Path

UPLOAD_DIR = Path("uploads/resumes")


def _extract_docx_text(file_path: Path) -> str:
    try:
        with zipfile.ZipFile(file_path) as docx_file:
            xml_data = docx_file.read("word/document.xml").decode("utf-8", errors="ignore")
    except Exception:
        return ""

    # Extract text between XML tags and normalize whitespace.
    text = re.sub(r"<[^>]+>", " ", xml_data)
    return re.sub(r"\s+", " ", text).strip()


def _extract_plain_text(file_path: Path) -> str:
    try:
        return file_path.read_text(encoding="utf-8", errors="ignore").strip()
    except Exception:
        return ""


def get_user_resume_text(user_id: str, resume_id: str | None = None) -> str:
    if not UPLOAD_DIR.exists():
        return ""

    prefix = f"{user_id}_"
    user_files = sorted(
        [f for f in UPLOAD_DIR.iterdir() if f.is_file() and f.name.startswith(prefix)],
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    if not user_files:
        return ""

    selected_file: Path | None = None
    if resume_id:
        exact_name = f"{prefix}{resume_id}"
        for file_path in user_files:
            if file_path.name == exact_name or file_path.name.endswith(resume_id):
                selected_file = file_path
                break

    if selected_file is None:
        selected_file = user_files[0]

    ext = selected_file.suffix.lower()
    if ext in {".txt", ".md", ".rtf", ".doc"}:
        return _extract_plain_text(selected_file)
    if ext == ".docx":
        return _extract_docx_text(selected_file)

    # PDF and other binary formats are not parsed without extra dependencies.
    # Return a best-effort decode so prompting still works with some content.
    try:
        raw = selected_file.read_bytes()
    except OSError:
        return ""

    return raw.decode("utf-8", errors="ignore").strip()
