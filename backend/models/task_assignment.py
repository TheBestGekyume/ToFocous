from typing import Optional
from pydantic import BaseModel, model_validator


class PostTaskAssignment(BaseModel):
    assigned_user_id: str
    task_id: Optional[str] = None
    subtask_id: Optional[str] = None

    @model_validator(mode="after")
    def validate_task_or_subtask(self):
        if self.task_id and self.subtask_id:
            raise ValueError("Informe task_id ou subtask_id, não ambos.")

        if not self.task_id and not self.subtask_id:
            raise ValueError("Informe task_id ou subtask_id.")

        return self


class DeleteTaskAssignment(BaseModel):
    assignment_id: str


class UsuarioResumoResponse(BaseModel):
    id: str
    name: str
    email: str | None = None


class TaskAssignmentResponse(BaseModel):
    id: str
    project_id: str
    assigned_user_id: str
    assigned_by_user_id: str
    task_id: str | None = None
    subtask_id: str | None = None
    created_at: str | None = None
    assigned_user: UsuarioResumoResponse
    assigned_by_user: UsuarioResumoResponse | None = None


class TaskAssignmentListResponse(BaseModel):
    assignments: list[TaskAssignmentResponse]


class DeleteTaskAssignmentResponse(BaseModel):
    deleted: list[dict]