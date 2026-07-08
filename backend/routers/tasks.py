from datetime import datetime
from datetime import time as time_type

from fastapi import APIRouter, Depends

from backend.core.excepcions import AppException
from backend.core.responses import ApiResponse, created, success
from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db
from backend.models.task import (
    DeleteTaskResponse,
    PatchTask,
    PostTask,
    TaskListResponse,
    TaskResponse,
)


router = APIRouter(prefix="/tasks", tags=["Tasks"])


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


def get_project_by_id(
    supabase,
    project_id: str,
) -> dict | None:
    response = (
        supabase
        .table("projects")
        .select("id, user_id")
        .eq("id", project_id)
        .execute()
    )

    projects = response.data or []

    if not projects:
        return None

    return projects[0]


def user_has_project_access(
    supabase,
    project_id: str,
    user_id: str,
) -> bool:
    project = get_project_by_id(
        supabase=supabase,
        project_id=project_id,
    )

    if not project:
        return False

    if project["user_id"] == user_id:
        return True

    membership_response = (
        supabase
        .table("project_users")
        .select("id")
        .eq("project_id", project_id)
        .eq("user_id", user_id)
        .execute()
    )

    return len(membership_response.data or []) > 0


def get_task_by_id_from_db(
    supabase,
    task_id: str,
) -> dict | None:
    response = (
        supabase
        .table("tasks")
        .select("*")
        .eq("id", task_id)
        .execute()
    )

    tasks = response.data or []

    if not tasks:
        return None

    return tasks[0]


