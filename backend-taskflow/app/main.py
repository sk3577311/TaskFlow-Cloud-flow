from fastapi import FastAPI, Security, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader

from app.db import Base, engine
from app.workers.retry_scheduler import retry_scheduler_loop
from app.routes import auth as auth_routes
from app.routes import jobs
from app.middlewares.api_auth import verify_api_key_middleware
import asyncio
# ------------------------------
# 🚀 App Initialization
# ------------------------------

API_KEY_NAME = "x-api-key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != "supersecret123":
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return api_key

app = FastAPI(
    title="TaskFlow Cloud",
    description="Async Job Processing System with Priority Queue, Retries, and Webhooks",
    version="1.0.0",
)

# Allow frontend origin
origins = [
    "http://localhost:3000",# your React/Next.js app
]
# ------------------------------
# 🧠 Middleware for CORS
# ------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for testing
    allow_credentials=True,
    allow_methods=["*"],    # GET, POST, OPTIONS, etc.
    allow_headers=["*"],    # X-API-Key, Content-Type, etc.
)

# ------------------------------
# 🔐 API Key Middleware (Safe)
# ------------------------------
app.middleware("http")(verify_api_key_middleware)

# ------------------------------
# 🧱 Database Initialization
# ------------------------------
Base.metadata.create_all(bind=engine)
# Base.metadata.drop_all(bind=engine)

# ------------------------------
# 🧩 Include Routers
# ------------------------------
app.include_router(auth_routes.router)
app.include_router(jobs.router)

# ------------------------------
# 🕓 Start Retry Scheduler Thread
# ------------------------------
# Thread(target=retry_scheduler_loop, daemon=True).start()

# ------------------------------
# 🏠 Root Endpoint
# ------------------------------
@app.get("/")
def read_root():
    return {"message": "Welcome to TaskFlow Cloud API ☁️", "status": "running"}

@app.on_event("startup")
async def startup_event():
    from app.workers.scheduler import run_scheduler
    from app.workers.retry_scheduler import retry_scheduler_loop

    print("✅ Both async schedulers started")
    asyncio.create_task(run_scheduler())
    asyncio.create_task(retry_scheduler_loop())
