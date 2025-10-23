import asyncio
import traceback
from datetime import datetime
from app.models import JobStatus
from app.utils.config import settings
from app.workers.retry_scheduler import retry_scheduler_loop
import redis
from sqlalchemy.orm import Session
from app.utils.webhook import send_webhook

# Redis client
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


def handle_job_failure(job, error: Exception, db: Session):
    """
    Handle job failure, retry scheduling, and webhook notification.
    Can be used in both worker_loop and process_job.
    """
    try:
        print(f"❌ Job {job.id} failed with error: {error}")
        traceback.print_exc()

        # Update job status and increment retry count
        job.status = JobStatus.failed
        job.result = str(error)
        job.updated_at = datetime.utcnow()
        job.retries_count = (job.retries_count or 0) + 1
        db.commit()

        # Update Redis cache
        redis_client.hset(f"job:{job.id}", mapping={
            "status": "failed",
            "retries": job.retries_count
        })

        # Send webhook for failure
        send_webhook(job, "failed", str(error))

        # Retry logic
        if job.retries_count <= job.max_retries:
            print(f"🔁 Scheduling retry {job.retries_count}/{job.max_retries} for job {job.id}...")

            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    asyncio.create_task(retry_scheduler_loop(job.id))
                else:
                    loop.run_until_complete(retry_scheduler_loop(job.id))
            except Exception as retry_err:
                print(f"⚠️ Retry scheduling failed for {job.id}: {retry_err}")

        else:
            print(f"💀 Job {job.id} exceeded max retries. Marking as permanently failed.")
            job.status = JobStatus.permanent_failed
            db.commit()
            redis_client.hset(f"job:{job.id}", mapping={"status": "permanent_failed"})
            send_webhook(job, "permanent_failed", "Max retries exceeded.")

    except Exception as handler_err:
        print(f"⚠️ Error in failure handler for job {job.id}: {handler_err}")