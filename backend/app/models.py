from sqlalchemy import Column, Boolean, Enum as SQLEnum, DateTime, JSON, Integer, String
from datetime import datetime
from enum import Enum
from app.db import Base

class JobPriority(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"

class JobStatus(str, Enum):
    queued = "queued"
    running = "running"
    failed = "failed"
    completed = "completed"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, index=True)
    task = Column(String, nullable=False)
    payload = Column(JSON, nullable=False)
    status = Column(SQLEnum(JobStatus), default=JobStatus.queued)
    result = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    priority = Column(SQLEnum(JobPriority), default=JobPriority.medium)

    retries_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    next_retry_at = Column(DateTime(timezone=True), nullable=True)
    webhook_url = Column(String, nullable=True)
