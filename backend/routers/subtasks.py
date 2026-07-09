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


def parse_date_value(value):
    if not value:
        return None

    if hasattr(value, "isoformat") and not isinstance(value, str):
        value = value.isoformat()

    value = str(value)

    try:
        return datetime.strptime(value[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def parse_time_value(value):
    if not value:
        return None

    if isinstance(value, time_type):
        return value

    value = str(value)
    value = value.split("+")[0]
    value = value.split(".")[0]

    if "T" in value:
        value = value.replace("Z", "")

        try:
            return datetime.fromisoformat(value).time()
        except ValueError:
            return None

    for time_format in ("%H:%M:%S", "%H:%M"):
        try:
            return datetime.strptime(value, time_format).time()
        except ValueError:
            continue

    return None


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
        .select("*")
        .eq("id", task_id)
        .eq("user_id", user_id)
        .execute()
    )

    tasks = response.data or []

    if not tasks:
        return None

    return tasks[0]


def get_subtask_by_id_from_db(
    supabase,
    subtask_id: str,
    task_id: str,
) -> dict | None:
    response = (
        supabase
        .table("subtasks")
        .select("*")
        .eq("id", subtask_id)
        .eq("task_id", task_id)
        .execute()
    )

    subtasks = response.data or []

    if not subtasks:
        return None

    return subtasks[0]


def validate_subtask_dates(data: dict, settings: dict):
    use_start_date = settings.get("use_start_date", True)
    use_time = settings.get("use_time", True)

    start_date = parse_date_value(data.get("start_date")) if use_start_date else None
    due_date = parse_date_value(data.get("due_date"))

    start_time = parse_time_value(data.get("start_time")) if use_start_date and use_time else None
    due_time = parse_time_value(data.get("due_time")) if use_time else None

    if use_start_date and start_date and due_date and due_date < start_date:
        raise AppException(
            message="A data de entrega da subtarefa deve ser posterior ou igual à data de início.",
            http_code=400,
            error_code="INVALID_SUBTASK_DUE_DATE",
        )

    if (
        use_start_date
        and use_time
        and start_date
        and due_date
        and start_date == due_date
        and start_time
        and due_time
        and due_time <= start_time
    ):
        raise AppException(
            message="O horário de entrega da subtarefa deve ser posterior ao horário de início quando as datas são iguais.",
            http_code=400,
            error_code="INVALID_SUBTASK_DUE_TIME",
        )


def validate_subtask_inside_task(subtask_data: dict, task: dict, settings: dict):
    use_start_date = settings.get("use_start_date", True)
    use_time = settings.get("use_time", True)

    subtask_start_date = (
        parse_date_value(subtask_data.get("start_date"))
        if use_start_date
        else None
    )
    subtask_due_date = parse_date_value(subtask_data.get("due_date"))

    subtask_start_time = (
        parse_time_value(subtask_data.get("start_time"))
        if use_start_date and use_time
        else None
    )
    subtask_due_time = (
        parse_time_value(subtask_data.get("due_time"))
        if use_time
        else None
    )

    task_start_date = (
        parse_date_value(task.get("start_date"))
        if use_start_date
        else None
    )
    task_due_date = parse_date_value(task.get("due_date"))

    task_start_time = (
        parse_time_value(task.get("start_time"))
        if use_start_date and use_time
        else None
    )
    task_due_time = (
        parse_time_value(task.get("due_time"))
        if use_time
        else None
    )

    if use_start_date and task_start_date and subtask_start_date:
        if subtask_start_date < task_start_date:
            raise AppException(
                message="A data de início da subtarefa não pode ser anterior à data de início da tarefa pai.",
                http_code=400,
                error_code="SUBTASK_START_BEFORE_TASK_START",
            )

        if (
            use_time
            and subtask_start_date == task_start_date
            and task_start_time
            and subtask_start_time
            and subtask_start_time < task_start_time
        ):
            raise AppException(
                message="O horário de início da subtarefa não pode ser anterior ao horário de início da tarefa pai.",
                http_code=400,
                error_code="SUBTASK_START_TIME_BEFORE_TASK_START_TIME",
            )

    if task_due_date and subtask_due_date:
        if subtask_due_date > task_due_date:
            raise AppException(
                message="A data de entrega da subtarefa não pode ser posterior à data de entrega da tarefa pai.",
                http_code=400,
                error_code="SUBTASK_DUE_AFTER_TASK_DUE",
            )

        if (
            use_time
            and subtask_due_date == task_due_date
            and task_due_time
            and subtask_due_time
            and subtask_due_time > task_due_time
        ):
            raise AppException(
                message="O horário de entrega da subtarefa não pode ser posterior ao horário de entrega da tarefa pai.",
                http_code=400,
                error_code="SUBTASK_DUE_TIME_AFTER_TASK_DUE_TIME",
            )

    if use_start_date and task_due_date and subtask_start_date:
        if subtask_start_date > task_due_date:
            raise AppException(
                message="A data de início da subtarefa não pode ser posterior à data de entrega da tarefa pai.",
                http_code=400,
                error_code="SUBTASK_START_AFTER_TASK_DUE",
            )

        if (
            use_time
            and subtask_start_date == task_due_date
            and task_due_time
            and subtask_start_time
            and subtask_start_time > task_due_time
        ):
            raise AppException(
                message="O horário de início da subtarefa não pode ser posterior ao horário de entrega da tarefa pai.",
                http_code=400,
                error_code="SUBTASK_START_TIME_AFTER_TASK_DUE_TIME",
            )

    if use_start_date and task_start_date and subtask_due_date:
        if subtask_due_date < task_start_date:
            raise AppException(
                message="A data de entrega da subtarefa não pode ser anterior à data de início da tarefa pai.",
                http_code=400,
                error_code="SUBTASK_DUE_BEFORE_TASK_START",
            )

        if (
            use_time
            and subtask_due_date == task_start_date
            and task_start_time
            and subtask_due_time
            and subtask_due_time < task_start_time
        ):
            raise AppException(
                message="O horário de entrega da subtarefa não pode ser anterior ao horário de início da tarefa pai.",
                http_code=400,
                error_code="SUBTASK_DUE_TIME_BEFORE_TASK_START_TIME",
            )


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

        settings = get_task_settings_from_db(
            supabase=supabase,
            user_id=current_user.id,
        )

        validate_subtask_dates(subtask_data, settings)
        validate_subtask_inside_task(subtask_data, task, settings)

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

        subtask = get_subtask_by_id_from_db(
            supabase=supabase,
            subtask_id=subtask_id,
            task_id=task_id,
        )

        if not subtask:
            raise AppException(
                message="Subtarefa não encontrada.",
                http_code=404,
                error_code="SUBTASK_NOT_FOUND",
            )

        merged_subtask_data = subtask.copy()
        merged_subtask_data.update(patchdata)

        settings = get_task_settings_from_db(
            supabase=supabase,
            user_id=current_user.id,
        )

        validate_subtask_dates(merged_subtask_data, settings)
        validate_subtask_inside_task(merged_subtask_data, task, settings)

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

        updated_subtask = response.data[0]

        return success(
            content=build_subtask_response(updated_subtask),
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
    

def get_task_settings_from_db(
    supabase,
    user_id: str,
) -> dict:
    response = (
        supabase
        .table("task_settings")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )

    settings = response.data or []

    if not settings:
        raise AppException(
            message="Configurações de tarefas não encontradas.",
            http_code=404,
            error_code="SETTINGS_NOT_FOUND",
        )

    return settings[0]