import httpx
from fastapi import APIRouter, Depends, HTTPException
from backend.core.config import settings
from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db
from backend.models.project_user import PostProjectUser, DeleteProjectUser
from pydantic import BaseModel

router = APIRouter(prefix="/project-users", tags=["Project Users"])

SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY = settings.SUPABASE_SERVICE_ROLE_KEY


@router.get("/{project_id}/")
async def get_project_users(
    project_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        project_response = supabase.table("projects") \
            .select("id, user_id") \
            .eq("id", project_id) \
            .execute()

        if not project_response.data:
            raise HTTPException(
                status_code=404,
                detail="Projeto não encontrado."
            )

        project = project_response.data[0]

        is_owner = project["user_id"] == current_user.id

        membership_response = supabase.table("project_users") \
            .select("id") \
            .eq("project_id", project_id) \
            .eq("user_id", current_user.id) \
            .execute()

        is_member = len(membership_response.data) > 0

        if not is_owner and not is_member:
            raise HTTPException(
                status_code=403,
                detail="Você não tem acesso a este projeto."
            )

        project_users_response = supabase.table("project_users") \
            .select("id, project_id, user_id") \
            .eq("project_id", project_id) \
            .execute()

        users_with_auth_data = []

        for project_user in project_users_response.data:
            auth_user = await get_auth_user_by_id(project_user["user_id"])
            display_name = get_display_name_from_auth_user(auth_user)

            users_with_auth_data.append({
                **project_user,
                "user": {
                    "id": auth_user.get("id"),
                    "name": display_name
                }
            })

        return {
            "message": "Usuários do projeto listados com sucesso.",
            "data": users_with_auth_data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/")
async def add_project_user(
    data: PostProjectUser,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        project_response = supabase.table("projects") \
            .select("id, user_id") \
            .eq("id", data.project_id) \
            .execute()

        if not project_response.data:
            raise HTTPException(
                status_code=404,
                detail="Projeto não encontrado."
            )

        project = project_response.data[0]

        if project["user_id"] != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Apenas o dono do projeto pode adicionar contribuidores."
            )

        existing_response = supabase.table("project_users") \
            .select("id") \
            .eq("project_id", data.project_id) \
            .eq("user_id", data.user_id) \
            .execute()

        if existing_response.data:
            raise HTTPException(
                status_code=409,
                detail="Usuário já está vinculado ao projeto."
            )

        auth_user = await get_auth_user_by_id(data.user_id)

        display_name = get_display_name_from_auth_user(auth_user)

        insert_data = {
            "project_id": data.project_id,
            "user_id": data.user_id
        }

        response = supabase.table("project_users") \
            .insert(insert_data) \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=400,
                detail="Não foi possível adicionar o usuário ao projeto."
            )

        return {
            "message": "Usuário adicionado ao projeto com sucesso.",
            "data": {
                **response.data[0],
                "user": {
                    "id": auth_user.get("id"),
                    "name": display_name                }
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.delete("/")
def remove_project_user(
    data: DeleteProjectUser,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        project_response = supabase.table("projects") \
            .select("id, user_id") \
            .eq("id", data.project_id) \
            .execute()

        if not project_response.data:
            raise HTTPException(status_code=404, detail="Projeto não encontrado.")

        project = project_response.data[0]

        if project["user_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Apenas o dono do projeto pode remover contribuidores.")

        if data.user_id == project["user_id"]:
            raise HTTPException(status_code=400, detail="O dono do projeto não pode ser removido.")

        existing_response = supabase.table("project_users") \
            .select("id") \
            .eq("project_id", data.project_id) \
            .eq("user_id", data.user_id) \
            .execute()

        if not existing_response.data:
            raise HTTPException(status_code=404, detail="Usuário não está vinculado a este projeto.")

        response = supabase.table("project_users") \
            .delete() \
            .eq("project_id", data.project_id) \
            .eq("user_id", data.user_id) \
            .execute()

        return {
            "message": "Usuário removido do projeto com sucesso.",
            "data": response.data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/leave/{project_id}")
def leave_project(
    project_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        project_response = supabase.table("projects") \
            .select("id, user_id") \
            .eq("id", project_id) \
            .execute()

        if not project_response.data:
            raise HTTPException(status_code=404, detail="Projeto não encontrado.")

        project = project_response.data[0]

        if project["user_id"] == current_user.id:
            raise HTTPException(
                status_code=400,
                detail="O dono do projeto não pode sair do próprio projeto."
            )

        membership_response = supabase.table("project_users") \
            .select("id") \
            .eq("project_id", project_id) \
            .eq("user_id", current_user.id) \
            .execute()

        if not membership_response.data:
            raise HTTPException(
                status_code=404,
                detail="Você não faz parte deste projeto."
            )

        response = supabase.table("project_users") \
            .delete() \
            .eq("project_id", project_id) \
            .eq("user_id", current_user.id) \
            .execute()

        return {
            "message": "Você saiu do projeto com sucesso.",
            "data": response.data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def safe_response_detail(response: httpx.Response):
    try:
        return response.json()
    except Exception:
        return response.text


async def get_auth_user_by_id(user_id: str):
    url = f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}"

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            url,
            headers=headers
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=safe_response_detail(response)
        )

    return response.json()


def get_display_name_from_auth_user(auth_user: dict):
    user_metadata = auth_user.get("user_metadata") or {}

    return (
        user_metadata.get("display_name")
        or user_metadata.get("name")
        or user_metadata.get("full_name")
        or "Usuário sem nome"
    )