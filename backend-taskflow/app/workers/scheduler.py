import asyncio
import redis
import json
from datetime import datetime, timedelta
from app.workers.worker import process_job
from app.workers.queue import enqueue_job
from app.utils.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def scheduler_loop():
    """Async delayed job scheduler"""
    print("🕒 Delayed job scheduler running...")
    while True:
        now = datetime.utcnow().timestamp()
        ready_jobs = redis_client.zrangebyscore("delayed_jobs", 0, now)
        for job_id in ready_jobs:
            redis_client.zrem("delayed_jobs", job_id)
            print(f"🚀 Executing delayed job {job_id}")
            process_job(job_id)
        await asyncio.sleep(2)

async def cron_scheduler_loop():
    """Async cron-like scheduler"""
    print("🕓 Cron scheduler started...")
    while True:
        now = int(datetime.utcnow().timestamp())
        jobs = redis_client.zrangebyscore("scheduled_jobs", 0, now)
        for job_str in jobs:
            job = json.loads(job_str)
            enqueue_job(job["job_id"], job["payload"])
            redis_client.zrem("scheduled_jobs", job_str)
            print(f"🚀 Enqueued scheduled job {job['job_id']}")
        await asyncio.sleep(5)

async def run_scheduler():
    """Run both schedulers concurrently"""
    await asyncio.gather(scheduler_loop(), cron_scheduler_loop())
