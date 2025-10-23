# app/core/security.py
import os
from datetime import datetime, timedelta
import jwt

JWT_SECRET = os.environ.get("JWT_SECRET", "supersecretjwtkey")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour

def create_access_token(sub: str, expires_delta: timedelta = timedelta(hours=1)):
    payload = {
        "sub": sub,
        "exp": datetime.utcnow() + expires_delta,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
