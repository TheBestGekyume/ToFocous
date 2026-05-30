from calendar import monthrange
from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query

from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db
from backend.models.agenda import AgendaItemResponse, AgendaResponse


router = APIRouter(prefix="/agenda", tags=["Agenda"])

DateField = Literal["start_date", "due_date"]


def get_month_range(year: int, month: int) -> tuple[date, date]:
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Mês inválido.")

    last_day = monthrange(year, month)[1]

    return date(year, month, 1), date(year, month, last_day)


def get_date_fields_by_calendar_setting(
    which_date_use_in_calendar: str,
) -> list[DateField]:
    if which_date_use_in_calendar == "UseStartDate":
        return ["start_date"]

    if which_date_use_in_calendar == "UseDueDate":
        return ["due_date"]

    if which_date_use_in_calendar == "UseBoth":
        return ["start_date", "due_date"]

    return ["due_date"]


def get_user_calendar_setting(supabase, user_id: str) -> str:
    response = (
        supabase
        .table("task_settings")
        .select("which_date_use_in_calendar")
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        return "UseDueDate"

    return response.data[0]["which_date_use_in_calendar"]


def build_task_agenda_item(
    task: dict,
    date_field: DateField,
) -> AgendaItemResponse:
    project = task.get("projects") or {}

    return AgendaItemResponse(
        id=task["id"],
        type="task",
        taskId=task["id"],
        projectId=task["project_id"],
        projectTitle=project.get("title"),
        parentTitle=None,
        title=task["title"],
        status=task["status"],
        priority=task["priority"],
        date=task[date_field],
        dateType=date_field,
    )


def build_subtask_agenda_item(
    subtask: dict,
    date_field: DateField,
) -> AgendaItemResponse:
    task = subtask.get("tasks") or {}
    project = task.get("projects") or {}

    return AgendaItemResponse(
        id=subtask["id"],
        type="subtask",
        taskId=subtask["task_id"],
        projectId=task["project_id"],
        projectTitle=project.get("title"),
        parentTitle=task.get("title"),
        title=subtask["title"],
        status=subtask["status"],
        priority=subtask["priority"],
        date=subtask[date_field],
        dateType=date_field,
    )


def query_tasks_by_date(
    supabase,
    user_id: str,
    date_field: DateField,
    month_start: date,
    month_end: date,
    project_id: str | None,
) -> list[dict]:
    query = (
        supabase
        .table("tasks")
        .select(
            """
            id,
            project_id,
            title,
            status,
            priority,
            start_date,
            due_date,
            projects (
                id,
                title
            )
            """
        )
        .eq("user_id", user_id)
        .gte(date_field, month_start.isoformat())
        .lte(date_field, month_end.isoformat())
    )

    if project_id:
        query = query.eq("project_id", project_id)

    response = query.execute()

    return response.data or []


def query_subtasks_by_date(
    supabase,
    user_id: str,
    date_field: DateField,
    month_start: date,
    month_end: date,
    project_id: str | None,
) -> list[dict]:
    query = (
        supabase
        .table("subtasks")
        .select(
            """
            id,
            task_id,
            title,
            status,
            priority,
            start_date,
            due_date,
            tasks!inner (
                id,
                user_id,
                project_id,
                title,
                projects (
                    id,
                    title
                )
            )
            """
        )
        .eq("tasks.user_id", user_id)
        .gte(date_field, month_start.isoformat())
        .lte(date_field, month_end.isoformat())
    )

    if project_id:
        query = query.eq("tasks.project_id", project_id)

    response = query.execute()

    return response.data or []


@router.get("/", response_model=AgendaResponse)
def list_agenda_items(
    year: int = Query(..., ge=2000, le=2500),
    month: int = Query(..., ge=1, le=12),
    project_id: str | None = None,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        month_start, month_end = get_month_range(year, month)

        which_date_use_in_calendar = get_user_calendar_setting(
            supabase=supabase,
            user_id=current_user.id,
        )

        date_fields = get_date_fields_by_calendar_setting(
            which_date_use_in_calendar=which_date_use_in_calendar,
        )

        agenda_items: list[AgendaItemResponse] = []

        for date_field in date_fields:
            tasks = query_tasks_by_date(
                supabase=supabase,
                user_id=current_user.id,
                date_field=date_field,
                month_start=month_start,
                month_end=month_end,
                project_id=project_id,
            )

            subtasks = query_subtasks_by_date(
                supabase=supabase,
                user_id=current_user.id,
                date_field=date_field,
                month_start=month_start,
                month_end=month_end,
                project_id=project_id,
            )

            for task in tasks:
                agenda_items.append(build_task_agenda_item(task, date_field))

            for subtask in subtasks:
                agenda_items.append(build_subtask_agenda_item(subtask, date_field))

        agenda_items.sort(key=lambda item: item.date)

        return AgendaResponse(
            year=year,
            month=month,
            items=agenda_items,
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))