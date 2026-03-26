from pydantic import BaseModel, Field


class AIJobGenerationRequest(BaseModel):
    job_id: str
    resume_id: str | None = None


class GeneratedDocumentSection(BaseModel):
    id: str
    title: str
    content: str


class TailoredResumeResponse(BaseModel):
    job_id: str
    title: str = "Tailored Resume"
    sections: list[GeneratedDocumentSection] = Field(default_factory=list)
    grounding: list[str] = Field(default_factory=list)


class CoverLetterResponse(BaseModel):
    job_id: str
    content: str
    grounding: list[str] = Field(default_factory=list)
