from fastapi import APIRouter, HTTPException
from supabase import create_client

from backend.core.config import settings
from backend.core.responses import ApiResponse, created, success
from backend.models.auth import (
    LoginData,
    LoginResponse,
    MessageResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    SignUpData,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_ANON_KEY,
)


@router.post(
    "/signup/",
    response_model=ApiResponse[MessageResponse],
)
def signup(data: SignUpData):
    supabase.auth.sign_up(
        {
            "email": data.email,
            "password": data.password,
            "options": {
                "data": {
                    "name": data.name,
                }
            },
        }
    )

    return created(
        content=MessageResponse(
            message="Usuário criado com sucesso.",
        ),
        message="Cadastro realizado com sucesso.",
    )


@router.post(
    "/login/",
    response_model=ApiResponse[LoginResponse],
)
def login(data: LoginData):
    try:
        response = supabase.auth.sign_in_with_password(
            {
                "email": data.email,
                "password": data.password,
            }
        )

        if response.user is None or response.session is None:
            raise HTTPException(
                status_code=401,
                detail="Email ou senha inválidos.",
            )

        return success(
            content=LoginResponse(
                access_token=response.session.access_token,
                refresh_token=response.session.refresh_token,
                user_id=response.user.id,
            ),
            message="Login realizado com sucesso.",
        )

    except HTTPException:
        raise

    except Exception as e:
        error_message = str(e)

        if "Email not confirmed" in error_message:
            raise HTTPException(
                status_code=400,
                detail="Confirme seu email antes de entrar.",
            )

        if "Invalid login credentials" in error_message:
            raise HTTPException(
                status_code=401,
                detail="Email ou senha inválidos.",
            )

        raise HTTPException(
            status_code=500,
            detail="Erro interno ao tentar fazer login.",
        )


@router.post(
    "/refresh",
    response_model=ApiResponse[RefreshTokenResponse],
)
def refresh_session(data: RefreshTokenRequest):
    try:
        response = supabase.auth.refresh_session(
            data.refresh_token,
        )

        return success(
            content=RefreshTokenResponse(
                access_token=response.session.access_token,
                refresh_token=response.session.refresh_token,
            ),
            message="Token atualizado com sucesso.",
        )

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Refresh token inválido ou expirado.",
        )