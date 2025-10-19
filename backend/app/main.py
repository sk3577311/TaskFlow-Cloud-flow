from threading import Thread
from fastapi import FastAPI
from app.routes import jobs
from app.db import Base,engine
from app.workers.retry_scheduler import retry_scheduler_loop
from app.middleware.api_auth import verify_api_key

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TaskFlow Cloud",
    description="Async Job Queue API built with FastAPI, Redis, and PostgreSQL.",
    version="1.0.0",
)


app.include_router(jobs.router)
app.middleware("http")(verify_api_key)

# Start background retry scheduler
Thread(target=retry_scheduler_loop, daemon=True).start()
@app.get("/")
def read_root():
    return {"message": "Welcome to TaskFlow Cloud API"}