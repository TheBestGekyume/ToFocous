from fastapi import APIRouter, HTTPException
from backend.models.auth import LoginData, SignUpData
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
            "password": data.password
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

        if response.user is None:
            return {"error": "Credenciais inválidas"}


        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user_id": response.user.id
        }
    
    except Exception as e:
        if "Email not confirmed" in str(e):
            raise HTTPException(status_code=400, detail="Confirme seu email antes de entrar.")