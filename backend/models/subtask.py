from pydantic import BaseModel
from typing import Optional
from datetime import time, date
from backend.models.task import TaskPriority, TaskStatus


class PostSubtask(BaseModel):
    title: str
    description: Optional[str] = None
    due_time: Optional[time] = None
    due_date: date
    start_date: Optional[date] = None
    start_time: Optional[time] = None
    priority: TaskPriority
    status: TaskStatus = TaskStatus.unstarted


class PatchSubtask(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    start_time: Optional[time] = None
    due_time: Optional[time] = None
    due_date: Optional[date] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None