from datetime import date
from typing import Literal
from pydantic import BaseModel


class AgendaItemResponse(BaseModel):
    id: str
    type: Literal["task", "subtask"]

    taskId: str
    projectId: str

    projectTitle: str | None = None
    parentTitle: str | None = None

    title: str
    status: str
    priority: str

    date: date
    dateType: Literal["start_date", "due_date"]


class AgendaResponse(BaseModel):
    year: int
    month: int
    items: list[AgendaItemResponse]