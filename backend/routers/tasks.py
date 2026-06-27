from datetime import datetime, time as time_type

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db
from backend.models.task import (
    DeleteTaskResponse,
    PatchTask,
    PostTask,
    TaskListResponse,
    TaskResponse,
)
from backend.core.responses import ApiResponse, created, failure, success


router = APIRouter(prefix="/tasks", tags=["Tasks"])


def api_response(response: ApiResponse):
    return JSONResponse(
        status_code=response.http_code,
        content=jsonable_encoder(response),
    )


def format_time(value):
    if not value:
        return None

    if isinstance(value, time_type):
        return value.strftime("%H:%M")

    try:
        value = str(value)

        if "T" in value:
            value = value.replace("Z", "")
            dt = datetime.fromisoformat(value)
            return dt.strftime("%H:%M")

        value = value.split("+")[0]
        value = value.split(".")[0]

        if len(value) >= 5:
            return value[:5]

        return None

    except Exception:
        return None


def build_task_response(task: dict) -> TaskResponse:
    return TaskResponse(
        id=task["id"],
        title=task["title"],
        description=task.get("description"),
        start_time=format_time(task.get("start_time")),
        start_date=task.get("start_date"),
        due_time=format_time(task.get("due_time")),
        due_date=task.get("due_date"),
        status=task["status"],
        priority=task["priority"],
        project_id=task["project_id"],
    )


@router.post(
    "/",
    response_model=ApiResponse[TaskResponse],
)
def post_task(
    data: PostTask,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        postdata = data.model_dump(mode="json")
        postdata["user_id"] = current_user.id

        response = (
            supabase
            .table("tasks")
            .insert(postdata)
            .execute()
        )

        if not response.data:
            return api_response(
                failure(
                    message="Não foi possível criar a tarefa.",
                    http_code=400,
                    error_code="TASK_CREATE_ERROR",
                )
            )

        task = response.data[0]

        return api_response(
            created(
                content=build_task_response(task),
                message="Tarefa criada com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="TASK_CREATE_ERROR",
            )
        )


@router.get(
    "/{task_id}/",
    response_model=ApiResponse[TaskResponse],
)
def get_task_by_id(
    task_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        response = (
            supabase
            .table("tasks")
            .select("*")
            .eq("id", task_id)
            .execute()
        )

        if not response.data:
            return api_response(
                failure(
                    message="Tarefa não encontrada.",
                    http_code=404,
                    error_code="TASK_NOT_FOUND",
                )
            )

        task = response.data[0]

        return api_response(
            success(
                content=build_task_response(task),
                message="Tarefa encontrada com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="TASK_GET_ERROR",
            )
        )


@router.get(
    "/",
    response_model=ApiResponse[TaskListResponse],
)
def get_tasks(
    project_id: str | None = None,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        query = (
            supabase
            .table("tasks")
            .select("*")
        )

        if project_id:
            query = query.eq("project_id", project_id)
        else:
            query = query.eq("user_id", current_user.id)

        response = query.execute()

        tasks = [
            build_task_response(task)
            for task in response.data or []
        ]

        return api_response(
            success(
                content=TaskListResponse(
                    tasks=tasks,
                ),
                message="Tarefas listadas com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="TASK_LIST_ERROR",
            )
        )


@router.patch(
    "/{task_id}/",
    response_model=ApiResponse[TaskResponse],
)
def patch_task(
    task_id: str,
    data: PatchTask,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        patchdata = data.model_dump(
            exclude_none=True,
            mode="json",
        )

        if not patchdata:
            return api_response(
                success(
                    content=None,
                    message="Nenhuma alteração feita.",
                )
            )

        response = (
            supabase
            .table("tasks")
            .update(patchdata)
            .eq("id", task_id)
            .execute()
        )

        if not response.data:
            return api_response(
                failure(
                    message="Tarefa não encontrada ou sem permissão para editar.",
                    http_code=404,
                    error_code="TASK_NOT_FOUND_OR_EDIT_DENIED",
                )
            )

        task = response.data[0]

        return api_response(
            success(
                content=build_task_response(task),
                message="Alterações feitas com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="TASK_UPDATE_ERROR",
            )
        )


@router.delete(
    "/{task_id}/",
    response_model=ApiResponse[DeleteTaskResponse],
)
def delete_task(
    task_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        response = (
            supabase
            .table("tasks")
            .delete()
            .eq("id", task_id)
            .execute()
        )

        if not response.data:
            return api_response(
                failure(
                    message="Tarefa não encontrada ou sem permissão para deletar.",
                    http_code=404,
                    error_code="TASK_NOT_FOUND_OR_DELETE_DENIED",
                )
            )

        return api_response(
            success(
                content=DeleteTaskResponse(
                    deleted=response.data or [],
                ),
                message="Tarefa deletada com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="TASK_DELETE_ERROR",
            )
        )