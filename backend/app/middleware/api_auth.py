from fastapi import Request, HTTPException
from fastapi.security import APIKeyHeader
from app.utils.config import settings

api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)

async def verify_api_key(request: Request, call_next):

    api_key = request.headers.get("x-api-key")
    print("Received API key:", api_key)
    print("Expected API key:", settings.API_KEY)
    if api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return await call_next(request)