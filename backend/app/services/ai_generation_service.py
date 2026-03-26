from __future__ import annotations

import re

from app.models.job import Job
from app.models.user import User
from app.schemas.ai import CoverLetterResponse, GeneratedDocumentSection, TailoredResumeResponse
from app.services.profile_service import (
    extract_skills_from_text,
    infer_experience_level,
    infer_role_from_text,
    merge_profile,
)
from app.services.resume_service import extract_resume_sections, get_user_resume_text
from app.services.profile_service import get_or_create_profile


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-zA-Z0-9+#.]+", text.lower()))


def _dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        cleaned = " ".join(value.split())
        if not cleaned:
            continue
        key = cleaned.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(cleaned)
    return result


def _extract_job_signals(job: Job) -> dict[str, object]:
    description = job.description or ""
    combined = " ".join([job.title or "", description, " ".join(job.skills or [])])
    skills = _dedupe((job.skills or []) + extract_skills_from_text(combined))
    domain_keywords = [token for token in _tokenize(combined) if len(token) > 3][:15]
    return {
        "role": infer_role_from_text(combined) or job.title,
        "experience_level": infer_experience_level(combined) or job.experience_level,
        "skills": skills,
        "domain_keywords": domain_keywords,
    }


def _select_relevant_lines(source_text: str, keywords: list[str], limit: int = 4) -> list[str]:
    lines = [" ".join(line.strip().split()) for line in source_text.splitlines() if line.strip()]
    if not lines:
        return []

    keyword_tokens = _tokenize(" ".join(keywords))
    scored: list[tuple[int, str]] = []
    for line in lines:
        score = len(keyword_tokens.intersection(_tokenize(line)))
        scored.append((score, line))

    scored.sort(key=lambda item: item[0], reverse=True)
    selected = [line for score, line in scored if score > 0][:limit]
    if selected:
        return selected
    return lines[:limit]


def _build_summary(job: Job, merged_profile, matched_skills: list[str], resume_sections: dict[str, str]) -> str:
    base_summary = resume_sections.get("summary") or merged_profile.summary
    role = merged_profile.desired_role or job.title
    if base_summary:
        first_sentence = re.split(r"(?<=[.!?])\s+", base_summary.strip())[0]
        if matched_skills:
            return (
                f"{first_sentence} Targeting {role} opportunities with emphasis on "
                f"{', '.join(matched_skills[:4])}."
            )
        return f"{first_sentence} Targeting {role} opportunities that value strong technical execution."

    if matched_skills:
        return (
            f"Technical professional targeting {role} opportunities with grounded experience in "
            f"{', '.join(matched_skills[:4])}."
        )
    return f"Technical professional targeting {role} opportunities with relevant hands-on project and delivery experience."


def _build_resume_sections(job: Job, merged_profile, resume_sections: dict[str, str], job_signals: dict[str, object]) -> list[GeneratedDocumentSection]:
    matched_skills = _dedupe(
        [
            skill
            for skill in (merged_profile.skills or [])
            if skill.lower() in {item.lower() for item in job_signals["skills"]}
        ]
    )
    if not matched_skills:
        matched_skills = merged_profile.skills[:8] or list(job_signals["skills"])[:8]

    source_pool = "\n".join(
        [
            resume_sections.get("experience", ""),
            resume_sections.get("projects", ""),
            resume_sections.get("general", ""),
        ]
    )
    relevant_experience = _select_relevant_lines(
        source_pool,
        [job.title, *(job_signals["skills"]), *(job_signals["domain_keywords"])],
        limit=5,
    )
    project_lines = _select_relevant_lines(
        resume_sections.get("projects", "") or source_pool,
        [job.title, *(job_signals["skills"])],
        limit=3,
    )
    education_lines = _select_relevant_lines(
        resume_sections.get("education", "") or "\n".join(merged_profile.education),
        [str(job_signals["role"])],
        limit=3,
    )

    sections = [
        GeneratedDocumentSection(
            id="summary",
            title="Professional Summary",
            content=_build_summary(job, merged_profile, matched_skills, resume_sections),
        ),
        GeneratedDocumentSection(
            id="skills",
            title="Relevant Skills",
            content="\n".join(f"- {skill}" for skill in matched_skills[:10]) or "- Add key job-relevant skills here.",
        ),
    ]

    if relevant_experience:
        sections.append(
            GeneratedDocumentSection(
                id="experience",
                title="Relevant Experience Highlights",
                content="\n".join(f"- {line}" for line in relevant_experience),
            )
        )

    if project_lines:
        sections.append(
            GeneratedDocumentSection(
                id="projects",
                title="Project Highlights",
                content="\n".join(f"- {line}" for line in project_lines),
            )
        )

    if education_lines:
        sections.append(
            GeneratedDocumentSection(
                id="education",
                title="Education",
                content="\n".join(f"- {line}" for line in education_lines),
            )
        )

    return sections


