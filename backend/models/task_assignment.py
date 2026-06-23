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