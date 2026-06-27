from pydantic import BaseModel
from typing import Optional

class PostProjectUser(BaseModel):
    project_id: str
    user_id: str

class DeleteProjectUser(BaseModel):
    project_id: str
    user_id: str

class UsuarioResumoResponse(BaseModel):
    id: str
    name: str
    email: str | None = None

class ProjectUserResponse(BaseModel):
    id: str
    project_id: str
    user_id: str
    user: UsuarioResumoResponse


class ProjectUserListResponse(BaseModel):
    users: list[ProjectUserResponse]

class DeleteProjectUserResponse(BaseModel):
    deleted: list[dict]