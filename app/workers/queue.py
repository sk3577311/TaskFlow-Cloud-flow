import redis
from app.utils.config import settings

redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

def enqueue_job(job_id: str,payload: dict):
    redis_client.lpush("job_queue",job_id)
    redis_client.hset(f"job:{job_id}",mapping=payload)