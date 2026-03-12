from pydantic import BaseModel


class AIJobGenerationRequest(BaseModel):
    job_id: str
    resume_id: str


class AITextResponse(BaseModel):
    content: str
