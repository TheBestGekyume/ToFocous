from fastapi import APIRouter, Depends, HTTPException
from backend.dependencies.supabase import get_db
from backend.models.subtask import PostSubtask, PatchSubtask
from backend.dependencies.auth import get_current_user

router = APIRouter(prefix="/subtasks", tags=["Subtasks"])


@router.get("/{task_id}")
def get_subtasks(task_id: str, current_user=Depends(get_current_user), supabase=Depends(get_db)):
    try:
        task = supabase.table("tasks").select("id").eq("id", task_id).eq("user_id", current_user.id).execute()

        if not task.data:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada")

        response = supabase.table("subtasks").select("*").eq("task_id", task_id).execute()

        if not response.data:
            return []
        
        filtered_response = [
            {
                "title": subtask["title"],
                "due_time": subtask["due_time"],
                "priority": subtask["priority"],
                "status": subtask["status"]
            }
            for subtask in response.data
        ]

        return filtered_response

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{task_id}")
def post_subtask(data: PostSubtask, task_id: str, current_user= Depends(get_current_user),supabase = Depends(get_db)):
    try:
        task = supabase.table("tasks").select("id").eq("id", task_id).eq("user_id", current_user.id).execute()
        if not task.data:
            raise HTTPException(status_code=404, detail= "Tarefa não encontrada")
        
        settings = supabase.table("user_settings").select("*").eq("user_id",current_user.id).execute()

        user_settings = settings.data[0]

        if user_settings["use_subtask_time"] and data.due_time is None:
            raise HTTPException(400, "Tempo é obrigatório")

        if not user_settings["use_subtask_time"]:
            data.due_time = None

        if not user_settings["use_subtask_priority"]:
            data.priority = None
        

        subtask_data = data.model_dump(mode = "json")
        subtask_data["task_id"] = task_id

        response = supabase.table("subtasks").insert(subtask_data).execute()

        filtered_response = {
            "title": response.data[0]["title"],
            "due_time": response.data[0]["due_time"],
            "priority": response.data[0]["priority"],
            "status": response.data[0]["status"]
        }

        return{
            "message": "Subtarefa criada com sucesso",
            "data": filtered_response
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@router.patch("/{subtask_id}")
def patch_subtask(task_id: str,subtask_id: str,data: PatchSubtask,current_user=Depends(get_current_user),supabase=Depends(get_db)):
    try:
        task = supabase.table("tasks").select("id").eq("id", task_id).eq("user_id", current_user.id).execute()

        if not task.data:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada")

        patchdata = data.model_dump(exclude_none=True, mode="json")

        if not patchdata:
            return {"message": "Nenhuma alteração feita"}

        response = supabase.table("subtasks").update(patchdata).eq("id", subtask_id).eq("task_id", task_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Subtarefa não encontrada")
        
        

        filtered_response = {
            "title": response.data[0]["title"],
            "due_time": response.data[0]["due_time"],
            "priority": response.data[0]["priority"],
            "status": response.data[0]["status"]
        }

        return {
            "message": "Subtarefa atualizada com sucesso",
            "data": filtered_response
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{subtask_id}")
def delete_subtask(task_id: str,subtask_id: str,current_user=Depends(get_current_user),supabase=Depends(get_db)):
    try:
        task = supabase.table("tasks").select("id").eq("id", task_id).eq("user_id", current_user.id).execute()

        if not task.data:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada")

        response = supabase.table("subtasks").delete().eq("id", subtask_id).eq("task_id", task_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Subtarefa não encontrada")

        return {
            "message": "Sub-Tarefa deletada com sucesso"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))