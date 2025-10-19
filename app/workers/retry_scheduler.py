import time
import redis
from datetime import datetime, timedelta
from app.workers.worker import process_job

redis_client = redis.Redis(host="localhost", port=6379, db=0)

MAX_RETRIES = 3
BASE_DELAY = 5  # seconds

def schedule_retry(job_id: str, attempt: int):
    """Schedule a retry using exponential backoff."""
    delay = BASE_DELAY * (2 ** (attempt - 1))
    next_run_time = datetime.utcnow() + timedelta(seconds=delay)
    redis_client.zadd("retry_queue", {job_id: next_run_time.timestamp()})
    redis_client.hset(f"job:{job_id}", mapping={"status": "scheduled_retry", "attempt": attempt})
    print(f"🔁 Retry {attempt} scheduled for job {job_id} in {delay}s")

def retry_scheduler_loop():
    """Continuously checks Redis for jobs ready to retry."""
    print("🚀 Retry scheduler started...")
    while True:
        now = datetime.utcnow().timestamp()
        ready_jobs = redis_client.zrangebyscore("retry_queue", 0, now)

        for job_id in ready_jobs:
            job_id = job_id.decode()
            redis_client.zrem("retry_queue", job_id)

            attempt = int(redis_client.hget(f"job:{job_id}", "attempt") or 1)
            if attempt > MAX_RETRIES:
                print(f"❌ Job {job_id} reached max retries ({MAX_RETRIES})")
                continue

            print(f"🔁 Retrying job {job_id}, attempt {attempt}")
            process_job(job_id)

        time.sleep(2)
