from fastapi import APIRouter, Depends

from backend.core.excepcions import AppException
from backend.core.responses import ApiResponse, success
from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db
from backend.models.settings import SettingsResponse, UpdtSettings


router = APIRouter(prefix="/settings", tags=["Settings"])


def build_settings_response(settings_data: dict) -> SettingsResponse:
    return SettingsResponse(
        use_subtask_priority=settings_data.get("use_subtask_priority"),
        which_date_use_in_calendar=settings_data.get("which_date_use_in_calendar"),
        use_time=settings_data.get("use_time"),
        use_start_date=settings_data.get("use_start_date"),
    )


@router.get(
    "/",
    response_model=ApiResponse[SettingsResponse],
)
def get_settings(
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        response = (
            supabase
            .table("task_settings")
            .select("*")
            .eq("user_id", current_user.id)
            .execute()
        )

        if not response.data:
            raise AppException(
                message="Configurações não encontradas.",
                http_code=404,
                error_code="SETTINGS_NOT_FOUND",
            )

        settings_data = response.data[0]

        return success(
            content=build_settings_response(settings_data),
            message="Configurações encontradas com sucesso.",
        )

    except AppException:
        raise

    except Exception:
        raise AppException(
            message="Erro ao buscar configurações.",
            http_code=500,
            error_code="SETTINGS_GET_ERROR",
        )


@router.patch(
    "/",
    response_model=ApiResponse[SettingsResponse],
)
def update_settings(
    data: UpdtSettings,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db),
):
    try:
        update_data = data.model_dump(
            exclude_none=True,
            mode="json",
        )

        if not update_data:
            return success(
                content=None,
                message="Nenhuma alteração feita.",
            )

        existing_response = (
            supabase
            .table("task_settings")
            .select("*")
            .eq("user_id", current_user.id)
            .execute()
        )

        if not existing_response.data:
            raise AppException(
                message="Configurações não encontradas.",
                http_code=404,
                error_code="SETTINGS_NOT_FOUND",
            )

        response = (
            supabase
            .table("task_settings")
            .update(update_data)
            .eq("user_id", current_user.id)
            .execute()
        )

        if not response.data:
            raise AppException(
                message="Não foi possível atualizar as configurações.",
                http_code=400,
                error_code="SETTINGS_UPDATE_ERROR",
            )

        settings_data = response.data[0]

        return success(
            content=build_settings_response(settings_data),
            message="Alterações feitas com sucesso.",
        )

    except AppException:
        raise

    except Exception:
        raise AppException(
            message="Erro ao atualizar configurações.",
            http_code=500,
            error_code="SETTINGS_UPDATE_ERROR",
        )