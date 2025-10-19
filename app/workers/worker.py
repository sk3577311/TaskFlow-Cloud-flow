import time
import json
import redis
import asyncio
import traceback
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db import SESSION_LOCAL, get_db
from app.models import Job, JobStatus
from app.utils.config import settings
from app.utils.query_manager import dequeue_job
from app.workers.queue import calculate_backoff
from app.workers.retry_scheduler import schedule_retry

# Redis client
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


# --------------------------
# 🧩 TASK EXECUTION LOGIC
# --------------------------
def execute_task(task_name: str, payload: dict) -> str:
    """Simulate task execution based on task name and payload."""
    print(f"🚀 Executing task: {task_name} with payload: {payload}")
    time.sleep(3)  # simulate task runtime
    return f"Result of {task_name} with payload {json.dumps(payload)} executed successfully."


# --------------------------
# ⚙️ PROCESS JOB
# --------------------------
def process_job(job_id: str):
    """Process a single job and handle retries automatically."""
    db: Session = next(get_db())
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            print(f"⚠️ Job {job_id} not found in DB.")
            return

        print(f"🔄 Starting job {job.id} ({job.task})")
        job.status = JobStatus.running
        db.commit()

        # ✅ Run the actual task
        result = execute_task(job.task, job.payload)

        # ✅ On success
        job.status = JobStatus.completed
        job.result = result
        job.completed_at = datetime.utcnow()
        db.commit()

        redis_client.hset(f"job:{job.id}", mapping={"status": "completed"})
        print(f"✅ Job {job.id} completed successfully.")

    except Exception as e:
        print(f"❌ Job {job_id} failed with error: {e}")
        traceback.print_exc()

        if job:
            job.status = JobStatus.failed
            job.result = str(e)
            job.retries_count = (job.retries_count or 0) + 1
            db.commit()

            redis_client.hset(f"job:{job.id}", mapping={"status": "failed"})

            # 🔁 Schedule retry if limit not reached
            if job.retries_count <= job.max_retries:
                try:
                    loop = asyncio.get_event_loop()
                    if loop.is_running():
                        asyncio.create_task(schedule_retry(job_id))
                    else:
                        loop.run_until_complete(schedule_retry(job_id))
                except Exception as retry_err:
                    print(f"⚠️ Retry scheduling failed: {retry_err}")
            else:
                print(f"💀 Job {job.id} exceeded max retries ({job.max_retries}). Marking as permanent failed.")
                job.status = JobStatus.permanent_failed
                db.commit()

    finally:
        db.close()


# --------------------------
# ⚙️ Worker loop
# --------------------------
def worker_loop():
    """Infinite loop to process jobs from Redis queue."""
    print("👷 Worker started, waiting for jobs...")
    db = SESSION_LOCAL()
    print("👷 Worker started, waiting for jobs...")
    while True:
        job_data = dequeue_job()
        job = db.query(Job).filter(Job.id == job_data['job_id']).first()
        if not job:
            continue


        try:
            job.status = JobStatus.running
            db.commit()

            result = process_jobs(job_data)
            job.status = JobStatus.completed
            job.result = result
            db.commit()
            print(f"✅ Job {job.id} completed successfully.")

        except Exception as e:
            print(f"❌ Job {job.id} failed with error: {e}")
            job.status = JobStatus.failed
            job.result = {"error":str(e), "trace": traceback.format_exc()}

            if job.retries_count <= job.max_retries:
                delay = calculate_backoff(job.retries_count)
                job.next_retry_at = datetime.utcnow() + timedelta(seconds=delay)
                db.commit()

                print(f"🔄 Retrying job {job.id} in {delay} seconds.")

            else:
                print(f"💀 Job {job.id} has exceeded max retries ({job.max_retries}). Marking as failed.")
                db.commit()