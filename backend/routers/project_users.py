from fastapi import APIRouter, Depends, HTTPException
from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db
from backend.models.project_user import PostProjectUser, DeleteProjectUser
from pydantic import BaseModel

router = APIRouter(prefix="/project-users", tags=["Project Users"])


@router.get("/{project_id}")
def get_project_users(
    project_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        project_response = supabase.table("projects").select("id, user_id").eq("id", project_id).execute()

        if not project_response.data:
            raise HTTPException(status_code=404, detail="Projeto não encontrado.")

        project = project_response.data[0]

        is_owner = project["user_id"] == current_user.id

        membership_response = supabase.table("project_users").select("id").eq("project_id", project_id).eq("user_id", current_user.id).execute()

        is_member = len(membership_response.data) > 0

        if not is_owner and not is_member:
            raise HTTPException(status_code=403, detail="Você não tem acesso a este projeto.")

        users_response = supabase.table("project_users").select("*").eq("project_id", project_id).execute()

        return {
            "message": "Usuários do projeto listados com sucesso.",
            "data": users_response.data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/")
def add_project_user(
    data: PostProjectUser,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        project_response = supabase.table("projects").select("id, user_id").eq("id", data.project_id).execute()

        if not project_response.data:
            raise HTTPException(status_code=404, detail="Projeto não encontrado.")

        project = project_response.data[0]

        if project["user_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Apenas o dono do projeto pode adicionar contribuidores.")

        existing_response = supabase.table("project_users") \
            .select("id") \
            .eq("project_id", data.project_id) \
            .eq("user_id", data.user_id) \
            .execute()

        if existing_response.data:
            raise HTTPException(status_code=409, detail="Usuário já está vinculado ao projeto.")

        insert_data = {
            "project_id": data.project_id,
            "user_id": data.user_id
        }

        response = supabase.table("project_users").insert(insert_data).execute()

        return {
            "message": "Usuário adicionado ao projeto com sucesso.",
            "data": response.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


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