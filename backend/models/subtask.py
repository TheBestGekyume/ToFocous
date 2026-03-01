from pydantic import BaseModel
from typing import Optional
from datetime import time
from backend.models.task import TaskPriority, TaskStatus


class PostSubtask(BaseModel):
    title: str
    due_time: Optional[time] = None
    start_date: time
    due_date: time
    priority: TaskPriority
    status: TaskStatus = TaskStatus.unstarted


class PatchSubtask(BaseModel):
    title: Optional[str] = None
    due_time: Optional[time] = None
    start_time: Optional[time] = None
    due_date: Optional[time] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None