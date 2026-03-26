from __future__ import annotations

import re
import zipfile
from pathlib import Path

try:
    from pypdf import PdfReader
except Exception:  # noqa: BLE001
    PdfReader = None

UPLOAD_DIR = Path("uploads/resumes")

SECTION_ALIASES = {
    "summary": "summary",
    "professional summary": "summary",
    "profile": "summary",
    "objective": "summary",
    "experience": "experience",
    "work experience": "experience",
    "professional experience": "experience",
    "employment": "experience",
    "projects": "projects",
    "project": "projects",
    "education": "education",
    "skills": "skills",
    "technical skills": "skills",
    "certifications": "certifications",
}


def _extract_docx_text(file_path: Path) -> str:
    try:
        with zipfile.ZipFile(file_path) as docx_file:
            xml_data = docx_file.read("word/document.xml").decode("utf-8", errors="ignore")
    except Exception:
        return ""

    xml_data = xml_data.replace("</w:p>", "\n").replace("</w:tr>", "\n")
    text = re.sub(r"<[^>]+>", " ", xml_data)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _extract_plain_text(file_path: Path) -> str:
    try:
        return file_path.read_text(encoding="utf-8", errors="ignore").strip()
    except Exception:
        return ""


def _extract_pdf_text(file_path: Path) -> str:
    if PdfReader is None:
        return ""

    try:
        reader = PdfReader(str(file_path))
    except Exception:
        return ""

    parts: list[str] = []
    for page in reader.pages:
        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""
        if text.strip():
            parts.append(text.strip())

    return "\n\n".join(parts).strip()


def get_user_resume_file(user_id: str, resume_id: str | None = None) -> Path | None:
    if not UPLOAD_DIR.exists():
        return None

    prefix = f"{user_id}_"
    user_files = sorted(
        [path for path in UPLOAD_DIR.iterdir() if path.is_file() and path.name.startswith(prefix)],
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )
    if not user_files:
        return None

    if resume_id:
        exact_name = f"{prefix}{resume_id}"
        for file_path in user_files:
            if file_path.name == exact_name or file_path.name.endswith(resume_id):
                return file_path

    return user_files[0]


def get_user_resume_text(user_id: str, resume_id: str | None = None) -> str:
    selected_file = get_user_resume_file(user_id=user_id, resume_id=resume_id)
    if not selected_file:
        return ""

    ext = selected_file.suffix.lower()
    if ext in {".txt", ".md", ".rtf", ".doc"}:
        return _extract_plain_text(selected_file)
    if ext == ".docx":
        return _extract_docx_text(selected_file)
    if ext == ".pdf":
        extracted = _extract_pdf_text(selected_file)
        if extracted:
            return extracted

    try:
        raw = selected_file.read_bytes()
    except OSError:
        return ""

    return raw.decode("utf-8", errors="ignore").strip()


def extract_resume_sections(resume_text: str) -> dict[str, str]:
    sections: dict[str, list[str]] = {"general": []}
    current_section = "general"

    for raw_line in resume_text.splitlines():
        line = " ".join(raw_line.strip().split())
        if not line:
            continue

        normalized = re.sub(r"[^a-zA-Z ]+", "", line).strip().lower()
        if normalized in SECTION_ALIASES:
            current_section = SECTION_ALIASES[normalized]
            sections.setdefault(current_section, [])
            continue

        sections.setdefault(current_section, []).append(line)

    return {
        key: "\n".join(values).strip()
        for key, values in sections.items()
        if any(value.strip() for value in values)
    }
