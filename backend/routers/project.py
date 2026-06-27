from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from backend.dependencies.supabase import get_db
from backend.dependencies.auth import get_current_user
from backend.models.project import (
    DeleteProjectResponse,
    PatchProject,
    PostProject,
    ProjectListResponse,
    ProjectResponse,
)
from backend.core.responses import ApiResponse, created, failure, success


router = APIRouter(prefix="/projects", tags=["Projects"])


def api_response(response: ApiResponse):
    return JSONResponse(
        status_code=response.http_code,
        content=jsonable_encoder(response),
    )


def build_project_response(project: dict, current_user) -> ProjectResponse:
    return ProjectResponse(
        id=project["id"],
        title=project["title"],
        description=project.get("description"),
        color=project.get("color"),
        is_owner=project["user_id"] == current_user.id,
    )


def get_project_by_id_from_db(
    supabase,
    project_id: str,
) -> dict | None:
    response = (
        supabase
        .table("projects")
        .select("*")
        .eq("id", project_id)
        .execute()
    )

    projects = response.data or []

    if not projects:
        return None

    return projects[0]


def user_has_project_access(
    supabase,
    project: dict,
    current_user,
) -> bool:
    if project["user_id"] == current_user.id:
        return True

    membership_response = (
        supabase
        .table("project_users")
        .select("id")
        .eq("project_id", project["id"])
        .eq("user_id", current_user.id)
        .execute()
    )

    return len(membership_response.data or []) > 0


@router.post(
    "/",
    response_model=ApiResponse[ProjectResponse],
)
def post_project(
    data: PostProject,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        postdata = data.model_dump(mode="json")
        postdata["user_id"] = current_user.id

        response = (
            supabase
            .table("projects")
            .insert(postdata)
            .execute()
        )

        if not response.data:
            return api_response(
                failure(
                    message="Não foi possível criar o projeto.",
                    http_code=400,
                    error_code="PROJECT_CREATE_ERROR",
                )
            )

        project = response.data[0]

        return api_response(
            created(
                content=build_project_response(
                    project=project,
                    current_user=current_user,
                ),
                message="Projeto criado com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="PROJECT_CREATE_ERROR",
            )
        )


@router.get(
    "/{project_id}/",
    response_model=ApiResponse[ProjectResponse],
)
def get_project_by_id(
    project_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        project = get_project_by_id_from_db(
            supabase=supabase,
            project_id=project_id,
        )

        if not project:
            return api_response(
                failure(
                    message="Projeto não encontrado.",
                    http_code=404,
                    error_code="PROJECT_NOT_FOUND",
                )
            )

        if not user_has_project_access(
            supabase=supabase,
            project=project,
            current_user=current_user,
        ):
            return api_response(
                failure(
                    message="Você não tem acesso a este projeto.",
                    http_code=403,
                    error_code="PROJECT_ACCESS_DENIED",
                )
            )

        return api_response(
            success(
                content=build_project_response(
                    project=project,
                    current_user=current_user,
                ),
                message="Projeto encontrado com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="PROJECT_GET_ERROR",
            )
        )


@router.get(
    "/",
    response_model=ApiResponse[ProjectListResponse],
)
def get_projects(
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        owned_projects_response = (
            supabase
            .table("projects")
            .select("*")
            .eq("user_id", current_user.id)
            .execute()
        )

        owned_projects = owned_projects_response.data or []

        memberships_response = (
            supabase
            .table("project_users")
            .select("project_id")
            .eq("user_id", current_user.id)
            .execute()
        )

        project_ids = [
            membership["project_id"]
            for membership in memberships_response.data or []
        ]

        member_projects = []

        if project_ids:
            member_projects_response = (
                supabase
                .table("projects")
                .select("*")
                .in_("id", project_ids)
                .execute()
            )

            member_projects = member_projects_response.data or []

        projects_by_id = {}

        for project in owned_projects + member_projects:
            projects_by_id[project["id"]] = project

        projects = [
            build_project_response(
                project=project,
                current_user=current_user,
            )
            for project in projects_by_id.values()
        ]

        return api_response(
            success(
                content=ProjectListResponse(
                    projects=projects,
                ),
                message="Projetos listados com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="PROJECT_LIST_ERROR",
            )
        )


@router.patch(
    "/{project_id}/",
    response_model=ApiResponse[ProjectResponse],
)
def patch_project(
    project_id: str,
    data: PatchProject,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        patchdata = data.model_dump(exclude_none=True, mode="json")

        if not patchdata:
            return api_response(
                success(
                    content=None,
                    message="Nenhuma alteração feita.",
                )
            )

        project = get_project_by_id_from_db(
            supabase=supabase,
            project_id=project_id,
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
                    message="Apenas o dono do projeto pode atualizar este projeto.",
                    http_code=403,
                    error_code="ONLY_PROJECT_OWNER_CAN_UPDATE",
                )
            )

        response = (
            supabase
            .table("projects")
            .update(patchdata)
            .eq("id", project_id)
            .execute()
        )

        if not response.data:
            return api_response(
                failure(
                    message="Não foi possível atualizar o projeto.",
                    http_code=400,
                    error_code="PROJECT_UPDATE_ERROR",
                )
            )

        updated_project = response.data[0]

        return api_response(
            success(
                content=build_project_response(
                    project=updated_project,
                    current_user=current_user,
                ),
                message="Projeto atualizado com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="PROJECT_UPDATE_ERROR",
            )
        )


@router.delete(
    "/{project_id}/",
    response_model=ApiResponse[DeleteProjectResponse],
)
def delete_project(
    project_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        project = get_project_by_id_from_db(
            supabase=supabase,
            project_id=project_id,
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
                    message="Apenas o dono do projeto pode deletar este projeto.",
                    http_code=403,
                    error_code="ONLY_PROJECT_OWNER_CAN_DELETE",
                )
            )

        response = (
            supabase
            .table("projects")
            .delete()
            .eq("id", project_id)
            .execute()
        )

        if not response.data:
            return api_response(
                failure(
                    message="Não foi possível deletar o projeto.",
                    http_code=400,
                    error_code="PROJECT_DELETE_ERROR",
                )
            )

        return api_response(
            success(
                content=DeleteProjectResponse(
                    deleted=response.data or [],
                ),
                message="Projeto deletado com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="PROJECT_DELETE_ERROR",
            )
        )