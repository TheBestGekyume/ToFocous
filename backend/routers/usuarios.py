from fastapi import APIRouter, Depends, HTTPException
from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db
from backend.models.usuarios import UpdateUsuario

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


@router.get("/me/")
def get_my_user(
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        response = (
            supabase.table("usuarios")
            .select("id, name, created_at")
            .eq("id", current_user.id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado na tabela usuarios."
            )

        return {
            "message": "Usuário encontrado com sucesso.",
            "data": response.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/me/")
def update_my_user(
    data: UpdateUsuario,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        name = data.name.strip()

        if not name:
            raise HTTPException(
                status_code=400,
                detail="O nome não pode ser vazio."
            )

        response = (
            supabase.table("usuarios")
            .update({"name": name})
            .eq("id", current_user.id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado na tabela usuarios."
            )

        return {
            "message": "Nome atualizado com sucesso.",
            "data": response.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))