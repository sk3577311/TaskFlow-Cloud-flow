import asyncio
from datetime import datetime, timedelta
import redis.asyncio as redis
from app.utils.config import settings

MAX_RETRIES = 3
BASE_DELAY = 5  # seconds

# Async Redis client
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


async def schedule_retry(job_id: str, attempt: int):
    """Schedule a retry using exponential backoff (async version)."""
    delay = BASE_DELAY * (2 ** (attempt - 1))
    next_run_time = datetime.utcnow() + timedelta(seconds=delay)

    await redis_client.zadd("retry_queue", {job_id: next_run_time.timestamp()})
    await redis_client.hset(
        f"job:{job_id}", mapping={"status": "scheduled_retry", "attempt": attempt}
    )

    print(f"🔁 Retry {attempt} scheduled for job {job_id} in {delay}s")


async def retry_scheduler_loop():
    """Continuously checks Redis for jobs ready to retry (async)."""
    from app.workers.worker import process_job

    print("🚀 Async retry scheduler started...")
    while True:
        now = datetime.utcnow().timestamp()
        ready_jobs = await redis_client.zrangebyscore("retry_queue", 0, now)

        for job_id in ready_jobs:
            # Remove from retry queue
            await redis_client.zrem("retry_queue", job_id)

            attempt_str = await redis_client.hget(f"job:{job_id}", "attempt")
            attempt = int(attempt_str or 1)

            if attempt > MAX_RETRIES:
                print(f"❌ Job {job_id} reached max retries ({MAX_RETRIES})")
                continue

            print(f"🔁 Retrying job {job_id}, attempt {attempt}")

            try:
                await process_job(job_id)
            except Exception as e:
                print(f"⚠️ Error retrying job {job_id}: {e}")

        await asyncio.sleep(2)  # async sleep (non-blocking)
