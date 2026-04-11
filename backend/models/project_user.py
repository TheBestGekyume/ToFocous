from pydantic import BaseModel
from typing import Optional

class PostProjectUser(BaseModel):
    project_id: str
    user_id: str

class DeleteProjectUser(BaseModel):
    project_id: str
    user_id: str