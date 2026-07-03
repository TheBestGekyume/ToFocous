from fastapi import APIRouter
from supabase import create_client

from backend.core.config import settings
from backend.core.excepcions import AppException
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
    status_code=201,
)
def signup(data: SignUpData):
    try:
        email = data.email.strip().lower()
        name = data.name.strip()

        existing_usuario_response = (
            supabase
            .table("usuarios")
            .select("id")
            .eq("email", email)
            .execute()
        )

        if existing_usuario_response.data:
            raise AppException(
                message="Este email já está cadastrado.",
                http_code=409,
                error_code="EMAIL_ALREADY_REGISTERED",
            )

        response = supabase.auth.sign_up(
            {
                "email": email,
                "password": data.password,
                "options": {
                    "data": {
                        "name": name,
                    }
                },
            }
        )

        if response.user is None:
            raise AppException(
                message="Não foi possível cadastrar o usuário.",
                http_code=400,
                error_code="SIGNUP_FAILED",
            )

        identities = getattr(response.user, "identities", None)

        if identities is not None and len(identities) == 0:
            raise AppException(
                message="Este email já está cadastrado.",
                http_code=409,
                error_code="EMAIL_ALREADY_REGISTERED",
            )

        return created(
            content=MessageResponse(
                message="Usuário criado com sucesso.",
            ),
            message="Cadastro realizado com sucesso.",
        )

    except AppException:
        raise

    except Exception as e:
        error_message = str(e).lower()

        if (
            "user already registered" in error_message
            or "already registered" in error_message
            or "already exists" in error_message
            or "email already" in error_message
            or "user_already_exists" in error_message
        ):
            raise AppException(
                message="Este email já está cadastrado.",
                http_code=409,
                error_code="EMAIL_ALREADY_REGISTERED",
            )

        if (
            "password should be at least" in error_message
            or "weak password" in error_message
            or "password" in error_message
            or "senha" in error_message
        ):
            raise AppException(
                message="A senha deve atender aos requisitos mínimos de segurança.",
                http_code=400,
                error_code="WEAK_PASSWORD",
            )

        if "invalid email" in error_message:
            raise AppException(
                message="Email inválido.",
                http_code=400,
                error_code="INVALID_EMAIL",
            )

        raise AppException(
            message="Erro interno ao tentar realizar cadastro.",
            http_code=500,
            error_code="SIGNUP_INTERNAL_ERROR",
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
            raise AppException(
                message="Email ou senha inválidos.",
                http_code=401,
                error_code="INVALID_CREDENTIALS",
            )

        return success(
            content=LoginResponse(
                access_token=response.session.access_token,
                refresh_token=response.session.refresh_token,
                user_id=response.user.id,
            ),
            message="Login realizado com sucesso.",
        )

    except AppException:
        raise

    except Exception as e:
        error_message = str(e)
        error_message_lower = error_message.lower()

        if "email not confirmed" in error_message_lower:
            raise AppException(
                message="Confirme seu email antes de entrar.",
                http_code=400,
                error_code="EMAIL_NOT_CONFIRMED",
            )

        if (
            "invalid login credentials" in error_message_lower
            or "invalid credentials" in error_message_lower
            or "email or password" in error_message_lower
        ):
            raise AppException(
                message="Email ou senha inválidos.",
                http_code=401,
                error_code="INVALID_CREDENTIALS",
            )

        raise AppException(
            message="Erro interno ao tentar fazer login.",
            http_code=500,
            error_code="LOGIN_INTERNAL_ERROR",
        )


@router.post(
    "/refresh/",
    response_model=ApiResponse[RefreshTokenResponse],
)
def refresh_session(data: RefreshTokenRequest):
    try:
        response = supabase.auth.refresh_session(
            data.refresh_token,
        )

        if response.session is None:
            raise AppException(
                message="Refresh token inválido ou expirado.",
                http_code=401,
                error_code="INVALID_REFRESH_TOKEN",
            )

        return success(
            content=RefreshTokenResponse(
                access_token=response.session.access_token,
                refresh_token=response.session.refresh_token,
            ),
            message="Token atualizado com sucesso.",
        )

    except AppException:
        raise

    except Exception:
        raise AppException(
            message="Refresh token inválido ou expirado.",
            http_code=401,
            error_code="INVALID_REFRESH_TOKEN",
        )