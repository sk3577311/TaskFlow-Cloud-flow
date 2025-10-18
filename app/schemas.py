from pydantic import BaseModel
from datetime import datetime
from typing import Any, Optional
from enum import Enum


class JobStatus(str, Enum):
    queued = "queued"
    running = "running"
    failed = "failed"
    completed = "completed"

class JobBase(BaseModel):
    task: str
    paylaod: dict

class JobResponse(JobBase):
    id: str
    task:str
    status: JobStatus
    result: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True