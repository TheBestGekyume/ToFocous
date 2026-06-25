import httpx
from fastapi import APIRouter, Depends, HTTPException

from backend.core.config import settings
from backend.dependencies.auth import get_current_user
from backend.dependencies.supabase import get_db
from backend.models.task_assignment import PostTaskAssignment, DeleteTaskAssignment

router = APIRouter(prefix="/task-assignments", tags=["Task Assignments"])

SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY = settings.SUPABASE_SERVICE_ROLE_KEY


@router.get("/project/{project_id}/")
async def get_project_task_assignments(
    project_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        project = get_project_or_404(project_id, supabase)

        if not is_project_member(project_id, current_user.id, supabase):
            raise HTTPException(
                status_code=403,
                detail="Você não tem acesso a este projeto."
            )

        response = supabase.table("task_assignments") \
            .select("id, project_id, assigned_user_id, assigned_by_user_id, task_id, subtask_id, created_at") \
            .eq("project_id", project_id) \
            .execute()

        assignments = []

        for assignment in response.data:
            assigned_auth_user = await get_auth_user_by_id(assignment["assigned_user_id"])
            assigned_display_name = get_display_name_from_auth_user(assigned_auth_user)

            assigned_by_auth_user = await get_auth_user_by_id(assignment["assigned_by_user_id"])
            assigned_by_display_name = get_display_name_from_auth_user(assigned_by_auth_user)

            assignments.append({
                **assignment,
                "assigned_user": {
                    "id": assigned_auth_user.get("id"),
                    "name": assigned_display_name
                },
                "assigned_by_user": {
                    "id": assigned_by_auth_user.get("id"),
                    "name": assigned_by_display_name
                }
            })

        return {
            "message": "Atribuições do projeto listadas com sucesso.",
            "data": assignments
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/task/{task_id}/")
async def get_task_assignments(
    task_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        task = get_task_or_404(task_id, supabase)
        project_id = task["project_id"]

        if not is_project_member(project_id, current_user.id, supabase):
            raise HTTPException(
                status_code=403,
                detail="Você não tem acesso a esta task."
            )

        response = supabase.table("task_assignments") \
            .select("id, project_id, assigned_user_id, assigned_by_user_id, task_id, subtask_id, created_at") \
            .eq("task_id", task_id) \
            .execute()

        assignments = []

        for assignment in response.data:
            auth_user = await get_auth_user_by_id(assignment["assigned_user_id"])
            display_name = get_display_name_from_auth_user(auth_user)

            assignments.append({
                **assignment,
                "assigned_user": {
                    "id": auth_user.get("id"),
                    "name": display_name
                }
            })

        return {
            "message": "Atribuições da task listadas com sucesso.",
            "data": assignments
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/subtask/{subtask_id}/")
async def get_subtask_assignments(
    subtask_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        subtask = get_subtask_or_404(subtask_id, supabase)
        task = get_task_or_404(subtask["task_id"], supabase)
        project_id = task["project_id"]

        if not is_project_member(project_id, current_user.id, supabase):
            raise HTTPException(
                status_code=403,
                detail="Você não tem acesso a esta subtask."
            )

        response = supabase.table("task_assignments") \
            .select("id, project_id, assigned_user_id, assigned_by_user_id, task_id, subtask_id, created_at") \
            .eq("subtask_id", subtask_id) \
            .execute()

        assignments = []

        for assignment in response.data:
            auth_user = await get_auth_user_by_id(assignment["assigned_user_id"])
            display_name = get_display_name_from_auth_user(auth_user)

            assignments.append({
                **assignment,
                "assigned_user": {
                    "id": auth_user.get("id"),
                    "name": display_name
                }
            })

        return {
            "message": "Atribuições da subtask listadas com sucesso.",
            "data": assignments
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/")
async def add_task_assignment(
    data: PostTaskAssignment,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        project_id = resolve_assignment_project_id(
            task_id=data.task_id,
            subtask_id=data.subtask_id,
            supabase=supabase
        )

        project = get_project_or_404(project_id, supabase)

        if project["user_id"] != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Apenas o dono do projeto pode atribuir membros a tasks ou subtasks."
            )

        if not is_project_member(project_id, data.assigned_user_id, supabase):
            raise HTTPException(
                status_code=400,
                detail="O usuário atribuído precisa pertencer ao projeto."
            )

        duplicate_query = supabase.table("task_assignments") \
            .select("id") \
            .eq("assigned_user_id", data.assigned_user_id)

        if data.task_id:
            duplicate_query = duplicate_query.eq("task_id", data.task_id)

        if data.subtask_id:
            duplicate_query = duplicate_query.eq("subtask_id", data.subtask_id)

        duplicate_response = duplicate_query.execute()

        if duplicate_response.data:
            raise HTTPException(
                status_code=409,
                detail="Este usuário já está atribuído a este item."
            )

        auth_user = await get_auth_user_by_id(data.assigned_user_id)
        display_name = get_display_name_from_auth_user(auth_user)

        insert_data = {
            "project_id": project_id,
            "assigned_user_id": data.assigned_user_id,
            "assigned_by_user_id": current_user.id,
            "task_id": data.task_id,
            "subtask_id": data.subtask_id
        }

        response = supabase.table("task_assignments") \
            .insert(insert_data) \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=400,
                detail="Não foi possível criar a atribuição."
            )

        return {
            "message": "Usuário atribuído com sucesso.",
            "data": {
                **response.data[0],
                "assigned_user": {
                    "id": auth_user.get("id"),
                    "name": display_name
                }
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/")
def remove_task_assignment(
    data: DeleteTaskAssignment,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        assignment_response = supabase.table("task_assignments") \
            .select("id, project_id, assigned_user_id, task_id, subtask_id") \
            .eq("id", data.assignment_id) \
            .execute()

        if not assignment_response.data:
            raise HTTPException(
                status_code=404,
                detail="Atribuição não encontrada."
            )

        assignment = assignment_response.data[0]
        project = get_project_or_404(assignment["project_id"], supabase)

        if project["user_id"] != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Apenas o dono do projeto pode remover atribuições."
            )

        response = supabase.table("task_assignments") \
            .delete() \
            .eq("id", data.assignment_id) \
            .execute()

        return {
            "message": "Atribuição removida com sucesso.",
            "data": response.data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def resolve_assignment_project_id(task_id: str | None, subtask_id: str | None, supabase):
    if task_id and subtask_id:
        raise HTTPException(
            status_code=400,
            detail="Informe task_id ou subtask_id, não ambos."
        )

    if not task_id and not subtask_id:
        raise HTTPException(
            status_code=400,
            detail="Informe task_id ou subtask_id."
        )

    if task_id:
        task = get_task_or_404(task_id, supabase)
        return task["project_id"]

    subtask = get_subtask_or_404(subtask_id, supabase)
    task = get_task_or_404(subtask["task_id"], supabase)

    return task["project_id"]


def get_project_or_404(project_id: str, supabase):
    response = supabase.table("projects") \
        .select("id, user_id") \
        .eq("id", project_id) \
        .execute()

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Projeto não encontrado."
        )

    return response.data[0]


def get_task_or_404(task_id: str, supabase):
    response = supabase.table("tasks") \
        .select("id, project_id, user_id") \
        .eq("id", task_id) \
        .execute()

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Task não encontrada."
        )

    return response.data[0]


def get_subtask_or_404(subtask_id: str, supabase):
    response = supabase.table("subtasks") \
        .select("id, task_id") \
        .eq("id", subtask_id) \
        .execute()

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Subtask não encontrada."
        )

    return response.data[0]


def is_project_member(project_id: str, user_id: str, supabase):
    project_response = supabase.table("projects") \
        .select("id, user_id") \
        .eq("id", project_id) \
        .execute()

    if not project_response.data:
        return False

    project = project_response.data[0]

    if project["user_id"] == user_id:
        return True

    membership_response = supabase.table("project_users") \
        .select("id") \
        .eq("project_id", project_id) \
        .eq("user_id", user_id) \
        .execute()

    return len(membership_response.data) > 0


def safe_response_detail(response: httpx.Response):
    try:
        return response.json()
    except Exception:
        return response.text


async def get_auth_user_by_id(user_id: str):
    url = f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}"

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(url, headers=headers)

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=safe_response_detail(response)
        )

    return response.json()


def get_display_name_from_auth_user(auth_user: dict):
    user_metadata = auth_user.get("user_metadata") or {}

    return (
        user_metadata.get("display_name")
        or user_metadata.get("name")
        or user_metadata.get("full_name")
        or "Usuário sem nome"
    )