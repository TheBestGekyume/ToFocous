from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db
from backend.models.task_assignment import (
    DeleteTaskAssignment,
    DeleteTaskAssignmentResponse,
    PostTaskAssignment,
    TaskAssignmentListResponse,
    TaskAssignmentResponse,
    UsuarioResumoResponse,
)
from backend.core.responses import ApiResponse, created, failure, success


router = APIRouter(prefix="/task-assignments", tags=["Task Assignments"])


def api_response(response: ApiResponse):
    return JSONResponse(
        status_code=response.http_code,
        content=jsonable_encoder(response),
    )


@router.get(
    "/project/{project_id}/",
    response_model=ApiResponse[TaskAssignmentListResponse],
)
def get_project_task_assignments(
    project_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        project = get_project_by_id(project_id, supabase)

        if not project:
            return api_response(
                failure(
                    message="Projeto não encontrado.",
                    http_code=404,
                    error_code="PROJECT_NOT_FOUND",
                )
            )

        if not is_project_member(project_id, current_user.id, supabase):
            return api_response(
                failure(
                    message="Você não tem acesso a este projeto.",
                    http_code=403,
                    error_code="PROJECT_ACCESS_DENIED",
                )
            )

        response = (
            supabase
            .table("task_assignments")
            .select("id, project_id, assigned_user_id, assigned_by_user_id, task_id, subtask_id, created_at")
            .eq("project_id", project_id)
            .execute()
        )

        assignments = build_assignments_response(
            assignments_data=response.data or [],
            supabase=supabase,
        )

        return api_response(
            success(
                content=TaskAssignmentListResponse(
                    assignments=assignments,
                ),
                message="Atribuições do projeto listadas com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="PROJECT_ASSIGNMENTS_LIST_ERROR",
            )
        )


@router.get(
    "/task/{task_id}/",
    response_model=ApiResponse[TaskAssignmentListResponse],
)
def get_task_assignments(
    task_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        task = get_task_by_id(task_id, supabase)

        if not task:
            return api_response(
                failure(
                    message="Task não encontrada.",
                    http_code=404,
                    error_code="TASK_NOT_FOUND",
                )
            )

        project_id = task["project_id"]

        if not is_project_member(project_id, current_user.id, supabase):
            return api_response(
                failure(
                    message="Você não tem acesso a esta task.",
                    http_code=403,
                    error_code="TASK_ACCESS_DENIED",
                )
            )

        response = (
            supabase
            .table("task_assignments")
            .select("id, project_id, assigned_user_id, assigned_by_user_id, task_id, subtask_id, created_at")
            .eq("task_id", task_id)
            .execute()
        )

        assignments = build_assignments_response(
            assignments_data=response.data or [],
            supabase=supabase,
        )

        return api_response(
            success(
                content=TaskAssignmentListResponse(
                    assignments=assignments,
                ),
                message="Atribuições da task listadas com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="TASK_ASSIGNMENTS_LIST_ERROR",
            )
        )


@router.get(
    "/subtask/{subtask_id}/",
    response_model=ApiResponse[TaskAssignmentListResponse],
)
def get_subtask_assignments(
    subtask_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        subtask = get_subtask_by_id(subtask_id, supabase)

        if not subtask:
            return api_response(
                failure(
                    message="Subtask não encontrada.",
                    http_code=404,
                    error_code="SUBTASK_NOT_FOUND",
                )
            )

        task = get_task_by_id(subtask["task_id"], supabase)

        if not task:
            return api_response(
                failure(
                    message="Task da subtask não encontrada.",
                    http_code=404,
                    error_code="TASK_NOT_FOUND",
                )
            )

        project_id = task["project_id"]

        if not is_project_member(project_id, current_user.id, supabase):
            return api_response(
                failure(
                    message="Você não tem acesso a esta subtask.",
                    http_code=403,
                    error_code="SUBTASK_ACCESS_DENIED",
                )
            )

        response = (
            supabase
            .table("task_assignments")
            .select("id, project_id, assigned_user_id, assigned_by_user_id, task_id, subtask_id, created_at")
            .eq("subtask_id", subtask_id)
            .execute()
        )

        assignments = build_assignments_response(
            assignments_data=response.data or [],
            supabase=supabase,
        )

        return api_response(
            success(
                content=TaskAssignmentListResponse(
                    assignments=assignments,
                ),
                message="Atribuições da subtask listadas com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="SUBTASK_ASSIGNMENTS_LIST_ERROR",
            )
        )


@router.post(
    "/",
    response_model=ApiResponse[TaskAssignmentResponse],
)
def add_task_assignment(
    data: PostTaskAssignment,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        project_id = resolve_assignment_project_id(
            task_id=data.task_id,
            subtask_id=data.subtask_id,
            supabase=supabase,
        )

        if not project_id:
            return api_response(
                failure(
                    message="Task ou subtask não encontrada.",
                    http_code=404,
                    error_code="ASSIGNMENT_TARGET_NOT_FOUND",
                )
            )

        project = get_project_by_id(project_id, supabase)

        if not project:
            return api_response(
                failure(
                    message="Projeto não encontrado.",
                    http_code=404,
                    error_code="PROJECT_NOT_FOUND",
                )
            )

        if project["user_id"] != current_user.id:
            return api_response(
                failure(
                    message="Apenas o dono do projeto pode atribuir membros a tasks ou subtasks.",
                    http_code=403,
                    error_code="ONLY_PROJECT_OWNER_CAN_ASSIGN",
                )
            )

        if not is_project_member(project_id, data.assigned_user_id, supabase):
            return api_response(
                failure(
                    message="O usuário atribuído precisa pertencer ao projeto.",
                    http_code=400,
                    error_code="ASSIGNED_USER_NOT_PROJECT_MEMBER",
                )
            )

        assigned_usuario = get_usuario_by_id(
            user_id=data.assigned_user_id,
            supabase=supabase,
        )

        if not assigned_usuario:
            return api_response(
                failure(
                    message="Usuário não encontrado.",
                    http_code=404,
                    error_code="USER_NOT_FOUND",
                )
            )

        assigned_by_usuario = get_usuario_by_id(
            user_id=current_user.id,
            supabase=supabase,
        )

        duplicate_query = (
            supabase
            .table("task_assignments")
            .select("id")
            .eq("assigned_user_id", data.assigned_user_id)
        )

        if data.task_id:
            duplicate_query = duplicate_query.eq("task_id", data.task_id)

        if data.subtask_id:
            duplicate_query = duplicate_query.eq("subtask_id", data.subtask_id)

        duplicate_response = duplicate_query.execute()

        if duplicate_response.data:
            return api_response(
                failure(
                    message="Este usuário já está atribuído a este item.",
                    http_code=409,
                    error_code="USER_ALREADY_ASSIGNED",
                )
            )

        insert_data = {
            "project_id": project_id,
            "assigned_user_id": data.assigned_user_id,
            "assigned_by_user_id": current_user.id,
            "task_id": data.task_id,
            "subtask_id": data.subtask_id,
        }

        response = (
            supabase
            .table("task_assignments")
            .insert(insert_data)
            .execute()
        )

        if not response.data:
            return api_response(
                failure(
                    message="Não foi possível criar a atribuição.",
                    http_code=400,
                    error_code="TASK_ASSIGNMENT_CREATE_ERROR",
                )
            )

        assignment = response.data[0]

        return api_response(
            created(
                content=build_assignment_response(
                    assignment=assignment,
                    assigned_user=assigned_usuario,
                    assigned_by_user=assigned_by_usuario,
                ),
                message="Usuário atribuído com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="TASK_ASSIGNMENT_CREATE_ERROR",
            )
        )


@router.delete(
    "/",
    response_model=ApiResponse[DeleteTaskAssignmentResponse],
)
def remove_task_assignment(
    data: DeleteTaskAssignment,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        assignment_response = (
            supabase
            .table("task_assignments")
            .select("id, project_id, assigned_user_id, assigned_by_user_id, task_id, subtask_id")
            .eq("id", data.assignment_id)
            .execute()
        )

        if not assignment_response.data:
            return api_response(
                failure(
                    message="Atribuição não encontrada.",
                    http_code=404,
                    error_code="TASK_ASSIGNMENT_NOT_FOUND",
                )
            )

        assignment = assignment_response.data[0]

        project = get_project_by_id(
            project_id=assignment["project_id"],
            supabase=supabase,
        )

        if not project:
            return api_response(
                failure(
                    message="Projeto não encontrado.",
                    http_code=404,
                    error_code="PROJECT_NOT_FOUND",
                )
            )

        if project["user_id"] != current_user.id:
            return api_response(
                failure(
                    message="Apenas o dono do projeto pode remover atribuições.",
                    http_code=403,
                    error_code="ONLY_PROJECT_OWNER_CAN_REMOVE_ASSIGNMENT",
                )
            )

        response = (
            supabase
            .table("task_assignments")
            .delete()
            .eq("id", data.assignment_id)
            .execute()
        )

        return api_response(
            success(
                content=DeleteTaskAssignmentResponse(
                    deleted=response.data or [],
                ),
                message="Atribuição removida com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="TASK_ASSIGNMENT_DELETE_ERROR",
            )
        )


def resolve_assignment_project_id(
    task_id: str | None,
    subtask_id: str | None,
    supabase,
) -> str | None:
    if task_id:
        task = get_task_by_id(task_id, supabase)

        if not task:
            return None

        return task["project_id"]

    if subtask_id:
        subtask = get_subtask_by_id(subtask_id, supabase)

        if not subtask:
            return None

        task = get_task_by_id(subtask["task_id"], supabase)

        if not task:
            return None

        return task["project_id"]

    return None


def get_project_by_id(project_id: str, supabase) -> dict | None:
    response = (
        supabase
        .table("projects")
        .select("id, user_id")
        .eq("id", project_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def get_task_by_id(task_id: str, supabase) -> dict | None:
    response = (
        supabase
        .table("tasks")
        .select("id, project_id, user_id")
        .eq("id", task_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def get_subtask_by_id(subtask_id: str, supabase) -> dict | None:
    response = (
        supabase
        .table("subtasks")
        .select("id, task_id")
        .eq("id", subtask_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def get_usuario_by_id(user_id: str, supabase) -> dict | None:
    response = (
        supabase
        .table("usuarios")
        .select("id, name, email")
        .eq("id", user_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def get_usuarios_by_ids(
    supabase,
    user_ids: list[str],
) -> dict:
    unique_user_ids = list(set(user_ids))

    if not unique_user_ids:
        return {}

    response = (
        supabase
        .table("usuarios")
        .select("id, name, email")
        .in_("id", unique_user_ids)
        .execute()
    )

    usuarios = response.data or []

    return {
        usuario["id"]: usuario
        for usuario in usuarios
    }


def build_usuario_response(
    user_id: str,
    usuario: dict | None,
) -> UsuarioResumoResponse:
    if not usuario:
        return UsuarioResumoResponse(
            id=user_id,
            name="Usuário sem nome",
            email=None,
        )

    return UsuarioResumoResponse(
        id=usuario["id"],
        name=usuario["name"],
        email=usuario.get("email"),
    )


def build_assignment_response(
    assignment: dict,
    assigned_user: dict | None,
    assigned_by_user: dict | None = None,
) -> TaskAssignmentResponse:
    return TaskAssignmentResponse(
        id=assignment["id"],
        project_id=assignment["project_id"],
        assigned_user_id=assignment["assigned_user_id"],
        assigned_by_user_id=assignment["assigned_by_user_id"],
        task_id=assignment.get("task_id"),
        subtask_id=assignment.get("subtask_id"),
        created_at=assignment.get("created_at"),
        assigned_user=build_usuario_response(
            user_id=assignment["assigned_user_id"],
            usuario=assigned_user,
        ),
        assigned_by_user=build_usuario_response(
            user_id=assignment["assigned_by_user_id"],
            usuario=assigned_by_user,
        ) if assignment.get("assigned_by_user_id") else None,
    )


def build_assignments_response(
    assignments_data: list[dict],
    supabase,
) -> list[TaskAssignmentResponse]:
    user_ids = []

    for assignment in assignments_data:
        if assignment.get("assigned_user_id"):
            user_ids.append(assignment["assigned_user_id"])

        if assignment.get("assigned_by_user_id"):
            user_ids.append(assignment["assigned_by_user_id"])

    usuarios_by_id = get_usuarios_by_ids(
        supabase=supabase,
        user_ids=user_ids,
    )

    assignments = []

    for assignment in assignments_data:
        assigned_user = usuarios_by_id.get(assignment["assigned_user_id"])
        assigned_by_user = usuarios_by_id.get(assignment["assigned_by_user_id"])

        assignments.append(
            build_assignment_response(
                assignment=assignment,
                assigned_user=assigned_user,
                assigned_by_user=assigned_by_user,
            )
        )

    return assignments


def is_project_member(
    project_id: str,
    user_id: str,
    supabase,
) -> bool:
    project = get_project_by_id(project_id, supabase)

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