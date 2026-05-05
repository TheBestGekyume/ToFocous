from fastapi import APIRouter, HTTPException
from backend.models.auth import LoginData, RefreshTokenRequest, SignUpData
from supabase import create_client
from backend.core.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])


supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_ANON_KEY
)


@router.post("/signup")
def signup(data: SignUpData):
    try:
        response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
            "options": {
                "data": {
                    "name": data.name
                }
            }
        })
        return {"message": "Usuário criado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login(data: LoginData):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })

        if response.user is None or response.session is None:
            raise HTTPException(
                status_code=401,
                detail="Email ou senha inválidos."
            )

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user_id": response.user.id
        }

    except HTTPException:
        raise

    except Exception as e:
        error_message = str(e)

        if "Email not confirmed" in error_message:
            raise HTTPException(
                status_code=400,
                detail="Confirme seu email antes de entrar."
            )

        if "Invalid login credentials" in error_message:
            raise HTTPException(
                status_code=401,
                detail="Email ou senha inválidos."
            )

        raise HTTPException(
            status_code=500,
            detail="Erro interno ao tentar fazer login."
        )

@router.post("/refresh")
def refresh_session(data: RefreshTokenRequest):
    try:
        response = supabase.auth.refresh_session(data.refresh_token)

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token
        }

    except Exception as e:
        raise HTTPException(status_code=401, detail="Refresh token inválido ou expirado")