from pydantic import BaseModel
from typing import Optional
from datetime import date, time
from enum import Enum


class TaskPriority(str, Enum):
    low = "Baixa"
    medium = "Média"
    high = "Alta"


class TaskStatus(str, Enum):
    unstarted = "Não iniciada"
    inProgress = "Em andamento"
    concluded = "Concluída"


class PostTask(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: date
    start_date: Optional[date] = None
    due_time: Optional[time] = None
    priority: TaskPriority
    start_time: Optional[time] = None
    status: TaskStatus = TaskStatus.unstarted


class PatchTask(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    start_date: Optional[date] = None
    start_time: Optional[time] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None