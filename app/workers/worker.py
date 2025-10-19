import time
import json
from redis import Redis
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Job, JobStatus
from app.utils.config import settings


#redis client
redis_client = Redis(host=settings.REDIS_URL, decode_responses=True)

def execute_task(task_name:str, payload:dict) -> str:
    '''Simulate task execution based on task name and payload.'''
    print(f"Executing task: {task_name} with payload: {payload}")
    time.sleep(3)  # Simulate time-consuming task
    return f"Result of {task_name} with payload {json.dumps(payload)} executed successfully."


def process_jobs(job_id:str):
    """Pull detail from DB, run the task, and update the job status."""

    db:Session = next(get_db())
    try:
        job = db.query(Job).filter(Job.id == job_id)
        if not job:
            print(f"⚠️ Job {job_id} not found in DB")
            return
        
        print(f"🔄 Starting job {job_id} ({job.task})")
        job.status = JobStatus.running
        db.commit()

        result = execute_task(job.task, job.payload)
        job.status = JobStatus.completed
        job.result = result
        db.commit()

        print(f"✅ Job {job_id} completed successfully.")

    except Exception as e:
        print(f"❌ Job {job_id} failed with error: {e}")
        job.status = JobStatus.failed
        job.result = str(e)
        db.commit()

    finally:
        db.close()


def worker_loop():
    """
    Infinete loop to process jobs from Redis queue and process them.
    """
    print("🚀 Worker started, waiting for jobs...")
    while True:
        job_id = redis_client.rpop("job_queue")  #FIFO lpush + rpop
        if job_id:
            print(f"📥 Picked up job {job_id} from queue.")
            process_jobs(job_id)
        else:
            time.sleep(2)  # Sleep briefly if no job is found