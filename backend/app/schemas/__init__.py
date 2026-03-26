from .user import UserCreate, UserResponse
from .preference import PreferenceCreate, PreferenceResponse
from .job import JobCreate, JobFetchStatusResponse, JobResponse
from .application import ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate, ApplicationUpdate
from .ai import AIJobGenerationRequest, CoverLetterResponse, TailoredResumeResponse
from .profile import (
    ExtractedProfileSchema,
    FetchStatusSchema,
    MergedProfileSchema,
    ProfileResponse,
    ProfileReviewRequest,
    UserPreferencesSchema,
)
