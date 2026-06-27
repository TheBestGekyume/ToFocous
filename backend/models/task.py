from datetime import date, time
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskStatus(str, Enum):
    unstarted = "unstarted"
    inProgress = "inProgress"
    concluded = "concluded"


class PostTask(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: date
    start_date: Optional[date] = None
    due_time: Optional[time] = None
    priority: TaskPriority
    start_time: Optional[time] = None
    status: TaskStatus = TaskStatus.unstarted
    project_id: str


class PatchTask(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    start_date: Optional[date] = None
    start_time: Optional[time] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    project_id: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: str | None = None
    start_time: str | None = None
    start_date: date | None = None
    due_time: str | None = None
    due_date: date | None = None
    status: TaskStatus
    priority: TaskPriority
    project_id: str


class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]


class DeleteTaskResponse(BaseModel):
    deleted: list[dict]