import os
import httpx

from fastapi import APIRouter, Depends, HTTPException
from backend.core.config import settings
from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db
from datetime import datetime, timezone
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
):
    try:
        user_metadata = current_user.user_metadata or {}

        name = (
            user_metadata.get("name")
            or user_metadata.get("display_name")
            or user_metadata.get("full_name")
            or current_user.email
        )

        return {
            "message": "Usuário encontrado com sucesso.",
            "data": {
                "id": current_user.id,
                "name": name,
                "email": current_user.email,
                "created_at": current_user.created_at,
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.patch("/me/")
async def update_my_user(
    data: UpdateUsuario,
    access_token: str = Depends(get_bearer_token),
):
    try:
        name = data.name.strip()

        if not name:
            raise HTTPException(
                status_code=400,
                detail="O nome não pode ser vazio."
            )

        url = f"{SUPABASE_URL}/auth/v1/user"

        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        payload = {
            "data": {
                "display_name": name,
                "name": name,
                "full_name": name,
            }
        }

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.put(
                url,
                headers=headers,
                json=payload
            )

        if response.status_code >= 400:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()
            )

        supabase_user = response.json()
        user_metadata = supabase_user.get("user_metadata") or {}

        return {
            "message": "Display Name atualizado com sucesso.",
            "data": {
                "id": supabase_user.get("id"),
                "name": (
                    user_metadata.get("name")
                    or user_metadata.get("display_name")
                    or user_metadata.get("full_name")
                    or name
                ),
                "email": supabase_user.get("email"),
            }
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

        params = {
            "redirect_to": f"{FRONTEND_URL}/reset-password",
        }

        payload = {
            "email": data.email,
        }

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                url,
                headers=headers,
                params=params,
                json=payload,
            )

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
    supabase=Depends(get_db),
):
    try:
        new_email = data.email.strip().lower()
        current_email = (current_user.email or "").strip().lower()

        if current_email == new_email:
            raise HTTPException(
                status_code=400,
                detail="O novo email deve ser diferente do email atual."
            )

        identities = await get_user_identities(access_token)

        has_google_identity = any(
            identity.get("provider") == "google"
            for identity in identities
        )

        has_multiple_identities = len(identities) >= 2

        if has_google_identity and not has_multiple_identities:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Não é possível trocar o email agora porque o Google é o único método de login desta conta. "
                    "Adicione/defina um método de login por email e senha antes de trocar o email."
                )
            )

        should_unlink_google = has_google_identity and has_multiple_identities

        # Cancela solicitações antigas pendentes
        supabase.table("user_email_change_requests") \
            .update({
                "status": "cancelled",
                "cancelled_at": utc_now_iso()
            }) \
            .eq("user_id", current_user.id) \
            .eq("status", "pending") \
            .execute()

        # Cria pendência ANTES de chamar o Supabase Auth.
        # Se o Auth falhar, ela será cancelada no except específico abaixo.
        pending_response = supabase.table("user_email_change_requests") \
            .insert({
                "user_id": current_user.id,
                "old_email": current_email,
                "new_email": new_email,
                "status": "pending",
                "should_unlink_google": should_unlink_google,
                "google_unlinked": False,
            }) \
            .execute()

        if not pending_response.data:
            raise HTTPException(
                status_code=400,
                detail="Não foi possível registrar a solicitação de troca de email."
            )

        pending_id = pending_response.data[0]["id"]

        url = f"{SUPABASE_URL}/auth/v1/user"

        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        params = {
            "redirect_to": f"{FRONTEND_URL}/"
        }

        payload = {
            "email": new_email
        }

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.put(
                url,
                headers=headers,
                params=params,
                json=payload
            )

        if response.status_code >= 400:
            supabase.table("user_email_change_requests") \
                .update({
                    "status": "cancelled",
                    "cancelled_at": utc_now_iso()
                }) \
                .eq("id", pending_id) \
                .execute()

            raise HTTPException(
                status_code=response.status_code,
                detail=safe_response_detail(response)
            )

        return {
            "message": "Solicitação de troca de email enviada. Verifique o email para confirmar a alteração.",
            "new_email": new_email,
            "should_unlink_google_after_confirmation": should_unlink_google,
            "should_finalize_after_redirect": True,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/me/email/finalize")
async def finalize_email_change(
    current_user=Depends(get_current_user),
    access_token: str = Depends(get_bearer_token),
    supabase=Depends(get_db),
):
    try:
        current_email = (current_user.email or "").strip().lower()

        pending_response = supabase.table("user_email_change_requests") \
            .select("*") \
            .eq("user_id", current_user.id) \
            .eq("status", "pending") \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()

        if not pending_response.data:
            return {
                "message": "Nenhuma troca de email pendente para finalizar.",
                "email_change_finalized": False,
                "should_logout": False,
            }

        pending = pending_response.data[0]
        expected_email = (pending["new_email"] or "").strip().lower()

        if current_email != expected_email:
            return {
                "message": "A troca de email ainda não foi confirmada.",
                "email_change_finalized": False,
                "should_logout": False,
                "current_email": current_email,
                "expected_email": expected_email,
            }

        google_result = {
            "google_unlinked": False,
            "reason": "Esta troca de email não exige desvincular Google."
        }

        if pending.get("should_unlink_google"):
            google_result = await unlink_google_identity_if_possible(
                access_token=access_token
            )

        supabase.table("user_email_change_requests") \
            .update({
                "status": "completed",
                "google_unlinked": google_result["google_unlinked"],
                "completed_at": utc_now_iso()
            }) \
            .eq("id", pending["id"]) \
            .execute()

        return {
            "message": "Troca de email finalizada com sucesso.",
            "email_change_finalized": True,
            "google_identity": google_result,
            "should_logout": True,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def safe_response_detail(response: httpx.Response):
    try:
        return response.json()
    except Exception:
        return response.text


async def get_user_identities(access_token: str):
    url = f"{SUPABASE_URL}/auth/v1/user/identities"

    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(url, headers=headers)

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=safe_response_detail(response)
        )

    data = response.json()

    if isinstance(data, dict):
        return data.get("identities") or []

    return data or []


async def unlink_google_identity_if_possible(access_token: str):
    identities = await get_user_identities(access_token)

    google_identity = next(
        (
            identity for identity in identities
            if identity.get("provider") == "google"
        ),
        None
    )

    if not google_identity:
        return {
            "google_unlinked": False,
            "reason": "Usuário não possui login Google vinculado."
        }

    if len(identities) < 2:
        return {
            "google_unlinked": False,
            "reason": "Não foi possível remover o Google porque ele é o único método de login do usuário."
        }

    identity_id = google_identity.get("id") or google_identity.get("identity_id")

    if not identity_id:
        return {
            "google_unlinked": False,
            "reason": "Identity Google encontrada, mas sem ID identificável."
        }

    url = f"{SUPABASE_URL}/auth/v1/user/identities/{identity_id}"

    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.delete(url, headers=headers)

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=safe_response_detail(response)
        )

    return {
        "google_unlinked": True,
        "reason": "Login Google desvinculado com sucesso."
    }



    
