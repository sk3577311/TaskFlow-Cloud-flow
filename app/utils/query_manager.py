import redis
import json
from app.utils.config import settings

r = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

QUERY_NAME = "taskflow_jobs"

def enqueue_job(job_data:dict):
    """
    Enqueue a job into the redis queue.
    """
    r.lpush(QUERY_NAME,json.dumps(job_data))

def dequeue_job():
    """
    Dequeue a job from redis queue.
    """
    _,job = r.brpop(QUERY_NAME)
    return json.loads(job)
