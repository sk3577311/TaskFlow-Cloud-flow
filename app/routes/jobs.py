from fastapi import APIRouter, HTTPException,Depends
from sqlalchemy.orm import Session
import uuid
from app import models, schemas
from app.db import get_db
from app.workers.queue import enqueue_job
from app.workers.worker import redis_client

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("/", response_model=schemas.JobResponse)
def create_job(job: schemas.JobBase, db: Session = Depends(get_db)):
    job_id = str(uuid.uuid4())

    # Save to DB
    db_job = models.Job(
        id=job_id,
        task=job.task,
        payload=job.payload,
        status=models.JobStatus.queued,
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    # Serialize payload for Redis safely
    enqueue_payload = {
        "task": job.task,  # singular form for clarity
        "payload": job.payload  # this may be dict, queue.py handles it
    }

    enqueue_job(job_id, enqueue_payload)

    # Debug Redis data
    print(f"[DEBUG] Redis data for job {job_id}:")
    print(redis_client.hgetall(f"job:{job_id}"))

    return db_job

@router.get("/{job_id}",response_model=schemas.JobResponse)
def get_job(job_id:str,db:Session=Depends(get_db)):
    jobs = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not jobs:
        raise HTTPException(status_code=404,detail="Job not found")
    return jobs