from supabase import create_client
from backend.core.config import settings


def get_supabase_client(token: str):
    client = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY
    )

    client.postgrest.auth(token)

    return client