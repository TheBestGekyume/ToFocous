from fastapi import APIRouter, Depends, HTTPException
from backend.dependencies.supabase import get_db
from backend.models.project import PostProject, PatchProject
from backend.dependencies.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/")
def post_project(
    data: PostProject,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:

        postdata = data.model_dump(mode="json")
        postdata["user_id"] = current_user.id

        response = supabase.table("projects").insert(postdata).execute()

        project = response.data[0]

        filtered_response = {
            "id": project["id"],
            "title": project["title"],
            "description": project["description"],
            "color": project["color"]
        }


        return {
            "message": "Projeto criado com sucesso.",
            "data": filtered_response
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/")
def get_projects(
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        response = supabase.table("projects").select("*").execute()

        projects = [
            {
                "id": p["id"],
                "title": p["title"],
                "description": p["description"],
                "color": p["color"]
            }
            for p in response.data
        ]

        return projects

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.patch("/{project_id}")
def patch_project(
    project_id: str,
    data: PatchProject,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        patchdata = data.model_dump(exclude_none=True, mode="json")

        if not patchdata:
            return {"message": "Nenhuma alteração feita"}

        response = supabase.table("projects") \
            .update(patchdata) \
            .eq("id", project_id) \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Projeto não encontrado"
            )

        project = response.data[0]

        return {
            "message": "Projeto atualizado com sucesso.",
            "data": {
                "id": project["id"],
                "title": project["title"],
                "description": project["description"],
                "color": project["color"]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_db)
):
    try:
        response = supabase.table("projects") \
            .delete() \
            .eq("id", project_id) \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Projeto não encontrado"
            )

        return {
            "message": "Projeto deletado com sucesso."
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))