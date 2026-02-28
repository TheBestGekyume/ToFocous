from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.services.supabase_client import get_supabase_client

security = HTTPBearer()


def get_db(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    return get_supabase_client(token)