def _build_grounding(job: Job, merged_profile, resume_sections: dict[str, str], job_signals: dict[str, object]) -> list[str]:
    grounding: list[str] = []
    if merged_profile.desired_role:
        grounding.append(f"Target role source: {merged_profile.desired_role}.")
    if job_signals["skills"]:
        grounding.append(f"Job skills detected: {', '.join(list(job_signals['skills'])[:5])}.")
    if resume_sections.get("experience"):
        grounding.append("Experience highlights were selected from your uploaded base resume.")
    if resume_sections.get("projects"):
        grounding.append("Project examples were pulled from your resume projects section.")
    grounding.append(f"Company context: {job.company} - {job.title}.")
    return grounding[:5]


async def generate_resume_for_job(user_id: str, job_id: str, resume_id: str | None = None) -> TailoredResumeResponse:
    job = await Job.get(job_id)
    if not job:
        raise ValueError("Job not found")

    profile = await get_or_create_profile(user_id)
    merged_profile = merge_profile(profile)
    resume_text = get_user_resume_text(user_id=user_id, resume_id=resume_id)
    if not resume_text:
        raise ValueError("Resume content not found for the active base resume")

    resume_sections = extract_resume_sections(resume_text)
    job_signals = _extract_job_signals(job)
    sections = _build_resume_sections(job, merged_profile, resume_sections, job_signals)
    grounding = _build_grounding(job, merged_profile, resume_sections, job_signals)

    return TailoredResumeResponse(
        job_id=str(job.id),
        sections=sections,
        grounding=grounding,
    )


async def generate_cover_letter_for_job(user_id: str, job_id: str, resume_id: str | None = None) -> CoverLetterResponse:
    job = await Job.get(job_id)
    if not job:
        raise ValueError("Job not found")

    profile = await get_or_create_profile(user_id)
    merged_profile = merge_profile(profile)
    resume_text = get_user_resume_text(user_id=user_id, resume_id=resume_id)
    if not resume_text:
        raise ValueError("Resume content not found for the active base resume")

    resume_sections = extract_resume_sections(resume_text)
    job_signals = _extract_job_signals(job)
    matched_skills = _dedupe(
        [
            skill
            for skill in (merged_profile.skills or [])
            if skill.lower() in {item.lower() for item in job_signals["skills"]}
        ]
    ) or list(job_signals["skills"])[:4]
    highlights = _select_relevant_lines(
        "\n".join(
            [
                resume_sections.get("experience", ""),
                resume_sections.get("projects", ""),
                resume_sections.get("general", ""),
            ]
        ),
        [job.title, *(job_signals["skills"])],
        limit=2,
    )

    user = await User.get(user_id)
    full_name = user.full_name if user and user.full_name else "A motivated candidate"
    opening = (
        f"Dear Hiring Team at {job.company},\n\n"
        f"I am excited to apply for the {job.title} role. "
        f"My background aligns closely with the mix of {', '.join(matched_skills[:3]) or 'technical delivery'} called for in the role."
    )
    body = (
        "\n\n"
        f"In my recent work, I have built experience around {', '.join(matched_skills[:4]) or 'core engineering execution'}. "
        f"{' '.join(highlights[:2]) if highlights else 'My resume reflects hands-on delivery across relevant technical problems.'} "
        f"This is why the opportunity at {job.company} stands out to me."
    )
    closing = (
        "\n\n"
        "I would welcome the chance to bring this experience to your team and contribute with a strong blend of execution, collaboration, and ownership.\n\n"
        f"Sincerely,\n{full_name}"
    )

    return CoverLetterResponse(
        job_id=str(job.id),
        content=f"{opening}{body}{closing}",
        grounding=_build_grounding(job, merged_profile, resume_sections, job_signals),
    )
