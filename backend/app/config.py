import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "GlobalVox RSVP Voice Campaign API"
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/globalvox_rsvp")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "globalvox_rsvp")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))

settings = Settings()
