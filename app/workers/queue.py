import redis
from app.utils.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# Lower score = higher priority
PRIORITY_SCORES = {
    "high": 1,
    "medium": 2,
    "low": 3
}

def enqueue_job(job_id: str, priority: str):
    """Add a job to Redis sorted set based on priority."""
    score = PRIORITY_SCORES.get(priority, 2)
    redis_client.zadd("jobs:queue", {job_id: score})
    print(f"📥 Enqueued job {job_id} (priority={priority}, score={score})")


def dequeue_job() -> str | None:
    """Get the next job based on priority (lowest score first)."""
    job_entry = redis_client.zrange("jobs:queue", 0, 0)
    if not job_entry:
        return None
    job_id = job_entry[0]
    redis_client.zrem("jobs:queue", job_id)
    print(f"⚙️ Dequeued job {job_id} for processing")
    return job_id


def calculate_backoff(retry_count: int, base_delay: int = 5, max_delay: int = 3600):
    """Exponential backoff (5s → 10s → 20s … up to 1h)."""
    delay = base_delay * (2 ** retry_count)
    return min(delay, max_delay)
