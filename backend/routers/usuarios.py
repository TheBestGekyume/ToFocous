import os
import httpx

from fastapi import APIRouter, Depends, HTTPException
from backend.core.config import settings
from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db
from backend.dependencies.auth import get_bearer_token
from backend.models.usuarios import (
    UpdateUsuario,
    UpdateSenha,
    ResetSenha,
    UpdateEmail,
)

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_ANON_KEY = settings.SUPABASE_ANON_KEY
FRONTEND_URL = settings.FRONTEND_URL    



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
    
@router.patch("/me/password")
async def update_my_password(
    data: UpdateSenha,
    current_user=Depends(get_current_user),
    access_token: str = Depends(get_bearer_token),
):
    try:
        if data.new_password != data.confirm_new_password:
            raise HTTPException(
                status_code=400,
                detail="A nova senha e a confirmação da nova senha não conferem."
            )

        if data.current_password == data.new_password:
            raise HTTPException(
                status_code=400,
                detail="A nova senha não pode ser igual à senha atual."
            )

        user_email = current_user.email

        if not user_email:
            raise HTTPException(
                status_code=400,
                detail="Não foi possível identificar o email do usuário autenticado."
            )

        login_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"

        login_headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
        }

        login_payload = {
            "email": user_email,
            "password": data.current_password
        }

        async with httpx.AsyncClient(timeout=20) as client:
            login_response = await client.post(
                login_url,
                headers=login_headers,
                json=login_payload
            )

        if login_response.status_code >= 400:
            raise HTTPException(
                status_code=400,
                detail="Senha atual incorreta."
            )

        update_url = f"{SUPABASE_URL}/auth/v1/user"

        update_headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        update_payload = {
            "password": data.new_password
        }

        async with httpx.AsyncClient(timeout=20) as client:
            update_response = await client.put(
                update_url,
                headers=update_headers,
                json=update_payload
            )

        if update_response.status_code >= 400:
            raise HTTPException(
                status_code=update_response.status_code,
                detail=update_response.json()
            )

        return {
            "message": "Senha atualizada com sucesso."
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/reset-password")
async def request_password_reset(
    data: ResetSenha,
):
    try:
        url = f"{SUPABASE_URL}/auth/v1/recover"

        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
        }

        payload = {
            "email": data.email,
            "redirect_to": f"{FRONTEND_URL}/reset-password"
        }

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(url, headers=headers, json=payload)

        if response.status_code >= 400:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()
            )

        return {
            "message": "Se o email estiver cadastrado, enviaremos instruções para redefinir a senha."
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.patch("/me/email")
async def update_my_email(
    data: UpdateEmail,
    current_user=Depends(get_current_user),
    access_token: str = Depends(get_bearer_token),
):
    try:
        url = f"{SUPABASE_URL}/auth/v1/user"

        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        payload = {
            "email": data.email
        }

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.put(url, headers=headers, json=payload)

        if response.status_code >= 400:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()
            )

        return {
            "message": "Solicitação de troca de email enviada. Verifique o novo email para confirmar a alteração."
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    