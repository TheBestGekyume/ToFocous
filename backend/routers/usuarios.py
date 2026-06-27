import httpx

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from backend.core.config import settings
from backend.core.responses import ApiResponse, failure, success
from backend.dependencies.auth import get_current_user, get_bearer_token
from backend.dependencies.supabase import get_db
from backend.models.usuarios import (
    EmailChangeRequestResponse,
    FinalizeEmailChangeResponse,
    GoogleIdentityResultResponse,
    ResetSenha,
    UpdateEmail,
    UpdateSenha,
    UpdateUsuario,
    UpdateUsuarioResponse,
    UsuarioResponse,
)


router = APIRouter(prefix="/usuarios", tags=["Usuários"])

SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_ANON_KEY = settings.SUPABASE_ANON_KEY
FRONTEND_URL = settings.FRONTEND_URL


def api_response(response: ApiResponse):
    return JSONResponse(
        status_code=response.http_code,
        content=jsonable_encoder(response),
    )


@router.get(
    "/me/",
    response_model=ApiResponse[UsuarioResponse],
)
def get_my_user(
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        usuario = get_usuario_by_id(
            user_id=current_user.id,
            supabase=supabase,
        )

        if not usuario:
            return api_response(
                failure(
                    message="Usuário não encontrado.",
                    http_code=404,
                    error_code="USER_NOT_FOUND",
                )
            )

        return api_response(
            success(
                content=UsuarioResponse(
                    id=usuario["id"],
                    name=usuario["name"],
                    email=usuario.get("email"),
                    created_at=usuario.get("created_at"),
                ),
                message="Usuário encontrado com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="USER_GET_ERROR",
            )
        )


@router.patch(
    "/me/",
    response_model=ApiResponse[UpdateUsuarioResponse],
)
def update_my_user(
    data: UpdateUsuario,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        name = data.name.strip()

        if not name:
            return api_response(
                failure(
                    message="O nome não pode ser vazio.",
                    http_code=400,
                    error_code="EMPTY_NAME",
                )
            )

        response = (
            supabase
            .table("usuarios")
            .update({
                "name": name,
            })
            .eq("id", current_user.id)
            .execute()
        )

        if not response.data:
            return api_response(
                failure(
                    message="Usuário não encontrado.",
                    http_code=404,
                    error_code="USER_NOT_FOUND",
                )
            )

        usuario = response.data[0]

        return api_response(
            success(
                content=UpdateUsuarioResponse(
                    id=usuario["id"],
                    name=usuario["name"],
                    email=usuario.get("email"),
                ),
                message="Usuário atualizado com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="USER_UPDATE_ERROR",
            )
        )


@router.patch(
    "/me/password",
    response_model=ApiResponse[None],
)
async def update_my_password(
    data: UpdateSenha,
    current_user=Depends(get_current_user),
    access_token: str = Depends(get_bearer_token),
    supabase=Depends(get_db),
):
    try:
        if data.new_password != data.confirm_new_password:
            return api_response(
                failure(
                    message="A nova senha e a confirmação da nova senha não conferem.",
                    http_code=400,
                    error_code="PASSWORD_CONFIRMATION_MISMATCH",
                )
            )

        if data.current_password == data.new_password:
            return api_response(
                failure(
                    message="A nova senha não pode ser igual à senha atual.",
                    http_code=400,
                    error_code="NEW_PASSWORD_SAME_AS_CURRENT",
                )
            )

        usuario = get_usuario_by_id(
            user_id=current_user.id,
            supabase=supabase,
        )

        if not usuario:
            return api_response(
                failure(
                    message="Usuário não encontrado.",
                    http_code=404,
                    error_code="USER_NOT_FOUND",
                )
            )

        user_email = usuario.get("email")

        if not user_email:
            return api_response(
                failure(
                    message="Não foi possível identificar o email do usuário autenticado.",
                    http_code=400,
                    error_code="USER_EMAIL_NOT_FOUND",
                )
            )

        login_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"

        login_headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
        }

        login_payload = {
            "email": user_email,
            "password": data.current_password,
        }

        async with httpx.AsyncClient(timeout=20) as client:
            login_response = await client.post(
                login_url,
                headers=login_headers,
                json=login_payload,
            )

        if login_response.status_code >= 400:
            return api_response(
                failure(
                    message="Senha atual incorreta.",
                    http_code=400,
                    error_code="CURRENT_PASSWORD_INCORRECT",
                )
            )

        update_url = f"{SUPABASE_URL}/auth/v1/user"

        update_headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        update_payload = {
            "password": data.new_password,
        }

        async with httpx.AsyncClient(timeout=20) as client:
            update_response = await client.put(
                update_url,
                headers=update_headers,
                json=update_payload,
            )

        if update_response.status_code >= 400:
            return api_response(
                failure(
                    message=str(safe_response_detail(update_response)),
                    http_code=update_response.status_code,
                    error_code="PASSWORD_UPDATE_AUTH_ERROR",
                )
            )

        return api_response(
            success(
                content=None,
                message="Senha atualizada com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="PASSWORD_UPDATE_ERROR",
            )
        )


@router.post(
    "/reset-password",
    response_model=ApiResponse[None],
)
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
            return api_response(
                failure(
                    message=str(safe_response_detail(response)),
                    http_code=response.status_code,
                    error_code="PASSWORD_RESET_REQUEST_ERROR",
                )
            )

        return api_response(
            success(
                content=None,
                message="Se o email estiver cadastrado, enviaremos instruções para redefinir a senha.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="PASSWORD_RESET_ERROR",
            )
        )


@router.patch(
    "/me/email",
    response_model=ApiResponse[EmailChangeRequestResponse],
)
async def update_my_email(
    data: UpdateEmail,
    current_user=Depends(get_current_user),
    access_token: str = Depends(get_bearer_token),
    supabase=Depends(get_db),
):
    try:
        usuario = get_usuario_by_id(
            user_id=current_user.id,
            supabase=supabase,
        )

        if not usuario:
            return api_response(
                failure(
                    message="Usuário não encontrado.",
                    http_code=404,
                    error_code="USER_NOT_FOUND",
                )
            )

        new_email = data.email.strip().lower()
        current_email = (usuario.get("email") or "").strip().lower()

        if current_email == new_email:
            return api_response(
                failure(
                    message="O novo email deve ser diferente do email atual.",
                    http_code=400,
                    error_code="EMAIL_SAME_AS_CURRENT",
                )
            )

        identities_result = await get_user_identities(access_token)

        if identities_result["error"]:
            return api_response(
                failure(
                    message=identities_result["message"],
                    http_code=identities_result["http_code"],
                    error_code="USER_IDENTITIES_GET_ERROR",
                )
            )

        identities = identities_result["identities"]

        has_google_identity = any(
            identity.get("provider") == "google"
            for identity in identities
        )

        has_multiple_identities = len(identities) >= 2

        if has_google_identity and not has_multiple_identities:
            return api_response(
                failure(
                    message=(
                        "Não é possível trocar o email agora porque o Google é o único método de login desta conta. "
                        "Adicione/defina um método de login por email e senha antes de trocar o email."
                    ),
                    http_code=400,
                    error_code="GOOGLE_IS_ONLY_LOGIN_METHOD",
                )
            )

        should_unlink_google = has_google_identity and has_multiple_identities

        (
            supabase
            .table("user_email_change_requests")
            .update({
                "status": "cancelled",
                "cancelled_at": utc_now_iso(),
            })
            .eq("user_id", current_user.id)
            .eq("status", "pending")
            .execute()
        )

        pending_response = (
            supabase
            .table("user_email_change_requests")
            .insert({
                "user_id": current_user.id,
                "old_email": current_email,
                "new_email": new_email,
                "status": "pending",
                "should_unlink_google": should_unlink_google,
                "google_unlinked": False,
            })
            .execute()
        )

        if not pending_response.data:
            return api_response(
                failure(
                    message="Não foi possível registrar a solicitação de troca de email.",
                    http_code=400,
                    error_code="EMAIL_CHANGE_REQUEST_CREATE_ERROR",
                )
            )

        pending_id = pending_response.data[0]["id"]

        url = f"{SUPABASE_URL}/auth/v1/user"

        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        params = {
            "redirect_to": f"{FRONTEND_URL}/",
        }

        payload = {
            "email": new_email,
        }

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.put(
                url,
                headers=headers,
                params=params,
                json=payload,
            )

        if response.status_code >= 400:
            (
                supabase
                .table("user_email_change_requests")
                .update({
                    "status": "cancelled",
                    "cancelled_at": utc_now_iso(),
                })
                .eq("id", pending_id)
                .execute()
            )

            return api_response(
                failure(
                    message=str(safe_response_detail(response)),
                    http_code=response.status_code,
                    error_code="EMAIL_UPDATE_AUTH_ERROR",
                )
            )

        return api_response(
            success(
                content=EmailChangeRequestResponse(
                    new_email=new_email,
                    should_unlink_google_after_confirmation=should_unlink_google,
                    should_finalize_after_redirect=True,
                ),
                message="Solicitação de troca de email enviada. Verifique o email para confirmar a alteração.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="EMAIL_UPDATE_ERROR",
            )
        )


@router.post(
    "/me/email/finalize",
    response_model=ApiResponse[FinalizeEmailChangeResponse],
)
async def finalize_email_change(
    current_user=Depends(get_current_user),
    access_token: str = Depends(get_bearer_token),
    supabase=Depends(get_db),
):
    try:
        current_email = (current_user.email or "").strip().lower()

        pending_response = (
            supabase
            .table("user_email_change_requests")
            .select("*")
            .eq("user_id", current_user.id)
            .eq("status", "pending")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if not pending_response.data:
            return api_response(
                success(
                    content=FinalizeEmailChangeResponse(
                        email_change_finalized=False,
                        should_logout=False,
                    ),
                    message="Nenhuma troca de email pendente para finalizar.",
                )
            )

        pending = pending_response.data[0]
        expected_email = (pending["new_email"] or "").strip().lower()

        if current_email != expected_email:
            return api_response(
                success(
                    content=FinalizeEmailChangeResponse(
                        email_change_finalized=False,
                        should_logout=False,
                        current_email=current_email,
                        expected_email=expected_email,
                    ),
                    message="A troca de email ainda não foi confirmada.",
                )
            )

        google_result = {
            "google_unlinked": False,
            "reason": "Esta troca de email não exige desvincular Google.",
        }

        if pending.get("should_unlink_google"):
            unlink_result = await unlink_google_identity_if_possible(
                access_token=access_token,
            )

            if unlink_result["error"]:
                return api_response(
                    failure(
                        message=unlink_result["message"],
                        http_code=unlink_result["http_code"],
                        error_code="GOOGLE_IDENTITY_UNLINK_ERROR",
                    )
                )

            google_result = unlink_result["google_identity"]

        (
            supabase
            .table("usuarios")
            .update({
                "email": current_email,
            })
            .eq("id", current_user.id)
            .execute()
        )

        (
            supabase
            .table("user_email_change_requests")
            .update({
                "status": "completed",
                "google_unlinked": google_result["google_unlinked"],
                "completed_at": utc_now_iso(),
            })
            .eq("id", pending["id"])
            .execute()
        )

        return api_response(
            success(
                content=FinalizeEmailChangeResponse(
                    email_change_finalized=True,
                    google_identity=GoogleIdentityResultResponse(
                        google_unlinked=google_result["google_unlinked"],
                        reason=google_result["reason"],
                    ),
                    should_logout=True,
                ),
                message="Troca de email finalizada com sucesso.",
            )
        )

    except Exception as e:
        return api_response(
            failure(
                message=str(e),
                http_code=400,
                error_code="EMAIL_CHANGE_FINALIZE_ERROR",
            )
        )


def get_usuario_by_id(
    user_id: str,
    supabase,
) -> dict | None:
    response = (
        supabase
        .table("usuarios")
        .select("id, name, email, created_at")
        .eq("id", user_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def safe_response_detail(response: httpx.Response):
    try:
        return response.json()
    except Exception:
        return response.text


async def get_user_identities(access_token: str) -> dict:
    url = f"{SUPABASE_URL}/auth/v1/user/identities"

    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            url,
            headers=headers,
        )

    if response.status_code >= 400:
        return {
            "error": True,
            "http_code": response.status_code,
            "message": str(safe_response_detail(response)),
            "identities": [],
        }

    data = response.json()

    if isinstance(data, dict):
        identities = data.get("identities") or []
    else:
        identities = data or []

    return {
        "error": False,
        "http_code": 200,
        "message": "Identidades encontradas com sucesso.",
        "identities": identities,
    }


async def unlink_google_identity_if_possible(access_token: str) -> dict:
    identities_result = await get_user_identities(access_token)

    if identities_result["error"]:
        return {
            "error": True,
            "http_code": identities_result["http_code"],
            "message": identities_result["message"],
            "google_identity": None,
        }

    identities = identities_result["identities"]

    google_identity = next(
        (
            identity for identity in identities
            if identity.get("provider") == "google"
        ),
        None,
    )

    if not google_identity:
        return {
            "error": False,
            "http_code": 200,
            "message": "Usuário não possui login Google vinculado.",
            "google_identity": {
                "google_unlinked": False,
                "reason": "Usuário não possui login Google vinculado.",
            },
        }

    if len(identities) < 2:
        return {
            "error": False,
            "http_code": 200,
            "message": "Não foi possível remover o Google porque ele é o único método de login do usuário.",
            "google_identity": {
                "google_unlinked": False,
                "reason": "Não foi possível remover o Google porque ele é o único método de login do usuário.",
            },
        }

    identity_id = google_identity.get("id") or google_identity.get("identity_id")

    if not identity_id:
        return {
            "error": False,
            "http_code": 200,
            "message": "Identity Google encontrada, mas sem ID identificável.",
            "google_identity": {
                "google_unlinked": False,
                "reason": "Identity Google encontrada, mas sem ID identificável.",
            },
        }

    url = f"{SUPABASE_URL}/auth/v1/user/identities/{identity_id}"

    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.delete(
            url,
            headers=headers,
        )

    if response.status_code >= 400:
        return {
            "error": True,
            "http_code": response.status_code,
            "message": str(safe_response_detail(response)),
            "google_identity": None,
        }

    return {
        "error": False,
        "http_code": 200,
        "message": "Login Google desvinculado com sucesso.",
        "google_identity": {
            "google_unlinked": True,
            "reason": "Login Google desvinculado com sucesso.",
        },
    }