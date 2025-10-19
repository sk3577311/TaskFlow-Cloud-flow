import asyncio
from datetime import datetime, timedelta
from app.utils.config import settings
from app.db import SESSION_LOCAL
from app.models import Job, JobStatus
import redis

# Redis client
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# Retry settings
MAX_RETRIES = 5
BASE_DELAY = 5  # seconds


async def schedule_retry(job_id: str):
    """
    Schedule a failed job for retry using exponential backoff.
    """
    db = SESSION_LOCAL()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            print(f"⚠️ Job {job_id} not found in DB.")
            return

        retry_count = (job.retries_count or 0)
        delay = BASE_DELAY * (2 ** retry_count)

        if retry_count >= MAX_RETRIES:
            job.status = JobStatus.permanent_failed
            db.commit()
            print(f"💀 Job {job.id} permanently failed after {MAX_RETRIES} retries.")
            return

        # Update DB with next retry info
        job.status = JobStatus.scheduled
        job.next_retry_at = datetime.utcnow() + timedelta(seconds=delay)
        db.commit()

        print(f"🔁 Scheduling retry {retry_count + 1} for Job {job.id} in {delay}s...")

        # Sleep asynchronously for backoff duration
        await asyncio.sleep(delay)

        # Push job back into queue
        redis_client.lpush("job_queue", {"job_id": job_id})
        redis_client.hset(f"job:{job_id}", mapping={"status": "queued"})

        print(f"📦 Job {job.id} requeued after {delay}s delay.")

    except Exception as e:
        print(f"⚠️ Retry scheduling failed for job {job_id}: {e}")

    finally:
        db.close()
