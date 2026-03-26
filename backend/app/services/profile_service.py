from __future__ import annotations

import re
from datetime import datetime, timezone

from app.models.preference import ExtractedProfile, Preference, UserPreferences
from app.schemas.profile import FetchStatusSchema, MergedProfileSchema, ProfileResponse

TECH_SKILLS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "express",
    "fastapi",
    "django",
    "flask",
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "docker",
    "kubernetes",
    "aws",
    "gcp",
    "azure",
    "graphql",
    "rest",
    "html",
    "css",
    "tailwind",
    "git",
    "linux",
    "pandas",
    "numpy",
    "machine learning",
    "tensorflow",
    "pytorch",
    "figma",
    "product management",
    "data analysis",
    "sql",
]

ROLE_PATTERNS = {
    "Backend Engineer": ["backend engineer", "backend developer", "python developer", "api engineer"],
    "Frontend Engineer": ["frontend engineer", "frontend developer", "react developer", "ui engineer"],
    "Full Stack Engineer": ["full stack engineer", "fullstack engineer", "full stack developer"],
    "Data Analyst": ["data analyst", "business analyst", "analytics analyst"],
    "Data Scientist": ["data scientist", "machine learning engineer", "ml engineer"],
    "Product Manager": ["product manager", "associate product manager"],
    "UI/UX Designer": ["ui designer", "ux designer", "product designer"],
}

EDUCATION_KEYWORDS = ("b.tech", "b.e", "bsc", "bachelor", "m.tech", "msc", "master", "mba")
COMPANY_STOPWORDS = {"experience", "present", "remote", "internship", "project"}


def normalize_list(values: list[str]) -> list[str]:
    seen: set[str] = set()
    normalized: list[str] = []
    for value in values:
        cleaned = " ".join(str(value).strip().split())
        if not cleaned:
            continue
        key = cleaned.lower()
        if key in seen:
            continue
        seen.add(key)
        normalized.append(cleaned)
    return normalized


def extract_skills_from_text(text: str) -> list[str]:
    lowered = text.lower()
    found = [skill for skill in TECH_SKILLS if skill in lowered]
    return normalize_list(found)


def infer_role_from_text(text: str) -> str | None:
    lowered = text.lower()
    for role, patterns in ROLE_PATTERNS.items():
        if any(pattern in lowered for pattern in patterns):
            return role
    return None


def infer_experience_level(text: str) -> str | None:
    lowered = text.lower()
    if any(keyword in lowered for keyword in ["principal", "staff engineer", "architect"]):
        return "Principal"
    if any(keyword in lowered for keyword in ["lead", "senior", "sr."]):
        return "Senior"
    if any(keyword in lowered for keyword in ["intern", "student", "fresher"]):
        return "Entry"

    years = [int(match) for match in re.findall(r"(\d+)\+?\s+years", lowered)]
    if years:
        highest = max(years)
        if highest >= 6:
            return "Senior"
        if highest >= 2:
            return "Mid"
        return "Entry"
    return None


def infer_location(text: str) -> str | None:
    first_lines = [line.strip() for line in text.splitlines()[:8] if line.strip()]
    for line in first_lines:
        lowered = line.lower()
        if "remote" in lowered:
            return "Remote"
        if "," in line and len(line.split()) <= 8 and not any(token in lowered for token in ["email", "phone", "linkedin", "github"]):
            return line
    return None


def infer_summary(text: str) -> str | None:
    chunks = [chunk.strip() for chunk in re.split(r"\n{2,}", text) if chunk.strip()]
    for chunk in chunks:
        lowered = chunk.lower()
        if any(keyword in lowered for keyword in ["summary", "profile", "objective"]):
            return chunk[:400]
    joined = " ".join(line.strip() for line in text.splitlines()[:6] if line.strip())
    return joined[:280] if joined else None


