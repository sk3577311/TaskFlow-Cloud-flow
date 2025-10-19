from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
import uuid
from app import models, schemas
from app.db import get_db
from app.workers.queue import enqueue_job
from app.workers.worker import redis_client

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("/", response_model=schemas.JobResponse)
def create_job(job: schemas.JobCreate, request: Request, db: Session = Depends(get_db)):
    """Create a new job and enqueue it based on priority."""
    job_id = str(uuid.uuid4())

    # Save job to DB
    db_job = models.Job(
        id=job_id,
        task=job.task,
        payload=job.payload,
        status=models.JobStatus.queued,
        webhook_url=job.webhook_url,
        priority=job.priority,
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    # Enqueue based on priority
    enqueue_job(job_id, job.priority.value)

    print(f"📦 Enqueued job {job_id} with priority {job.priority.value}")
    print(f"[DEBUG] Redis data for job {job_id}: {redis_client.hgetall(f'job:{job_id}')}")

    return db_job


@router.get("/{job_id}", response_model=schemas.JobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    """Fetch job details from the database."""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
