from fastapi import APIRouter, Depends, HTTPException
from backend.dependencies import supabase
from backend.models import settings
from backend.models.settings import UpdtSettings
from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db 

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/")
def get_settings(current_user = Depends(get_current_user),supabase = Depends(get_db)):
    response = supabase.table("user_settings").select("*").eq("user_id", current_user.id).execute()
    settings = response.data[0] 

    return{
        "use_subtask_time": settings["use_subtask_time"],
        "use_subtask_priority": settings["use_subtask_priority"],
        "which_date_use_in_calendar": settings["which_date_use_in_calendar"]
        
    }


@router.patch("/")
def update_settings(data: UpdtSettings,current_user = Depends(get_current_user),supabase = Depends(get_db)):
    try:
        update_data = data.model_dump(exclude_none=True)

        if not update_data:
            return{
                "message" : "Nenhuma alteração feita"
            }
        
        response = supabase.table("user_settings").update(update_data).eq("user_id", current_user.id).execute()

        return{
            "message" : "Alterações feitas com sucesso.",
            "use_subtask_time": response.data[0]["use_subtask_time"],
            "use_subtask_priority": response.data[0]["use_subtask_priority"],
            "which_date_use_in_calendar": response.data[0]["which_date_use_in_calendar"]
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail= str(e))