from fastapi import Request, HTTPException, status, Depends
from fastapi.security import APIKeyHeader
from pydantic_settings import BaseSettings
import os

# ✅ Load API key from environment or use default for local dev
class Settings(BaseSettings):
    API_KEY: str = os.getenv("API_KEY", "supersecret123")

settings = Settings()

# Header name for API key
api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)

def verify_api_key(api_key: str = Depends(api_key_header)):
    """Dependency-based verification (for specific routers if needed)."""
    expected_key = settings.API_KEY
    print(f"🔍 Received API key: {api_key} | Expected: {expected_key}")

    if api_key is None or api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    return True


EXPECTED_API_KEY = os.getenv("API_KEY", "supersecret123")
PUBLIC_PATHS = ["/auth", "/docs", "/openapi.json", "/"]  # skip these

async def verify_api_key_middleware(request: Request, call_next):
    # Skip public routes & CORS preflight
    if request.method == "OPTIONS" or any(request.url.path.startswith(p) for p in PUBLIC_PATHS):
        return await call_next(request)

    api_key = request.headers.get("x-api-key")
    print(f"🔍 Received API key: {api_key} | Expected: {EXPECTED_API_KEY}")
    if api_key != EXPECTED_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    
    return await call_next(request)