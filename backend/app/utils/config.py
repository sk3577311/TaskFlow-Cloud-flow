import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:Samalik0786%40@localhost:5432/taskflow")
    REDIS_URL = os.getenv("REDIS_URL", "redis://default:EwvMtESNIZoJ0OrgBFX2fiUuEL11Tpqv@redis-11398.c278.us-east-1-4.ec2.redns.redis-cloud.com:11398")
    SECRET_KEY = os.getenv("SECRET_KEY", "defaultsecretkey")
    API_KEY = os.getenv("API_KEY","9809duc90sd8ucnsd9usd9mvusd09vduv09sndvud0")


settings = Settings()