from datetime import datetime
from datetime import time as time_type

from fastapi import APIRouter, Depends

from backend.core.excepcions import AppException
from backend.core.responses import ApiResponse, created, success
from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db
from backend.models.subtask import (
    DeleteSubTaskResponse,
    PatchSubTask,
    PostSubTask,
    SubTaskListResponse,
    SubTaskResponse,
)


router = APIRouter(prefix="/subtasks", tags=["SubTasks"])


def format_time(value):
    if not value:
        return None

    if isinstance(value, time_type):
        return value.strftime("%H:%M")

    value = str(value)

    value = value.split("+")[0]
    value = value.split(".")[0]

    for time_format in ("%H:%M:%S", "%H:%M"):
        try:
            return datetime.strptime(value, time_format).strftime("%H:%M")
        except ValueError:
            continue

    return value


def build_subtask_response(subtask: dict) -> SubTaskResponse:
    return SubTaskResponse(
        id=subtask["id"],
        title=subtask["title"],
        description=subtask.get("description"),
        start_date=subtask.get("start_date"),
        start_time=format_time(subtask.get("start_time")),
        due_date=subtask.get("due_date"),
        due_time=format_time(subtask.get("due_time")),
        priority=subtask.get("priority"),
        status=subtask["status"],
    )


def get_task_by_id_from_db(
    supabase,
    task_id: str,
    user_id: str,
) -> dict | None:
    response = (
        supabase
        .table("tasks")
        .select("id, user_id")
        .eq("id", task_id)
        .eq("user_id", user_id)
        .execute()
    )

    tasks = response.data or []

    if not tasks:
        return None

    return tasks[0]


@router.get(
    "/{task_id}/",
    response_model=ApiResponse[SubTaskListResponse],
)
def get_subtasks(
    task_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        task = get_task_by_id_from_db(
            supabase=supabase,
            task_id=task_id,
            user_id=current_user.id,
        )

        if not task:
            raise AppException(
                message="Tarefa não encontrada.",
                http_code=404,
                error_code="TASK_NOT_FOUND",
            )

        response = (
            supabase
            .table("subtasks")
            .select("*")
            .eq("task_id", task_id)
            .execute()
        )

        subtasks = [
            build_subtask_response(subtask)
            for subtask in response.data or []
        ]

        return success(
            content=SubTaskListResponse(
                subtasks=subtasks,
            ),
            message="Subtarefas listadas com sucesso.",
        )

    except AppException:
        raise

    except Exception:
        raise AppException(
            message="Erro ao listar subtarefas.",
            http_code=500,
            error_code="SUBTASK_LIST_ERROR",
        )


@router.post(
    "/{task_id}/",
    response_model=ApiResponse[SubTaskResponse],
    status_code=201,
)
def post_subtask(
    data: PostSubTask,
    task_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        task = get_task_by_id_from_db(
            supabase=supabase,
            task_id=task_id,
            user_id=current_user.id,
        )

        if not task:
            raise AppException(
                message="Tarefa não encontrada.",
                http_code=404,
                error_code="TASK_NOT_FOUND",
            )

        subtask_data = data.model_dump(mode="json")
        subtask_data["task_id"] = task_id

        response = (
            supabase
            .table("subtasks")
            .insert(subtask_data)
            .execute()
        )

        if not response.data:
            raise AppException(
                message="Não foi possível criar a subtarefa.",
                http_code=400,
                error_code="SUBTASK_CREATE_ERROR",
            )

        subtask = response.data[0]

        return created(
            content=build_subtask_response(subtask),
            message="Subtarefa criada com sucesso.",
        )

    except AppException:
        raise

    except Exception:
        raise AppException(
            message="Erro ao criar subtarefa.",
            http_code=500,
            error_code="SUBTASK_CREATE_ERROR",
        )


@router.patch(
    "/{subtask_id}/",
    response_model=ApiResponse[SubTaskResponse],
)
def patch_subtask(
    subtask_id: str,
    task_id: str,
    data: PatchSubTask,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        task = get_task_by_id_from_db(
            supabase=supabase,
            task_id=task_id,
            user_id=current_user.id,
        )

        if not task:
            raise AppException(
                message="Tarefa não encontrada.",
                http_code=404,
                error_code="TASK_NOT_FOUND",
            )

        patchdata = data.model_dump(
            exclude_none=True,
            mode="json",
        )

        if not patchdata:
            return success(
                content=None,
                message="Nenhuma alteração feita.",
            )

        response = (
            supabase
            .table("subtasks")
            .update(patchdata)
            .eq("id", subtask_id)
            .eq("task_id", task_id)
            .execute()
        )

        if not response.data:
            raise AppException(
                message="Subtarefa não encontrada.",
                http_code=404,
                error_code="SUBTASK_NOT_FOUND",
            )

        subtask = response.data[0]

        return success(
            content=build_subtask_response(subtask),
            message="Subtarefa atualizada com sucesso.",
        )

    except AppException:
        raise

    except Exception:
        raise AppException(
            message="Erro ao atualizar subtarefa.",
            http_code=500,
            error_code="SUBTASK_UPDATE_ERROR",
        )


@router.delete(
    "/{subtask_id}/",
    response_model=ApiResponse[DeleteSubTaskResponse],
)
def delete_subtask(
    subtask_id: str,
    task_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        task = get_task_by_id_from_db(
            supabase=supabase,
            task_id=task_id,
            user_id=current_user.id,
        )

        if not task:
            raise AppException(
                message="Tarefa não encontrada.",
                http_code=404,
                error_code="TASK_NOT_FOUND",
            )

        response = (
            supabase
            .table("subtasks")
            .delete()
            .eq("id", subtask_id)
            .eq("task_id", task_id)
            .execute()
        )

        if not response.data:
            raise AppException(
                message="Subtarefa não encontrada.",
                http_code=404,
                error_code="SUBTASK_NOT_FOUND",
            )

        return success(
            content=DeleteSubTaskResponse(
                deleted=response.data or [],
            ),
            message="Subtarefa deletada com sucesso.",
        )

    except AppException:
        raise

    except Exception:
        raise AppException(
            message="Erro ao deletar subtarefa.",
            http_code=500,
            error_code="SUBTASK_DELETE_ERROR",
        )