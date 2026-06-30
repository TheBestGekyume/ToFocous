from pydantic import BaseModel
from typing import Optional


class PostProject(BaseModel):
    title: str
    description: Optional[str] = None
    color: Optional[str] = None


class PatchProject(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    title: str
    description: str | None = None
    color: str | None = None
    is_owner: bool


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]


class DeleteProjectResponse(BaseModel):
    deleted: list[dict]