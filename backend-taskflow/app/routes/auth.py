# app/routes/auth.py
from fastapi import APIRouter, Response, HTTPException, status, Cookie
from pydantic import BaseModel
from typing import Optional
from app.core.security import create_access_token, verify_token

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory demo users
USERS = {
    "admin": {"password": "password123", "roles": ["admin"]},
}

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(req: LoginRequest, response: Response):
    user = USERS.get(req.username)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(sub=req.username)

    # ✅ Local dev cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,    # ⚠ must be False for localhost HTTP
        samesite="lax",  # ⚠ 'lax' allows cookie to be sent on same-site requests
        max_age=60*60,
        path="/",
    )
    return {"message": "Logged in"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}

@router.get("/me")
def me(access_token: Optional[str] = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    payload = verify_token(access_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalid")
    
    return {"username": payload["sub"]}