def infer_past_companies(text: str) -> list[str]:
    companies: list[str] = []
    for line in text.splitlines():
        cleaned = " ".join(line.strip().split())
        lowered = cleaned.lower()
        if " at " in lowered:
            company = cleaned.split(" at ", 1)[1].split("|", 1)[0].strip(" -:,")
            if company and company.lower() not in COMPANY_STOPWORDS:
                companies.append(company)
        elif "|" in cleaned and len(cleaned.split("|")) >= 2:
            candidate = cleaned.split("|", 1)[1].strip(" -:,")
            if candidate and candidate.lower() not in COMPANY_STOPWORDS and len(candidate.split()) <= 5:
                companies.append(candidate)
    return normalize_list(companies)[:5]


def infer_education(text: str) -> list[str]:
    education: list[str] = []
    for line in text.splitlines():
        cleaned = " ".join(line.strip().split())
        lowered = cleaned.lower()
        if any(keyword in lowered for keyword in EDUCATION_KEYWORDS):
            education.append(cleaned)
    return normalize_list(education)[:4]


def build_extracted_profile(resume_text: str) -> ExtractedProfile:
    return ExtractedProfile(
        desired_role=infer_role_from_text(resume_text),
        skills=extract_skills_from_text(resume_text),
        experience_level=infer_experience_level(resume_text),
        location=infer_location(resume_text),
        summary=infer_summary(resume_text),
        past_companies=infer_past_companies(resume_text),
        education=infer_education(resume_text),
        extracted_at=datetime.now(timezone.utc),
    )


async def get_or_create_profile(user_id: str) -> Preference:
    profile = await Preference.find_one(Preference.user_id == user_id)
    if profile:
        return profile

    profile = Preference(user_id=user_id)
    await profile.insert()
    return profile


def merge_profile(profile: Preference | None) -> MergedProfileSchema:
    if not profile:
        return MergedProfileSchema()

    merged = profile.merged_preferences()
    extracted = profile.extracted_profile
    return MergedProfileSchema(
        desired_role=merged.desired_role,
        skills=merged.skills,
        experience_level=merged.experience_level,
        location=merged.location,
        remote_only=merged.remote_only,
        salary_min=merged.salary_min,
        preferred_companies=merged.preferred_companies,
        summary=extracted.summary,
        past_companies=extracted.past_companies,
        education=extracted.education,
    )


def serialize_profile(profile: Preference) -> ProfileResponse:
    return ProfileResponse(
        id=str(profile.id),
        user_id=profile.user_id,
        extracted_profile=profile.extracted_profile.model_dump(),
        user_preferences=profile.user_preferences.model_dump(),
        merged_profile=merge_profile(profile).model_dump(),
        fetch_status=FetchStatusSchema(**profile.fetch_status.model_dump()),
    )


def apply_preference_updates(profile: Preference, updates: dict) -> Preference:
    current = profile.user_preferences.model_dump()
    current.update(updates)
    current["skills"] = normalize_list(current.get("skills", []))
    current["preferred_companies"] = normalize_list(current.get("preferred_companies", []))
    profile.user_preferences = UserPreferences(**current)
    profile.updated_at = datetime.now(timezone.utc)
    return profile


def mark_fetch_requested(profile: Preference) -> Preference:
    now = datetime.now(timezone.utc)
    profile.fetch_status.last_requested_at = now
    profile.fetch_status.in_progress = True
    profile.fetch_status.last_error = None
    profile.updated_at = now
    return profile


def mark_fetch_completed(profile: Preference) -> Preference:
    now = datetime.now(timezone.utc)
    profile.fetch_status.in_progress = False
    profile.fetch_status.last_completed_at = now
    profile.fetch_status.last_error = None
    profile.updated_at = now
    return profile


def mark_fetch_failed(profile: Preference, message: str) -> Preference:
    now = datetime.now(timezone.utc)
    profile.fetch_status.in_progress = False
    profile.fetch_status.last_error = message
    profile.updated_at = now
    return profile
