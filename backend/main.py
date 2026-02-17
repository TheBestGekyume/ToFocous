from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, time
from enum import Enum


import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

app = FastAPI()

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

security = HTTPBearer()

class LoginData(BaseModel):
    email: str
    password: str

class SignUpData(BaseModel):
    email: EmailStr
    password: str

class UpdtSettings(BaseModel):
    use_subtask_time: Optional[bool] = None
    use_subtask_priority: Optional[bool] = None



class TaskPriority(str, Enum):
    low = "Baixa"
    medium = "Média"
    high = "Alta"

class TaskStatus(str, Enum):
    unstarted = "Não iniciada"
    inProgress = "Em andamento"
    concluded = "Concluída"


class PostTask(BaseModel):
    title: str
    description: str | None = None
    due_date: date | None = None
    due_time: time | None = None
    priority: TaskPriority
    status: TaskStatus = TaskStatus.unstarted

class PatchTask(BaseModel):
    title: str
    description: str | None = None
    due_date: date | None = None
    due_time: time | None = None
    priority: TaskPriority
    status: TaskStatus



@app.post("/signup")
def signup(data: SignUpData):
    try:

        response = supabase.auth.sign_up({
            "email": data.email,
            "password" : data.password
        })

        return {
            "message" : "Conta criada com sucesso!"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

    


@app.post("/login")
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


def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        return user.user
    except Exception:
        raise HTTPException(status_code=401, detail="token inválido")

@app.get("/me")
def get_me(current_user = Depends(get_current_user)):

        return {
            "id": current_user.id,
            "email": current_user.email
        }


@app.get("/settings")
def get_settings(current_user = Depends(get_current_user)):
    response = supabase.table("user_settings").select("*").eq("user_id", current_user.id).execute()
    settings = response.data[0] 

    return{
        "use_subtask_time": settings["use_subtask_time"],
        "use_subtask_priority": settings["use_subtask_priority"]
    }
        
@app.patch("/settings")
def update_settings(data: UpdtSettings,current_user = Depends(get_current_user)):
    try:
        update_data = data.model_dump(exclude_none=True)

        if not update_data:
            return{
                "message" : "Nenhuma alteração feita"
            }
        
        response = supabase.table("user_settings").update(update_data).eq("user_id", current_user.id).execute()

        return{
            "message" : "Alterações feitas com sucesso.",
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail= str(e))


@app.get("/task")
def get_tasks(current_user = Depends(get_current_user)):
    response = supabase.table("tasks").select("*").eq("user_id", current_user.id).execute()
    tasks = response.data[0]

    return{
        "title": tasks["title"],
        "description": tasks["description"],
        "due_date": tasks["due_date"],
        "due_time": tasks["due_time"],
        "priority": tasks["priority"],
        "status": tasks["status"]
    }

@app.post("/task")
def post_task(data: PostTask, current_user = Depends(get_current_user)):
    try:
        postdata = data.model_dump(mode="json")
        postdata["user_id"] = current_user.id
        response = supabase.table("tasks").insert(postdata).execute()

        return{
            "Message" : "Tarefa criada com sucesso.",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.patch("/task/{task_id}")
def patch_task(task_id: str, data: PatchTask, current_user = Depends(get_current_user)):
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
                detail="Task não encontrada"
            )

        return {
            "message": "Alterações feitas com sucesso.",
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/task/{task_id}")
def delete_task(task_id: str, current_user = Depends(get_current_user)):
    try:
        response = supabase.table("tasks").delete().eq("id", task_id).eq("user_id", current_user.id).execute()

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Task não encontrada"
            )

        return {
            "message": "Task deletada com sucesso."
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
