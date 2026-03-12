from __future__ import annotations

import re

from app.models.job import Job
from app.models.preference import Preference


class JobMatcher:
    def __init__(self, preference: Preference | None) -> None:
        self.preference = preference

    @staticmethod
    def _tokenize(text: str) -> set[str]:
        return set(re.findall(r"[a-zA-Z0-9+#.]+", text.lower()))

    def _skill_score(self, job: Job) -> float:
        if not self.preference or not self.preference.skills:
            return 0.0

        preferred_skills = {skill.lower() for skill in self.preference.skills if skill.strip()}
        haystack = " ".join(
            [
                job.title or "",
                job.description or "",
                " ".join(job.skills or []),
            ]
        )
        job_tokens = self._tokenize(haystack)

        if not preferred_skills:
            return 0.0

        matches = sum(1 for skill in preferred_skills if skill in job_tokens)
        return matches / len(preferred_skills)

    def _location_score(self, job: Job) -> float:
        if not self.preference:
            return 0.0

        job_location = (job.location or "").lower()

        if self.preference.remote_only:
            return 1.0 if "remote" in job_location else 0.0

        preferred_location = (self.preference.location or "").strip().lower()
        if not preferred_location:
            return 0.0

        if preferred_location in job_location:
            return 1.0
        if "remote" in job_location:
            return 0.5
        return 0.0

    def _salary_score(self, job: Job) -> float:
        if not self.preference or self.preference.salary_min is None:
            return 0.0

        target_salary = float(self.preference.salary_min)
        if target_salary <= 0:
            return 0.0

        if job.salary_max is not None and job.salary_max >= target_salary:
            return 1.0
        if job.salary_min is not None and job.salary_min >= target_salary:
            return 0.9
        return 0.0

    def _experience_score(self, job: Job) -> float:
        if not self.preference:
            return 0.0

        preferred_level = (self.preference.experience_level or "").strip().lower()
        if not preferred_level:
            return 0.0

        job_level_text = " ".join([job.experience_level or "", job.description or ""]).lower()
        return 1.0 if preferred_level in job_level_text else 0.0

    def score_job(self, job: Job) -> float:
        skill_score = self._skill_score(job)
        location_score = self._location_score(job)
        salary_score = self._salary_score(job)
        experience_score = self._experience_score(job)

        weighted = (
            skill_score * 0.4
            + location_score * 0.25
            + salary_score * 0.2
            + experience_score * 0.15
        )
        return round(min(max(weighted, 0.0), 1.0), 4)