@router.post(
    "/",
    response_model=ApiResponse[TaskResponse],
    status_code=201,
)
def post_task(
    data: PostTask,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        postdata = data.model_dump(mode="json")
        postdata["user_id"] = current_user.id

        validate_task_dates(postdata)

        project_id = postdata.get("project_id")

        if project_id:
            project = get_project_by_id(
                supabase=supabase,
                project_id=project_id,
            )

            if not project:
                raise AppException(
                    message="Projeto não encontrado.",
                    http_code=404,
                    error_code="PROJECT_NOT_FOUND",
                )

            if not user_has_project_access(
                supabase=supabase,
                project_id=project_id,
                user_id=current_user.id,
            ):
                raise AppException(
                    message="Você não tem acesso a este projeto.",
                    http_code=403,
                    error_code="PROJECT_ACCESS_DENIED",
                )

        response = (
            supabase
            .table("tasks")
            .insert(postdata)
            .execute()
        )

        if not response.data:
            raise AppException(
                message="Não foi possível criar a tarefa.",
                http_code=400,
                error_code="TASK_CREATE_ERROR",
            )

        task = response.data[0]

        return created(
            content=build_task_response(task),
            message="Tarefa criada com sucesso.",
        )

    except AppException:
        raise

    except Exception:
        raise AppException(
            message="Erro ao criar tarefa.",
            http_code=500,
            error_code="TASK_CREATE_ERROR",
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
        task = get_task_by_id_from_db(
            supabase=supabase,
            task_id=task_id,
        )

        if not task:
            raise AppException(
                message="Tarefa não encontrada.",
                http_code=404,
                error_code="TASK_NOT_FOUND",
            )

        if not user_has_project_access(
            supabase=supabase,
            project_id=task["project_id"],
            user_id=current_user.id,
        ):
            raise AppException(
                message="Você não tem acesso a esta tarefa.",
                http_code=403,
                error_code="TASK_ACCESS_DENIED",
            )

        return success(
            content=build_task_response(task),
            message="Tarefa encontrada com sucesso.",
        )

    except AppException:
        raise

    except Exception:
        raise AppException(
            message="Erro ao buscar tarefa.",
            http_code=500,
            error_code="TASK_GET_ERROR",
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
            project = get_project_by_id(
                supabase=supabase,
                project_id=project_id,
            )

            if not project:
                raise AppException(
                    message="Projeto não encontrado.",
                    http_code=404,
                    error_code="PROJECT_NOT_FOUND",
                )

            if not user_has_project_access(
                supabase=supabase,
                project_id=project_id,
                user_id=current_user.id,
            ):
                raise AppException(
                    message="Você não tem acesso a este projeto.",
                    http_code=403,
                    error_code="PROJECT_ACCESS_DENIED",
                )

            query = query.eq("project_id", project_id)

        else:
            query = query.eq("user_id", current_user.id)

        response = query.execute()

        tasks = [
            build_task_response(task)
            for task in response.data or []
        ]

        return success(
            content=TaskListResponse(
                tasks=tasks,
            ),
            message="Tarefas listadas com sucesso.",
        )

    except AppException:
        raise

    except Exception:
        raise AppException(
            message="Erro ao listar tarefas.",
            http_code=500,
            error_code="TASK_LIST_ERROR",
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
            return success(
                content=None,
                message="Nenhuma alteração feita.",
            )

        task = get_task_by_id_from_db(
            supabase=supabase,
            task_id=task_id,
        )

        if not task:
            raise AppException(
                message="Tarefa não encontrada.",
                http_code=404,
                error_code="TASK_NOT_FOUND",
            )

        if not user_has_project_access(
            supabase=supabase,
            project_id=task["project_id"],
            user_id=current_user.id,
        ):
            raise AppException(
                message="Você não tem permissão para editar esta tarefa.",
                http_code=403,
                error_code="TASK_EDIT_DENIED",
            )

        merged_task_data = {
            **task,
            **patchdata,
        }

        validate_task_dates(merged_task_data)

        response = (
            supabase
            .table("tasks")
            .update(patchdata)
            .eq("id", task_id)
            .execute()
        )

        if not response.data:
            raise AppException(
                message="Não foi possível atualizar a tarefa.",
                http_code=400,
                error_code="TASK_UPDATE_ERROR",
            )

        updated_task = response.data[0]

        return success(
            content=build_task_response(updated_task),
            message="Alterações feitas com sucesso.",
        )

    except AppException:
        raise

    except Exception:
        raise AppException(
            message="Erro ao atualizar tarefa.",
            http_code=500,
            error_code="TASK_UPDATE_ERROR",
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
        task = get_task_by_id_from_db(
            supabase=supabase,
            task_id=task_id,
        )

        if not task:
            raise AppException(
                message="Tarefa não encontrada.",
                http_code=404,
                error_code="TASK_NOT_FOUND",
            )

        if not user_has_project_access(
            supabase=supabase,
            project_id=task["project_id"],
            user_id=current_user.id,
        ):
            raise AppException(
                message="Você não tem permissão para deletar esta tarefa.",
                http_code=403,
                error_code="TASK_DELETE_DENIED",
            )

        response = (
            supabase
            .table("tasks")
            .delete()
            .eq("id", task_id)
            .execute()
        )

        if not response.data:
            raise AppException(
                message="Não foi possível deletar a tarefa.",
                http_code=400,
                error_code="TASK_DELETE_ERROR",
            )

        return success(
            content=DeleteTaskResponse(
                deleted=response.data or [],
            ),
            message="Tarefa deletada com sucesso.",
        )

    except AppException:
        raise

    except Exception:
        raise AppException(
            message="Erro ao deletar tarefa.",
            http_code=500,
            error_code="TASK_DELETE_ERROR",
        )


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


def validate_task_dates(data: dict):
    start_date = parse_date_value(data.get("start_date"))
    due_date = parse_date_value(data.get("due_date"))

    start_time = parse_time_value(data.get("start_time"))
    due_time = parse_time_value(data.get("due_time"))

    if start_date and due_date and due_date < start_date:
        raise AppException(
            message="A data de entrega deve ser posterior ou igual à data de início.",
            http_code=400,
            error_code="INVALID_TASK_DUE_DATE",
        )

    if (
        start_date
        and due_date
        and start_date == due_date
        and start_time
        and due_time
        and due_time <= start_time
    ):
        raise AppException(
            message="O horário de entrega deve ser posterior ao horário de início quando as datas são iguais.",
            http_code=400,
            error_code="INVALID_TASK_DUE_TIME",
        )