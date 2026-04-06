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