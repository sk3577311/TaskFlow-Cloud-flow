import time
import json
import traceback
from datetime import datetime
from sqlalchemy.orm import Session
from app.db import SESSION_LOCAL, get_db
from app.models import Job, JobStatus
from app.utils.config import settings
from app.utils.query_manager import dequeue_job
from app.workers.queue import redis_client, calculate_backoff
from app.workers.retry_scheduler import schedule_retry
from app.utils.webhook import send_webhook  # ✅ added webhook
from app.workers.job_failure_handler import handle_job_failure


# --------------------------
# 🧩 TASK EXECUTION LOGIC
# --------------------------
def execute_task(task_name: str, payload: dict) -> str:
    """Simulate task execution."""
    print(f"🚀 Executing task: {task_name} with payload: {payload}")
    time.sleep(3)
    return f"✅ Completed task: {task_name} with payload {json.dumps(payload)}"


# --------------------------
# ⚙️ PROCESS JOB
# --------------------------
def process_job(job_id: str):
    """Pull job details from DB, execute task, update DB + Redis, trigger webhook."""
    db: Session = next(get_db())
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            print(f"⚠️ Job {job_id} not found in DB")
            return

        print(f"🔄 Starting job {job_id} ({job.task})")
        job.status = JobStatus.running
        db.commit()

        result = execute_task(job.task, job.payload)
        job.status = JobStatus.completed
        job.result = result
        job.completed_at = datetime.utcnow()
        db.commit()

        redis_client.hset(f"job:{job_id}", mapping={"status": "completed"})
        print(f"✅ Job {job_id} completed successfully.")

        # ✅ Send webhook on success
        if job.webhook_url:
            send_webhook(job.webhook_url, {
                "job_id": job.id,
                "status": "completed",
                "result": job.result,
                "timestamp": datetime.utcnow().isoformat(),
            })

    except Exception as e:
        print(f"❌ Job {job_id} failed with error: {e}")
        traceback.print_exc()

        if job:
            job.status = JobStatus.failed
            job.result = str(e)
            db.commit()

        # 🔁 Retry logic
        attempt = int(redis_client.hincrby(f"job:{job_id}", "attempt", 1))
        if attempt <= 3:
            schedule_retry(job_id, attempt)
        else:
            print(f"💀 Job {job_id} exceeded max retries.")
            redis_client.hset(f"job:{job_id}", mapping={"status": "permanent_failed"})
            job.status = JobStatus.permanent_failed
            db.commit()

            # ❗ Send webhook on permanent failure
            if job and job.webhook_url:
                send_webhook(job.webhook_url, {
                    "job_id": job.id,
                    "status": "failed",
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat(),
                })

    finally:
        db.close()


# --------------------------
# ⚙️ WORKER LOOP
# --------------------------
def worker_loop():
    """Continuously poll Redis queue and process jobs."""
    print("👷 Worker started, waiting for jobs...")
    db = SESSION_LOCAL()

    while True:
        job_data = dequeue_job()
        if not job_data:
            time.sleep(1)
            continue

        job_id = job_data["job_id"]
        print(f"🧩 Dequeued job {job_id}")

        try:
            process_job(job_id)

        except Exception as e:
            print(f"🔥 Unexpected error in worker loop for job {job_id}: {e}")
            traceback.print_exc()

        time.sleep(0.5)
