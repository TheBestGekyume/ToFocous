from fastapi import APIRouter, Depends, HTTPException
from backend.dependencies.supabase import get_db
from backend.models.task import PostTask, PatchTask
from backend.dependencies.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/")
def post_task(data: PostTask, current_user = Depends(get_current_user),supabase = Depends(get_db)):
    try:
        postdata = data.model_dump(mode="json")
        postdata["user_id"] = current_user.id
        response = supabase.table("tasks").insert(postdata).execute()

        filtered_response = {
            "title": response.data[0]["title"],
            "description": response.data[0]["description"],
            "due_date": response.data[0]["due_date"],
            "start_date": response.data[0]["start_date"],
            "due_time": response.data[0]["due_time"],
            "priority": response.data[0]["priority"],
            "status": response.data[0]["status"]
        }

        return{
            "Message" : "Tarefa criada com sucesso.",
            "data": filtered_response
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
def get_tasks(current_user = Depends(get_current_user),supabase = Depends(get_db)):
    response = supabase.table("tasks").select("*").eq("user_id", current_user.id).execute()
    tasks = response.data
    if not response.data:
        return []

    filtered_tasks = [
            {
                "title": task["title"],
                "description": task["description"],
                "due_date": task["due_date"],
                "start_date": task["start_date"],
                "due_time": task["due_time"],
                "priority": task["priority"],
                "status": task["status"]
            }
            for task in tasks
        ]
    return filtered_tasks


@router.patch("/{task_id}")
def patch_task(task_id: str, data: PatchTask, current_user = Depends(get_current_user),supabase = Depends(get_db)):
    try:
        patchdata = data.model_dump(exclude_none=True, mode="json")

        if not patchdata:
            return {
                "message": "Nenhuma alteração feita"
            }

        response = supabase.table("tasks") \
            .update(patchdata) \
            .eq("id", task_id) \
            .eq("user_id", current_user.id) \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Tarefa não encontrada"
            )


        filtered_response = {
            "title": response.data[0]["title"],
            "description": response.data[0]["description"],
            "due_date": response.data[0]["due_date"],
            "start_date": response.data[0]["start_date"],
            "due_time": response.data[0]["due_time"],
            "priority": response.data[0]["priority"],
            "status": response.data[0]["status"]
        }

        return {
            "message": "Alterações feitas com sucesso.",
            "data": filtered_response
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{task_id}")
def delete_task(task_id: str, current_user = Depends(get_current_user),supabase = Depends(get_db)):
    try:
        response = supabase.table("tasks").delete().eq("id", task_id).eq("user_id", current_user.id).execute()

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Tarefa não encontrada"
            )

        return {
            "message": "Tarefa deletada com sucesso."
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))