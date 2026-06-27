from datetime import date, time
from typing import Optional
from pydantic import BaseModel

from backend.models.task import TaskPriority, TaskStatus


class PostSubTask(BaseModel):
    title: str
    description: Optional[str] = None
    due_time: Optional[time] = None
    due_date: date
    start_date: Optional[date] = None
    start_time: Optional[time] = None
    priority: TaskPriority
    status: TaskStatus = TaskStatus.unstarted


class PatchSubTask(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    start_time: Optional[time] = None
    due_time: Optional[time] = None
    due_date: Optional[date] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None


class SubTaskResponse(BaseModel):
    id: str
    title: str
    description: str | None = None
    start_date: date | None = None
    start_time: str | None = None
    due_date: date | None = None
    due_time: str | None = None
    priority: TaskPriority | None = None
    status: TaskStatus


class SubTaskListResponse(BaseModel):
    subtasks: list[SubTaskResponse]


class DeleteSubTaskResponse(BaseModel):
    deleted: list[dict]