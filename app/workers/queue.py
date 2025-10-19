import redis
import json
from app.utils.config import settings
from datetime import datetime,timedelta

redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

def enqueue_job(job_id: str, payload: dict):
    # Push job ID
    redis_client.lpush("job_queue", job_id)

    # Convert all nested values safely
    safe_payload = {
        k: json.dumps(v) if isinstance(v, (dict, list)) else str(v)
        for k, v in payload.items()
    }

    # Store job metadata
    redis_client.hset(f"job:{job_id}", mapping=safe_payload)

def calculate_backoff(retry_count: int,base_delay:int, max_delay:int=3600):
    """
    retry_count = number of failed attempts so far
    base_delay = initial wait in seconds (default 5s)
    max_delay = upper limit (default 1h)
    """
    delay = base_delay * (2 ** retry_count)
    return min(delay, max_delay)