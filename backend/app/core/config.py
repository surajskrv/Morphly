from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Morphly"
    MONGODB_URL: str = "mongodb://localhost:27017"
    SECRET_KEY: str = "supersecretkey"  # Should be set securely in .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REDIS_URL: str = "redis://localhost:6379/0"
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    # External APIs
    GEMINI_API_KEY: str = ""
    ADZUNA_APP_ID: str = ""
    ADZUNA_API_KEY: str = ""
    JSEARCH_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
