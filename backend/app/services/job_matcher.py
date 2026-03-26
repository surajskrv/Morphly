from __future__ import annotations

import re

from app.models.job import Job
from app.models.preference import Preference, UserPreferences


class JobMatcher:
    def __init__(self, preference: Preference | UserPreferences | None) -> None:
        if isinstance(preference, Preference):
            self.preference = preference.merged_preferences()
        else:
            self.preference = preference

    @staticmethod
    def _tokenize(text: str) -> set[str]:
        return set(re.findall(r"[a-zA-Z0-9+#.]+", text.lower()))

    def _role_score(self, job: Job) -> float:
        if not self.preference or not self.preference.desired_role:
            return 0.0

        desired_role = self.preference.desired_role.lower()
        haystack = f"{job.title or ''} {job.description or ''}".lower()
        if desired_role in haystack:
            return 1.0

        desired_tokens = self._tokenize(desired_role)
        if not desired_tokens:
            return 0.0

        overlap = desired_tokens.intersection(self._tokenize(haystack))
        return len(overlap) / len(desired_tokens)

    def _skill_score(self, job: Job) -> float:
        if not self.preference or not self.preference.skills:
            return 0.0

        preferred_skills = {skill.lower().strip() for skill in self.preference.skills if skill.strip()}
        haystack = " ".join([job.title or "", job.description or "", " ".join(job.skills or [])]).lower()
        job_tokens = self._tokenize(haystack)
        if not preferred_skills:
            return 0.0

        matches = 0
        for skill in preferred_skills:
            skill_tokens = self._tokenize(skill)
            if skill in haystack or (skill_tokens and skill_tokens.issubset(job_tokens)):
                matches += 1
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
        preferred_parts = [part.strip() for part in re.split(r"[,/|-]", preferred_location) if part.strip()]
        if preferred_parts and any(part in job_location for part in preferred_parts):
            return 0.75
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
        if not self.preference or not self.preference.experience_level:
            return 0.0

        preferred_level = self.preference.experience_level.strip().lower()
        if not preferred_level:
            return 0.0

        job_level_text = " ".join([job.experience_level or "", job.description or ""]).lower()
        return 1.0 if preferred_level in job_level_text else 0.0

    def _company_score(self, job: Job) -> float:
        if not self.preference or not self.preference.preferred_companies:
            return 0.0

        company_name = (job.company or "").strip().lower()
        preferred_companies = {company.lower() for company in self.preference.preferred_companies}
        return 1.0 if company_name in preferred_companies else 0.0

    def score_job(self, job: Job) -> float:
        role_score = self._role_score(job)
        skill_score = self._skill_score(job)
        location_score = self._location_score(job)
        salary_score = self._salary_score(job)
        experience_score = self._experience_score(job)
        company_score = self._company_score(job)

        weighted = (
            role_score * 0.25
            + skill_score * 0.3
            + location_score * 0.15
            + salary_score * 0.1
            + experience_score * 0.1
            + company_score * 0.1
        )
        return round(min(max(weighted, 0.0), 1.0), 4)

    def explain_job(self, job: Job) -> list[str]:
        if not self.preference:
            return []

        reasons: list[str] = []
        if self._role_score(job) >= 0.5 and self.preference.desired_role:
            reasons.append(f"Role aligns with your target of {self.preference.desired_role}.")
        if self._skill_score(job) > 0 and self.preference.skills:
            haystack = " ".join([job.title or "", job.description or "", " ".join(job.skills or [])]).lower()
            haystack_tokens = self._tokenize(haystack)
            matched_skills = [
                skill
                for skill in self.preference.skills
                if skill.lower() in haystack or self._tokenize(skill).issubset(haystack_tokens)
            ]
            if matched_skills:
                reasons.append(f"Matches your skills: {', '.join(matched_skills[:4])}.")
        if self._location_score(job) > 0 and self.preference.location:
            reasons.append(f"Fits your location preference for {self.preference.location}.")
        if self._experience_score(job) > 0 and self.preference.experience_level:
            reasons.append(f"Experience level lines up with your {self.preference.experience_level} target.")
        if self._company_score(job) > 0:
            reasons.append(f"{job.company} is one of your preferred companies.")
        if self._salary_score(job) > 0 and self.preference.salary_min is not None:
            reasons.append("Compensation looks compatible with your minimum salary target.")
        return reasons[:4]
