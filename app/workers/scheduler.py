import time
import redis
from datetime import datetime, timedelta
from .worker import process_job

redis_client = redis.Redis(host="localhost", port=6379, db=0)

def schedule_job(job_id: str, delay_seconds: int):
    """Schedule a job to run in the future."""
    run_at = datetime.utcnow() + timedelta(seconds=delay_seconds)
    redis_client.zadd("delayed_jobs", {job_id: run_at.timestamp()})
    print(f"⏰ Job {job_id} scheduled to run in {delay_seconds}s")

def scheduler_loop():
    """Runs continuously to check for delayed jobs that are ready."""
    print("🕒 Delayed job scheduler running...")
    while True:
        now = datetime.utcnow().timestamp()
        ready_jobs = redis_client.zrangebyscore("delayed_jobs", 0, now)

        for job_id in ready_jobs:
            job_id = job_id.decode()
            redis_client.zrem("delayed_jobs", job_id)
            print(f"🚀 Executing delayed job {job_id}")
            process_job(job_id)

        time.sleep(2)
