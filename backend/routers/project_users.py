from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db
from backend.models.project_user import (
    DeleteProjectUser,
    DeleteProjectUserResponse,
    PostProjectUser,
    ProjectUserListResponse,
    ProjectUserResponse,
    UsuarioResumoResponse,
)
from backend.core.responses import ApiResponse, created, failure, success


router = APIRouter(prefix="/project-users", tags=["Project Users"])


def api_response(response: ApiResponse):
    return JSONResponse(
        status_code=response.http_code,
        content=jsonable_encoder(response),
    )


@router.get(
    "/{project_id}/",
    response_model=ApiResponse[ProjectUserListResponse],
)
def get_project_users(
    project_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        project_response = (
            supabase
            .table("projects")
            .select("id, user_id")
            .eq("id", project_id)
            .execute()
        )

        if not project_response.data:
            return api_response(
                failure(
                    message="Projeto não encontrado.",
                    http_code=404,
                    error_code="PROJECT_NOT_FOUND",
                )
            )

        project = project_response.data[0]

        is_owner = project["user_id"] == current_user.id

        membership_response = (
            supabase
            .table("project_users")
            .select("id")
            .eq("project_id", project_id)
            .eq("user_id", current_user.id)
            .execute()
        )

        is_member = len(membership_response.data or []) > 0

        if not is_owner and not is_member:
            return api_response(
                failure(
                    message="Você não tem acesso a este projeto.",
                    http_code=403,
                    error_code="PROJECT_ACCESS_DENIED",
                )
            )

        project_users_response = (
            supabase
            .table("project_users")
            .select("id, project_id, user_id")
            .eq("project_id", project_id)
            .execute()
        )

        project_users = project_users_response.data or []

        user_ids = [
            project_user["user_id"]
            for project_user in project_users
        ]

        usuarios_by_id = get_usuarios_by_ids(
            supabase=supabase,
            user_ids=user_ids,
        )

        users_with_usuario_data: list[ProjectUserResponse] = []

        for project_user in project_users:
            usuario = usuarios_by_id.get(project_user["user_id"])

            users_with_usuario_data.append(
                ProjectUserResponse(
                    id=project_user["id"],
                    project_id=project_user["project_id"],
                    user_id=project_user["user_id"],
                    user=UsuarioResumoResponse(
                        id=project_user["user_id"],
                        name=usuario.get("name") if usuario else "Usuário sem nome",
                        email=usuario.get("email") if usuario else None,
                    ),
                )
            )

        return api_response(
            success(
                content=ProjectUserListResponse(
                    users=users_with_usuario_data,
                ),
                message="Usuários do projeto listados com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="PROJECT_USERS_LIST_ERROR",
            )
        )


@router.post(
    "/",
    response_model=ApiResponse[ProjectUserResponse],
)
def add_project_user(
    data: PostProjectUser,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        project_response = (
            supabase
            .table("projects")
            .select("id, user_id")
            .eq("id", data.project_id)
            .execute()
        )

        if not project_response.data:
            return api_response(
                failure(
                    message="Projeto não encontrado.",
                    http_code=404,
                    error_code="PROJECT_NOT_FOUND",
                )
            )

        project = project_response.data[0]

        if project["user_id"] != current_user.id:
            return api_response(
                failure(
                    message="Apenas o dono do projeto pode adicionar contribuidores.",
                    http_code=403,
                    error_code="ONLY_PROJECT_OWNER_CAN_ADD_USERS",
                )
            )

        usuario_response = (
            supabase
            .table("usuarios")
            .select("id, name, email")
            .eq("id", data.user_id)
            .execute()
        )

        if not usuario_response.data:
            return api_response(
                failure(
                    message="Usuário não encontrado.",
                    http_code=404,
                    error_code="USER_NOT_FOUND",
                )
            )

        usuario = usuario_response.data[0]

        existing_response = (
            supabase
            .table("project_users")
            .select("id")
            .eq("project_id", data.project_id)
            .eq("user_id", data.user_id)
            .execute()
        )

        if existing_response.data:
            return api_response(
                failure(
                    message="Usuário já está vinculado ao projeto.",
                    http_code=409,
                    error_code="USER_ALREADY_LINKED_TO_PROJECT",
                )
            )

        insert_data = {
            "project_id": data.project_id,
            "user_id": data.user_id,
        }

        response = (
            supabase
            .table("project_users")
            .insert(insert_data)
            .execute()
        )

        if not response.data:
            return api_response(
                failure(
                    message="Não foi possível adicionar o usuário ao projeto.",
                    http_code=400,
                    error_code="PROJECT_USER_CREATE_ERROR",
                )
            )

        created_project_user = response.data[0]

        return api_response(
            created(
                content=ProjectUserResponse(
                    id=created_project_user["id"],
                    project_id=created_project_user["project_id"],
                    user_id=created_project_user["user_id"],
                    user=UsuarioResumoResponse(
                        id=usuario["id"],
                        name=usuario["name"],
                        email=usuario.get("email"),
                    ),
                ),
                message="Usuário adicionado ao projeto com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="PROJECT_USER_CREATE_ERROR",
            )
        )


@router.delete(
    "/",
    response_model=ApiResponse[DeleteProjectUserResponse],
)
def remove_project_user(
    data: DeleteProjectUser,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        project_response = (
            supabase
            .table("projects")
            .select("id, user_id")
            .eq("id", data.project_id)
            .execute()
        )

        if not project_response.data:
            return api_response(
                failure(
                    message="Projeto não encontrado.",
                    http_code=404,
                    error_code="PROJECT_NOT_FOUND",
                )
            )

        project = project_response.data[0]

        if project["user_id"] != current_user.id:
            return api_response(
                failure(
                    message="Apenas o dono do projeto pode remover contribuidores.",
                    http_code=403,
                    error_code="ONLY_PROJECT_OWNER_CAN_REMOVE_USERS",
                )
            )

        if data.user_id == project["user_id"]:
            return api_response(
                failure(
                    message="O dono do projeto não pode ser removido.",
                    http_code=400,
                    error_code="PROJECT_OWNER_CANNOT_BE_REMOVED",
                )
            )

        existing_response = (
            supabase
            .table("project_users")
            .select("id")
            .eq("project_id", data.project_id)
            .eq("user_id", data.user_id)
            .execute()
        )

        if not existing_response.data:
            return api_response(
                failure(
                    message="Usuário não está vinculado a este projeto.",
                    http_code=404,
                    error_code="PROJECT_USER_NOT_FOUND",
                )
            )

        response = (
            supabase
            .table("project_users")
            .delete()
            .eq("project_id", data.project_id)
            .eq("user_id", data.user_id)
            .execute()
        )

        return api_response(
            success(
                content=DeleteProjectUserResponse(
                    deleted=response.data or [],
                ),
                message="Usuário removido do projeto com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="PROJECT_USER_DELETE_ERROR",
            )
        )


@router.delete(
    "/leave/{project_id}",
    response_model=ApiResponse[DeleteProjectUserResponse],
)
def leave_project(
    project_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        project_response = (
            supabase
            .table("projects")
            .select("id, user_id")
            .eq("id", project_id)
            .execute()
        )

        if not project_response.data:
            return api_response(
                failure(
                    message="Projeto não encontrado.",
                    http_code=404,
                    error_code="PROJECT_NOT_FOUND",
                )
            )

        project = project_response.data[0]

        if project["user_id"] == current_user.id:
            return api_response(
                failure(
                    message="O dono do projeto não pode sair do próprio projeto.",
                    http_code=400,
                    error_code="PROJECT_OWNER_CANNOT_LEAVE",
                )
            )

        membership_response = (
            supabase
            .table("project_users")
            .select("id")
            .eq("project_id", project_id)
            .eq("user_id", current_user.id)
            .execute()
        )

        if not membership_response.data:
            return api_response(
                failure(
                    message="Você não faz parte deste projeto.",
                    http_code=404,
                    error_code="PROJECT_MEMBERSHIP_NOT_FOUND",
                )
            )

        response = (
            supabase
            .table("project_users")
            .delete()
            .eq("project_id", project_id)
            .eq("user_id", current_user.id)
            .execute()
        )

        return api_response(
            success(
                content=DeleteProjectUserResponse(
                    deleted=response.data or [],
                ),
                message="Você saiu do projeto com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="PROJECT_LEAVE_ERROR",
            )
        )


def get_usuarios_by_ids(
    supabase,
    user_ids: list[str],
) -> dict:
    if not user_ids:
        return {}

    response = (
        supabase
        .table("usuarios")
        .select("id, name, email")
        .in_("id", user_ids)
        .execute()
    )

    usuarios = response.data or []

    return {
        usuario["id"]: usuario
        for usuario in usuarios
    }