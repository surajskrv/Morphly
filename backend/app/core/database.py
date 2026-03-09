from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings

# This list should hold all our Beanie document models
async def init_db():
    from app.models.user import User
    from app.models.job import Job
    from app.models.preference import Preference
    from app.models.application import Application

    client = AsyncIOMotorClient(settings.MONGODB_URL)
    database = client.morphly
    
    await init_beanie(database, document_models=[User, Job, Preference, Application])
