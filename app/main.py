from fastapi import FastAPI
from app.routes import jobs
from app.db import Base,engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TaskFlow Cloud",
    description="Async Job Queue API built with FastAPI, Redis, and PostgreSQL.",
    version="1.0.0",
)

app.include_router(jobs.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to TaskFlow Cloud API"}