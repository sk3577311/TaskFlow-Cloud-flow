import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env file into environment variables
load_dotenv()   

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:Samalik0786%40@localhost:5432/taskflow"
    )
    REDIS_URL: str = os.getenv(
        "REDIS_URL",
        "redis://default:EwvMtESNIZoJ0OrgBFX2fiUuEL11Tpqv@redis-11398.c278.us-east-1-4.ec2.redns.redis-cloud.com:11398"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "defaultsecretkey")
    API_KEY: str = os.getenv("API_KEY", "supersecret123")

# Create a single instance to import across your app
settings = Settings()
